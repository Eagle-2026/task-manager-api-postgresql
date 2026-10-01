import { PassThrough } from "node:stream";

import type {
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

import cloudinary = require("../config/cloudinary");

// ========================================
// UPLOAD IMAGE
// ========================================

export const uploadImage = (
  buffer: Buffer,
  options: UploadApiOptions = {},
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "task-manager/profile-images",
          ...options,
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(
              new Error(
                "Cloudinary upload returned no result",
              ),
            );
          }

          resolve(result);
        },
      );

    const bufferStream =
      new PassThrough();

    bufferStream.end(buffer);

    bufferStream.pipe(uploadStream);
  });
};

// ========================================
// DELETE IMAGE
// ========================================

export const deleteImage = async (
  publicId: string,
) => {
  return cloudinary.uploader.destroy(
    publicId,
  );
};