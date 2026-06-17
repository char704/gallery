import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/errorHandler";

export const validateRequest: RequestHandler = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  next(
    new AppError(
      "Request validation failed.",
      400,
      "VALIDATION_ERROR",
      result.array().map((error) => ({
        field: error.type === "field" ? error.path : undefined,
        message: error.msg
      }))
    )
  );
};
