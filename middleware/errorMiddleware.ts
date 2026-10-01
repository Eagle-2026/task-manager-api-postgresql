// const errorHandler = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// };

// module.exports = errorHandler;
// const errorHandler = (err, req, res, next) => {
//   console.log("===== GLOBAL ERROR =====");
//   console.log("NAME:", err.name);
//   console.log("MESSAGE:", err.message);
//   console.log("PATH:", err.path);
//   console.log("VALUE:", err.value);
//   console.log("STACK:", err.stack);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   // MongoDB CastError
//   if (err.name === "CastError") {
//     err.statusCode = 400;
//     err.status = "fail";

//     // Don't hide the real error while debugging
//     err.message = `Invalid value "${err.value}" for field "${err.path}"`;
//   }

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     ...(err.errors && { errors: err.errors }),
//   });
// };

// module.exports = errorHandler;

// ==============================
// // after logging course we add in place of console
// const errorHandler = (err, req, res, next) => {
//   // ========================================
//   // DEFAULT ERROR VALUES
//   // ========================================
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   // ========================================
//   // MONGODB CAST ERROR
//   // ========================================
//   if (err.name === "CastError") {
//     err.statusCode = 400;
//     err.status = "fail";
//     err.message = `Invalid value "${err.value}" for field "${err.path}"`;
//   }

//   // ========================================
//   // ERROR LOGGING
//   // ========================================
//   if (err.statusCode >= 500) {
//     req.log.error(
//       {
//         err,
//       },
//       "Unexpected server error"
//     );
//   } else {
//     req.log.warn(
//       {
//         statusCode: err.statusCode,
//         message: err.message,
//       },
//       "Request failed"
//     );
//   }

//   // ========================================
//   // PRODUCTION 500 ERROR
//   // ========================================
//   // Do not expose internal server details
//   // to users in production.
//   if (
//     process.env.NODE_ENV === "production" &&
//     err.statusCode >= 500
//   ) {
//     return res.status(500).json({
//       status: "error",
//       message: "Something went wrong",
//     });
//   }

//   // ========================================
//   // SEND NORMAL ERROR RESPONSE
//   // ========================================
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     ...(err.errors && { errors: err.errors }),
//   });
// };

// module.exports = errorHandler;

// // ============================
// // use typescript now
import type { NextFunction, Request, Response } from "express";

// ========================================
// ERROR TYPE
// ========================================

interface ApiError extends Error {
  statusCode?: number;

  status?: "fail" | "error";

  path?: string;

  value?: unknown;

  errors?: unknown;
}

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  // ========================================
  // DEFAULT ERROR VALUES
  // ========================================

  err.statusCode = err.statusCode || 500;

  err.status = err.status || "error";

  // ========================================
  // MONGODB CAST ERROR
  // ========================================

  if (err.name === "CastError") {
    err.statusCode = 400;

    err.status = "fail";

    err.message = `Invalid value "${String(
      err.value,
    )}" for field "${err.path}"`;
  }

  // ========================================
  // ERROR LOGGING
  // ========================================

  if (err.statusCode >= 500) {
    req.log.error(
      {
        err,
      },
      "Unexpected server error",
    );
  } else {
    req.log.warn(
      {
        statusCode: err.statusCode,
        message: err.message,
      },
      "Request failed",
    );
  }

  // ========================================
  // PRODUCTION 500 ERROR
  // ========================================

  if (process.env.NODE_ENV === "production" && err.statusCode >= 500) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }

  // ========================================
  // SEND NORMAL ERROR RESPONSE
  // ========================================

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,

    ...(err.errors !== undefined ? { errors: err.errors } : {}),
  });
};

export = errorHandler;
