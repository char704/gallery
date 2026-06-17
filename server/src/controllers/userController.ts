import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const userController = {
  profile: ((req, res) => {
    res.json(successResponse({ id: req.params.userId, implemented: false }));
  }) satisfies RequestHandler,

  updateProfile: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Profile update scaffold ready."));
  }) satisfies RequestHandler,

  stats: ((req, res) => {
    res.json(successResponse({ userId: req.params.userId, photos: 0, albums: 0, likes: 0 }));
  }) satisfies RequestHandler,

  follow: ((req, res) => {
    res.status(501).json(successResponse({ userId: req.params.userId, implemented: false }, "Follow scaffold ready."));
  }) satisfies RequestHandler,

  unfollow: ((req, res) => {
    res.status(501).json(successResponse({ userId: req.params.userId, implemented: false }, "Unfollow scaffold ready."));
  }) satisfies RequestHandler
};
