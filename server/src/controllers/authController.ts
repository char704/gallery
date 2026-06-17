import type { RequestHandler } from "express";
import { authService } from "../services/auth.service";
import { successResponse } from "../utils/responseFormatter";

export const authController = {
  register: (async (req, res, next) => {
    try {
      const { email, password, name } = req.body as {
        email: string;
        password: string;
        name: string;
      };
      const user = await authService.createUser(email, password, name);
      const token = authService.generateAccessToken(user.id, user.email, user.role);

      res.status(201).json(successResponse({ user, token }, "Registration successful."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  login: (async (req, res, next) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const user = await authService.authenticateUser(email, password);
      const token = authService.generateAccessToken(user.id, user.email, user.role);

      res.json(successResponse({ user, token }, "Login successful."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  me: (async (req, res, next) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized - No token provided."
          }
        });
        return;
      }

      const user = await authService.getUserById(req.user.id);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  logout: ((_req, res) => {
    res.json(successResponse({ ok: true }, "Logout handled by the client."));
  }) satisfies RequestHandler,

  refreshToken: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Refresh token scaffold ready."));
  }) satisfies RequestHandler,

  forgotPassword: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Password reset request scaffold ready."));
  }) satisfies RequestHandler,

  resetPassword: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Password reset scaffold ready."));
  }) satisfies RequestHandler
};
