import { createApp } from "./app";
import { logCorsConfig } from "./config/cors";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
  if (env.nodeEnv === "development") {
    logCorsConfig();
  }
});
