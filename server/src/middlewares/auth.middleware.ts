import type { RequestHandler } from "express";
import { authService } from "../services/auth.service";
import { AppError } from "../utils/errorHandler";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : header;

  if (!token) {
    next(new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = authService.verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role ?? "USER"
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Unauthorized - Invalid or expired token.", 401, "UNAUTHORIZED"));
  }
};

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : header;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = authService.verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role ?? "USER"
    };
  } catch {
    // Public routes stay public; invalid optional tokens simply behave as anonymous requests.
  }

  next();
};
