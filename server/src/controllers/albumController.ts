import type { RequestHandler } from "express";
import { albumService } from "../services/album.service";
import { AppError } from "../utils/errorHandler";
import { successResponse } from "../utils/responseFormatter";

function parsePage(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const albumController = {
  list: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const page = parsePage(req.query.page, 1);
      const limit = parsePage(req.query.limit, 12);
      const result = await albumService.getUserAlbums(req.user.id, page, limit, true);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  publicList: (async (req, res, next) => {
    try {
      const page = parsePage(req.query.page, 1);
      const limit = parsePage(req.query.limit, 12);
      const result = await albumService.getPublicAlbums(page, limit);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  userAlbums: (async (req, res, next) => {
    try {
      const page = parsePage(req.query.page, 1);
      const limit = parsePage(req.query.limit, 12);
      const result = await albumService.getUserAlbums(req.params.userId, page, limit, false);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const { name, description, visibility } = req.body as {
        name: string;
        description?: string;
        visibility?: string;
      };
      const album = await albumService.createAlbum(
        req.user.id,
        name,
        description ?? null,
        albumService.parseVisibility(visibility)
      );

      res.status(201).json(successResponse(album, "Album created."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  detail: (async (req, res, next) => {
    try {
      const album = await albumService.getAlbumById(req.params.id, req.user?.id);

      res.json(successResponse(album));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  update: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const { name, description, visibility, coverPhotoId } = req.body as {
        name?: string;
        description?: string | null;
        visibility?: string;
        coverPhotoId?: string | null;
      };
      const album = await albumService.updateAlbum(req.params.id, req.user.id, {
        name,
        description,
        visibility,
        coverPhotoId
      });

      res.json(successResponse(album, "Album updated."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  remove: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      await albumService.deleteAlbum(req.params.id, req.user.id);
      res.json(successResponse({ deleted: true }, "Album deleted."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  addPhoto: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const { photoId } = req.body as { photoId?: string };

      if (!photoId) {
        throw new AppError("Photo id is required.", 400, "PHOTO_ID_REQUIRED");
      }

      const albumPhoto = await albumService.addPhotoToAlbum(req.params.id, photoId, req.user.id);
      res.status(201).json(successResponse(albumPhoto, "Photo added to album."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  removePhoto: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      await albumService.removePhotoFromAlbum(req.params.id, req.params.photoId, req.user.id);
      res.json(successResponse({ removed: true }, "Photo removed from album."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
