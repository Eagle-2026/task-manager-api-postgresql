import express = require("express");

import type { Request, Response } from "express";

import {
  getMe,
  getAllUsers,
  deleteUser,
  updateProfileImage,
  updateMe,
} from "../controllers/userController";

import { protect } from "../middleware/authMiddleware";

import { restrictTo } from "../middleware/roleMiddleware";

import { uploadProfileImage } from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/", protect, restrictTo("admin"), getAllUsers);

router.delete("/:id", protect, restrictTo("admin"), deleteUser);

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);


router.post(
  "/upload-test",
  uploadProfileImage,
  (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",

      file: {
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
      },
    });
  },
);

router.patch(
  "/me/profile-image",
  protect,
  uploadProfileImage,
  updateProfileImage,
);

export = router;
