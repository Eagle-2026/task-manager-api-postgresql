import type { NextFunction, Request, Response } from "express";

import AppError = require("../utils/appError");

type UserRole = "user" | "admin";

const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

export { restrictTo };
