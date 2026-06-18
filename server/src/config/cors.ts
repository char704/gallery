import type { CorsOptions } from "cors";
import { logger } from "../utils/logger";

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

function parseCorsOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGIN ?? "";

  if (!envOrigins) {
    return [];
  }

  return envOrigins
    .split(",")
    .map(normalizeOrigin)
    .filter((origin) => origin.length > 0);
}

const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
];

export const corsOrigins = Array.from(new Set([...localOrigins, ...parseCorsOrigins()]));

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
