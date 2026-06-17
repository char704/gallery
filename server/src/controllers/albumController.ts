import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const albumController = {
  list: ((_req, res) => {
    res.json(successResponse({ items: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  }) satisfies RequestHandler,

  create: ((_req, res) => {
    res.status(501).json(successResponse({ implemented: false }, "Album creation scaffold ready."));
  }) satisfies RequestHandler,

  detail: ((req, res) => {
    res.json(successResponse({ id: req.params.id, implemented: false }));
  }) satisfies RequestHandler,

  update: ((req, res) => {
    res.status(501).json(successResponse({ id: req.params.id, implemented: false }, "Album update scaffold ready."));
  }) satisfies RequestHandler,

  remove: ((req, res) => {
    res.status(501).json(successResponse({ id: req.params.id, implemented: false }, "Album delete scaffold ready."));
  }) satisfies RequestHandler,

  addPhoto: ((req, res) => {
    res.status(501).json(successResponse({ albumId: req.params.id, implemented: false }, "Add photo scaffold ready."));
  }) satisfies RequestHandler,

  removePhoto: ((req, res) => {
    res.status(501).json(successResponse({ albumId: req.params.id, photoId: req.params.photoId, implemented: false }, "Remove photo scaffold ready."));
  }) satisfies RequestHandler
};
