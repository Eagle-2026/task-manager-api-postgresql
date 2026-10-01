import express = require("express");

import {
  signup,
  login,
  logout,
  refresh,
} from "../controllers/authController";

import validate = require(
  "../middleware/validationMiddleware"
);

import {
  signupSchema,
  loginSchema,
} from "../validators/authValidators";

import loginLimiter = require(
  "../middleware/rateLimitMiddleware"
);

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: adam@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 */

router.post(
  "/signup",
  validate(signupSchema),
  signup,
);

router.post(
  "/login",
  validate(loginSchema),
  loginLimiter,
  login,
);

router.post(
  "/refresh",
  refresh,
);

router.post(
  "/logout",
  logout,
);

export = router;