import "./types/express";
import cors from "cors";
import express, { type Express } from "express";
import { corsConfig } from "./config/cors";
import { apiRateLimit } from "./middlewares/rateLimit.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.middleware";
import { apiRouter } from "./routes";
import { API_PREFIX } from "./utils/constants";
import { successResponse } from "./utils/responseFormatter";
import type { HealthCheckPayload } from "./types";

export function createApp(): Express {
  const app = express();

  app.use(cors(corsConfig));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    const payload: HealthCheckPayload = {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    res.json(successResponse(payload));
  });

  app.use(API_PREFIX, apiRateLimit, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
