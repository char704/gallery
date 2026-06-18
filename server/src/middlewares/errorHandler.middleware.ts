import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      res.status(404).json(errorResponse("NOT_FOUND", "Requested resource was not found."));
      return;
    }

    if (error.code === "P2002") {
      res.status(409).json(errorResponse("UNIQUE_CONSTRAINT", "A record with this value already exists."));
      return;
    }

    if (error.code === "P2003") {
      res.status(400).json(errorResponse("RELATION_CONSTRAINT", "Related resource does not exist."));
      return;
    }
  }

  const message = isProduction ? "Unexpected server error." : error instanceof Error ? error.message : "Unknown error.";
  res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", message));
};
