import type { CorsOptions } from "cors";
import { env } from "./env";
import { logger } from "../utils/logger";

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
];

export const corsOrigins = Array.from(
  new Set([...(env.nodeEnv === "production" ? [] : localOrigins), ...env.corsOrigins.map(normalizeOrigin)])
);

export const corsConfig: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (corsOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    logger.warn("CORS blocked origin", {
      origin
    });
    callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

export function logCorsConfig(): void {
  logger.info("CORS origins configured", {
    origins: corsOrigins
  });
}
