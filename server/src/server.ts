import { createApp } from "./app";
import { logCorsConfig } from "./config/cors";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
  if (env.nodeEnv === "development") {
    logCorsConfig();
  }
});

function gracefulShutdown(): void {
  logger.info("Shutting down server");

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
