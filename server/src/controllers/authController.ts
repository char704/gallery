import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const authController = {
  register: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Registration scaffold ready."));
  }) satisfies RequestHandler,

  login: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Login scaffold ready."));
  }) satisfies RequestHandler,

  me: ((req, res) => {
    res.json(successResponse({ user: req.user ?? null }));
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
