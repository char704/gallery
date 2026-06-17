import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../types";
import { AppError } from "../utils/errorHandler";

function normalizeRole(value: unknown): UserRole {
  return value === "ADMIN" ? "ADMIN" : "USER";
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    next(new AppError("Authentication token is required.", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    if (typeof payload.sub !== "string") {
      throw new AppError("Authentication token is invalid.", 401, "UNAUTHORIZED");
    }

    req.user = {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      role: normalizeRole(payload.role)
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Authentication token is invalid.", 401, "UNAUTHORIZED"));
  }
};
