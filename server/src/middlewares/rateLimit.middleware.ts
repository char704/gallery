import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { errorResponse } from "../utils/responseFormatter";

export const apiRateLimit = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse("RATE_LIMITED", "Too many requests. Please try again later."));
  }
});
