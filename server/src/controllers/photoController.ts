import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const photoController = {
  list: ((_req, res) => {
    res.json(successResponse({ items: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  }) satisfies RequestHandler,

  detail: ((req, res) => {
    res.json(successResponse({ id: req.params.id, implemented: false }));
  }) satisfies RequestHandler,

  upload: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Photo upload scaffold ready."));
  }) satisfies RequestHandler,

  update: ((req, res) => {
    res.status(501).json(successResponse({ id: req.params.id, implemented: false }, "Photo update scaffold ready."));
  }) satisfies RequestHandler,

  remove: ((req, res) => {
    res.status(501).json(successResponse({ id: req.params.id, implemented: false }, "Photo delete scaffold ready."));
  }) satisfies RequestHandler,

  userPhotos: ((req, res) => {
    res.json(successResponse({ userId: req.params.userId, items: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  }) satisfies RequestHandler,

  feed: ((_req, res) => {
    res.json(successResponse({ items: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  }) satisfies RequestHandler
};
