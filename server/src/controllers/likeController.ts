import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const likeController = {
  like: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Like scaffold ready."));
  }) satisfies RequestHandler,

  unlike: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Unlike scaffold ready."));
  }) satisfies RequestHandler,

  count: ((_req, res) => {
    res.json(successResponse({ count: 0 }));
  }) satisfies RequestHandler
};
