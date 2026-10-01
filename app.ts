import express = require("express");

import helmet from "helmet";

import cors = require("cors");

import cookieParser = require("cookie-parser");

import { rateLimit } from "express-rate-limit";

import pinoHttp from "pino-http";

import { randomUUID } from "node:crypto";

import swaggerUi = require("swagger-ui-express");

import pool from "./config/db";

// ========================================
// ROUTES
// ========================================

import authRoutes = require("./routes/authRoutes");

import userRoutes = require("./routes/userRoutes");

import taskRoutes = require("./routes/taskRoutes");

// ========================================
// ERROR HANDLER
// ========================================

import errorHandler = require("./middleware/errorMiddleware");

// ========================================
// LOGGER
// ========================================

import logger = require("./utils/logger");

// ========================================
// SWAGGER
// ========================================

import swaggerSpec = require("./docs/swagger");

const app = express();

// ========================================
// LOGGER
// ========================================

app.use(
  pinoHttp({
    logger,

    // Create / reuse request ID
    genReqId(req, res) {
      const existingId = req.headers["x-request-id"];

      const id =
        typeof existingId === "string"
          ? existingId
          : randomUUID();

      res.setHeader("X-Request-Id", id);

      return id;
    },

    // Choose log level based on response
    customLogLevel(req, res, err) {
      if (err || res.statusCode >= 500) {
        return "error";
      }

      if (res.statusCode >= 400) {
        return "warn";
      }

      return "info";
    },

    // Keep request logs short
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },

      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ========================================
// HELMET
// ========================================

app.use(helmet());

// ========================================
// CORS
// ========================================

const allowedOrigins = [
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(
  (origin): origin is string =>
    Boolean(origin),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "Not allowed by CORS",
        ),
      );
    },

    credentials: true,
  }),
);

// ========================================
// RATE LIMITING
// ========================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 100,

  standardHeaders: true,

  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ========================================
// REQUEST SIZE LIMIT
// ========================================

app.use(
  express.json({
    limit: "10kb",
  }),
);

// ========================================
// COOKIE PARSER
// ========================================

app.use(cookieParser());

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Task Manager Api is working",
  });
});

// ========================================
// HEALTH CHECK
// ========================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      status: "success",
      message:
        "Backend is running",
    });
  },
);

// ========================================
// POSTGRESQL TEST ROUTE
// ========================================

app.get(
  "/test-postgres",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW() AS current_time",
        );

      res.json({
        status: "success",
        data: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          "Database connection failed",
      });
    }
  },
);

// ========================================
// ROUTES
// ========================================

app.use(
  "/api/v1/auth",
  authRoutes,
);

app.use(
  "/api/v1/users",
  userRoutes,
);

app.use(
  "/api/v1/tasks",
  taskRoutes,
);

// ========================================
// SWAGGER API DOCUMENTATION
// ========================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

// Must remain after routes.
app.use(errorHandler);

export = app;