import "dotenv/config";

import pool from "./config/db";

import app = require("./app");
import logger = require("./utils/logger");

const PORT = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    await pool.query("SELECT 1");

    logger.info("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      logger.info(
        { port: PORT },
        "Server started",
      );
    });
  } catch (error: unknown) {
    logger.fatal(
      { err: error },
      "PostgreSQL connection failed",
    );

    process.exit(1);
  }
};

startServer();