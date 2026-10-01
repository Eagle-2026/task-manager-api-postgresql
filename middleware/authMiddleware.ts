import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt = require("jsonwebtoken");

import AppError = require("../utils/appError");

import {
  findById,
} from "../repositories/userRepository";

// ========================================
// PROTECT ROUTE
// ========================================

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let accessToken: string | undefined;

    // 1. Get access token from cookie
    if (req.cookies.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    // 2. No access token
    if (!accessToken) {
      throw new AppError(
        "You are not logged in",
        401,
      );
    }

    // 3. Make sure JWT secret exists
    const secret =
      process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is missing",
      );
    }

    // 4. Verify access token
    const decoded = jwt.verify(
      accessToken,
      secret,
    );

    // jwt.verify() can return a string or object.
    // We expect an object with a string id.
    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string"
    ) {
      throw new AppError(
        "Invalid access token",
        401,
      );
    }

    // 5. Convert JWT id from string to number
    const userId = Number(decoded.id);

    if (Number.isNaN(userId)) {
      throw new AppError(
        "Invalid access token",
        401,
      );
    }

    // 6. Find user in PostgreSQL
    const currentUser =
      await findById(userId);

    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token no longer exists",
        401,
      );
    }

    // 7. Put authenticated user on request
    req.user = currentUser;

    // 8. Continue
    next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(
      new AppError(
        "Invalid or expired access token",
        401,
      ),
    );
  }
};