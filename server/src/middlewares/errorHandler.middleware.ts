import type { ErrorRequestHandler, RequestHandler } from "express";
import { isProduction } from "../config/env";
import { isAppError } from "../utils/errorHandler";
import { errorResponse } from "../utils/responseFormatter";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json(errorResponse("NOT_FOUND", `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isAppError(error)) {
    res.status(error.statusCode).json(errorResponse(error.code, error.message, error.details));
    return;
  }

  if (error instanceof Error && error.name === "MulterError") {
    const message = error.message || "File upload failed.";
    res.status(400).json(errorResponse("UPLOAD_ERROR", message));
    return;
  }

  const message = isProduction ? "Unexpected server error." : error instanceof Error ? error.message : "Unknown error.";
  res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", message));
};
