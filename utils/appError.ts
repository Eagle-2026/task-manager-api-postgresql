class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  errors?: unknown;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;

    this.status =
      `${statusCode}`.startsWith("4")
        ? "fail"
        : "error";

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

export = AppError;