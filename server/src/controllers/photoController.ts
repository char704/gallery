import type { RequestHandler } from "express";
import { photoService } from "../services/photo.service";
import { AppError } from "../utils/errorHandler";
import { successResponse } from "../utils/responseFormatter";

function parsePage(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTags(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

export const photoController = {
  list: (async (req, res, next) => {
    try {
      const page = parsePage(req.query.page, 1);
      const limit = parsePage(req.query.limit, 12);
      const result = await photoService.getPublicPhotos(page, limit, {
        tag: typeof req.query.tag === "string" ? req.query.tag : undefined,
        sort: typeof req.query.sort === "string" ? req.query.sort : undefined
      });

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  detail: (async (req, res, next) => {
    try {
      const photo = await photoService.getPhotoById(req.params.id);

      if (photo.visibility === "PRIVATE" && photo.userId !== req.user?.id) {
        throw new AppError("Forbidden - Cannot view private photo.", 403, "FORBIDDEN");
      }

      res.json(successResponse(photo));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  upload: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      if (!req.file) {
        throw new AppError("No file uploaded.", 400, "NO_FILE_UPLOADED");
      }

      const { title, description, visibility, tags } = req.body as {
        title?: string;
        description?: string;
        visibility?: string;
        tags?: unknown;
      };

      if (!title?.trim()) {
        throw new AppError("Title is required.", 400, "VALIDATION_ERROR", [
          {
            field: "title",
            message: "Title is required."
          }
        ]);
      }

      const photo = await photoService.createPhoto(
        req.user.id,
        title,
        description || null,
        req.file.buffer,
        req.file.originalname,
        photoService.parseVisibility(visibility),
        parseTags(tags)
      );

      res.status(201).json(successResponse(photo, "Photo uploaded."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateTags: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const photo = await photoService.updatePhotoTags(req.params.id, req.user.id, parseTags((req.body as { tags?: unknown }).tags));

      res.json(successResponse(photo, "Photo tags updated."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  update: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const { title, description, visibility } = req.body as {
        title?: string;
        description?: string;
        visibility?: string;
      };
      const photo = await photoService.updatePhoto(req.params.id, req.user.id, {
        title,
        description,
        visibility
      });

      res.json(successResponse(photo, "Photo updated."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  remove: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      await photoService.deletePhoto(req.params.id, req.user.id);
      res.json(successResponse({ deleted: true }, "Photo deleted."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  userPhotos: (async (req, res, next) => {
    try {
      const page = parsePage(req.query.page, 1);
      const limit = parsePage(req.query.limit, 12);
      const result = await photoService.getUserPhotos(req.params.userId, page, limit, false);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  feed: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const page = parsePage(req.query.page, 1);
      const limit = parsePage(req.query.limit, 12);
      const result = await photoService.getUserPhotos(req.user.id, page, limit, true);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
