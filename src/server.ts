import { config } from "@config/env";
import connectDB from "@config/db";
import logger from "@shared/utils/logger";
import app from "./app";

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception! Shutting down...");
  logger.error(error.name, error.message);
  logger.error(error);
  process.exit(1);
});

// Connect to database
connectDB();

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
  logger.info(
    `Health check available at: http://localhost:${config.port}/health`,
  );
  logger.info(`API base URL: http://localhost:${config.port}/api/v1`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error: Error) => {
  logger.error(`UNHANDLED REJECTION! Shutting down...`);
  logger.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated");
  });
});

export default server;
