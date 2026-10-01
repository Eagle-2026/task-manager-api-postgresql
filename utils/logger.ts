import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "res.headers.set-cookie",

      "password",
      "passwordConfirm",
      "body.password",
      "body.passwordConfirm",
      "token",
    ],

    censor: "[REDACTED]",
  },

  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",

          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      }),
});

export = logger;
