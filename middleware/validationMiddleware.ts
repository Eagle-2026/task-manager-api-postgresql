

// const validate = (schema) => {
//   return (req, res, next) => {
//     const result = schema.safeParse(req.body);

//     if (!result.success) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Validation failed",
//         errors: result.error.issues,
//       });
//     }
//     req.body = result.data;
//     next();
//   };
// };

// module.exports = validate;

// const AppError = require("../utils/appError");

// const validate = (schema) => {
//   return (req, res, next) => {
//     const result = schema.safeParse(req.body);

//     if (!result.success) {
//       const error = new AppError("Validation failed", 400);

//       error.errors = result.error.issues;

//       return next(error);
//     }

//     req.body = result.data;

//     next();
//   };
// };

// module.exports = validate;

// // ===========================
// use typescript
import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  ZodType,
} from "zod";

import AppError = require(
  "../utils/appError"
);

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

const validate = (
  schema: ZodType,
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const result =
      schema.safeParse(req.body);

    if (!result.success) {
      const error =
        new AppError(
          "Validation failed",
          400,
        );

      error.errors =
        result.error.issues;

      return next(error);
    }

    req.body = result.data;

    next();
  };
};

export = validate;