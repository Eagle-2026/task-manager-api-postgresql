import bcrypt = require("bcrypt");
import asyncHandler = require("express-async-handler");
import type { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import jwt = require("jsonwebtoken");
import crypto = require("node:crypto");

import type { UserType } from "../types/user.types";

import {
  create,
  findByEmailWithPassword,
  findById,
} from "../repositories/userRepository";

import {
  createSession,
  findActiveByRefreshTokenHash,
  rotateSession,
  revokeByRefreshTokenHash,
} from "../repositories/sessionRepository";

import AppError = require("../utils/appError");

import type {
  SignupInput,
  LoginInput,
} from "../validators/authValidators";

// ========================================
// REQUEST TYPES
// ========================================

type SignupRequest = Request<{}, {}, SignupInput>;

type LoginRequest = Request<{}, {}, LoginInput>;

// ========================================
// ENVIRONMENT VARIABLE HELPER
// ========================================

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is missing`);
  }

  return value;
};

// ========================================
// HASH REFRESH TOKEN
// ========================================

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ========================================
// CREATE ACCESS TOKEN
// ========================================

const signAccessToken = (id: number): string => {
  const secret = getRequiredEnv("ACCESS_TOKEN_SECRET");

  const expiresIn = getRequiredEnv(
    "ACCESS_TOKEN_EXPIRES_IN",
  ) as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: id.toString(),
    },

    secret,

    {
      expiresIn,

      jwtid: crypto.randomUUID(),
    },
  );
};

// ========================================
// CREATE REFRESH TOKEN
// ========================================

const signRefreshToken = (id: number): string => {
  const secret = getRequiredEnv("REFRESH_TOKEN_SECRET");

  const expiresIn = getRequiredEnv(
    "REFRESH_TOKEN_EXPIRES_IN",
  ) as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: id.toString(),
    },

    secret,

    {
      expiresIn,

      jwtid: crypto.randomUUID(),
    },
  );
};

// ========================================
// CREATE TOKENS + SESSION + COOKIES
// ========================================

const createSendToken = async (
  user: UserType,
  statusCode: number,
  res: Response,
): Promise<void> => {
  const accessToken = signAccessToken(user.id);

  const refreshToken = signRefreshToken(user.id);

  const refreshTokenHash = hashToken(refreshToken);

  await createSession(
    user.id,
    refreshTokenHash,
    new Date(Date.now() + 5 * 60 * 1000),
  );

  // Access-token cookie
  res.cookie("accessToken", accessToken, {
    maxAge: 30 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  // Refresh-token cookie
  res.cookie("refreshToken", refreshToken, {
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  const {
    password: _password,
    ...safeUser
  } = user;

  res.status(statusCode).json({
    status: "success",
    data: {
      user: safeUser,
    },
  });
};

// ========================================
// REFRESH ACCESS + REFRESH TOKENS
// ========================================

export const refresh = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Read refresh token
    const refreshToken =
      req.cookies.refreshToken as
        | string
        | undefined;

    if (!refreshToken) {
      res.status(401).json({
        status: "fail",
        message: "Refresh token not found",
      });

      return;
    }

    // 2. Get refresh-token secret
    const refreshSecret =
      getRequiredEnv(
        "REFRESH_TOKEN_SECRET",
      );

    // 3. Verify refresh-token JWT
    const decoded = jwt.verify(
      refreshToken,
      refreshSecret,
    );

    // Make sure decoded token is an object
    // and contains a string id
    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string"
    ) {
      throw new AppError(
        "Invalid refresh token",
        401,
      );
    }

    // 4. Hash incoming refresh token
    const refreshTokenHash =
      hashToken(refreshToken);

    // 5. Find active PostgreSQL session
    const session =
      await findActiveByRefreshTokenHash(
        refreshTokenHash,
      );

    if (!session) {
      res.status(401).json({
        status: "fail",
        message: "Invalid refresh session",
      });

      return;
    }

    // 6. Check session expiration
    if (
      session.expires_at <
      new Date()
    ) {
      res.status(401).json({
        status: "fail",
        message: "Refresh session expired",
      });

      return;
    }

    // 7. Convert JWT user id from string to number
    const userId =
      Number(decoded.id);

    // Make sure conversion worked
    if (Number.isNaN(userId)) {
      throw new AppError(
        "Invalid refresh token",
        401,
      );
    }

    // 8. Find user in PostgreSQL
    const user =
      await findById(userId);

    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "User no longer exists",
      });

      return;
    }

    // 9. Make sure session belongs to this user
    if (
      session.user_id !==
      user.id
    ) {
      res.status(401).json({
        status: "fail",
        message: "Invalid refresh session",
      });

      return;
    }

    // 10. Create new access token
    const newAccessToken =
      signAccessToken(user.id);

    // 11. Create new refresh token
    const newRefreshToken =
      signRefreshToken(user.id);

    // 12. Hash new refresh token
    const newRefreshTokenHash =
      hashToken(
        newRefreshToken,
      );

    // 13. Rotate session in PostgreSQL
    await rotateSession(
      session.id,
      newRefreshTokenHash,
      new Date(
        Date.now() +
          5 * 60 * 1000,
      ),
    );

    // 14. Store new access token cookie
    res.cookie(
      "accessToken",
      newAccessToken,
      {
        maxAge: 30 * 1000,
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
      },
    );

    // 15. Store new refresh token cookie
    res.cookie(
      "refreshToken",
      newRefreshToken,
      {
        maxAge:
          5 * 60 * 1000,
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
      },
    );

    // 16. Send response
    res.status(200).json({
      status: "success",
      message:
        "Tokens refreshed successfully",
    });
  },
);

// ========================================
// SIGNUP
// ========================================

export const signup = asyncHandler(
  async (req: SignupRequest, res: Response) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await create(name, email, hashedPassword, "user");

    await createSendToken(user, 201, res);
  },
);

// ========================================
// LOGIN
// ========================================

export const login = asyncHandler(async (req: LoginRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await findByEmailWithPassword(email);

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(password, user.password))
  ) {
    res.status(401).json({
      status: "fail",
      message: "Incorrect email or password",
    });

    return;
  }

  await createSendToken(user, 200, res);
});

// ========================================
// LOGOUT
// ========================================

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

if (refreshToken) {
  const refreshTokenHash =
    hashToken(refreshToken);

  await revokeByRefreshTokenHash(
    refreshTokenHash,
  );
}

  res.cookie("accessToken", "", {
    httpOnly: true,

    expires: new Date(0),

    secure: process.env.NODE_ENV === "production",
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,

    expires: new Date(0),

    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",

    message: "Logged out successfully",
  });
});
