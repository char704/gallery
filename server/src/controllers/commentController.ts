import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const commentController = {
  list: ((_req, res) => {
    res.json(successResponse({ items: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  }) satisfies RequestHandler,

  create: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Comment scaffold ready."));
  }) satisfies RequestHandler,

  update: ((req, res) => {
    res.status(501).json(successResponse({ id: req.params.commentId, implemented: false }, "Comment update scaffold ready."));
  }) satisfies RequestHandler,

  remove: ((req, res) => {
    res.status(501).json(successResponse({ id: req.params.commentId, implemented: false }, "Comment delete scaffold ready."));
  }) satisfies RequestHandler
};
