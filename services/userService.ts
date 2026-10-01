import type { Logger } from "pino";

import * as userRepository from "../repositories/userRepository";

import * as cloudinaryService from "./cloudinaryService";

import AppError = require("../utils/appError");

import type {
  UserId,
} from "../types/user.types";

// ========================================
// GET ALL USERS
// ========================================

export const getAllUsers = async () => {
  return userRepository.findAll();
};

// ========================================
// DELETE USER
// ========================================

export const deleteUser = async (
  userId: UserId,
) => {
  const user =
    await userRepository.deleteById(
      userId,
    );

  if (!user) {
    throw new AppError(
      "User not found",
      404,
    );
  }

  return user;
};

// ========================================
// UPDATE PROFILE IMAGE
// ========================================

export const updateProfileImage = async (
  userId: UserId,
  file: Express.Multer.File | undefined,
  log?: Logger,
) => {
  if (!file) {
    throw new AppError(
      "Please upload an image.",
      400,
    );
  }

  const user =
    await userRepository.findById(
      userId,
    );

  if (!user) {
    throw new AppError(
      "User not found.",
      404,
    );
  }

  const oldPublicId =
    user.profile_image_public_id;

  const uploaded =
    await cloudinaryService.uploadImage(
      file.buffer,
    );

  let updatedUser;

  try {
    updatedUser =
      await userRepository.updateProfileImage(
        userId,
        {
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        },
      );
  } catch (error: unknown) {
    try {
      await cloudinaryService.deleteImage(
        uploaded.public_id,
      );
    } catch (cleanupError: unknown) {
      log?.error(
        {
          userId,
          err: cleanupError,
        },
        "Failed to clean up uploaded image",
      );
    }

    throw error;
  }

  if (oldPublicId) {
    try {
      await cloudinaryService.deleteImage(
        oldPublicId,
      );
    } catch (error: unknown) {
      log?.warn(
        {
          userId,
          oldPublicId,
          err: error,
        },
        "Failed to delete old profile image",
      );
    }
  }

  return updatedUser;
};


type UpdateMeData = {
  name?: string;
  email?: string;
};

// ========================================
// UPDATE CURRENT USER
// ========================================

export const updateMe = async (
  userId: UserId,
  data: UpdateMeData,
) => {
  if (
    data.name === undefined &&
    data.email === undefined
  ) {
    throw new AppError(
      "Please provide a name or email to update",
      400,
    );
  }

  const user =
    await userRepository.updateMe(
      userId,
      data,
    );

  if (!user) {
    throw new AppError(
      "User not found",
      404,
    );
  }

  return user;
};