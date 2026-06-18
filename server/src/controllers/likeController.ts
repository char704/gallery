import type { RequestHandler } from "express";
import { prisma } from "../config/database";
import { AppError } from "../utils/errorHandler";
import { successResponse } from "../utils/responseFormatter";

async function assertPhotoCanBeViewed(photoId: string, userId?: string) {
  const photo = await prisma.photo.findUnique({
    where: {
      id: photoId
    },
    select: {
      id: true,
      userId: true,
      visibility: true
    }
  });

  if (!photo) {
    throw new AppError("Photo not found.", 404, "PHOTO_NOT_FOUND");
  }

  if (photo.visibility === "PRIVATE" && photo.userId !== userId) {
    throw new AppError("Forbidden - Cannot access this photo.", 403, "FORBIDDEN");
  }
}

async function likeSummary(photoId: string, userId?: string) {
  const [count, currentUserLike] = await Promise.all([
    prisma.like.count({
      where: {
        photoId
      }
    }),
    userId
      ? prisma.like.findUnique({
          where: {
            userId_photoId: {
              userId,
              photoId
            }
          }
        })
      : Promise.resolve(null)
  ]);

  return {
    count,
    isLiked: Boolean(currentUserLike)
  };
}

export const likeController = {
  like: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      await assertPhotoCanBeViewed(req.params.photoId, req.user.id);
      await prisma.like.upsert({
        where: {
          userId_photoId: {
            userId: req.user.id,
            photoId: req.params.photoId
          }
        },
        create: {
          userId: req.user.id,
          photoId: req.params.photoId
        },
        update: {}
      });

      res.status(201).json(successResponse(await likeSummary(req.params.photoId, req.user.id), "Photo liked."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  unlike: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      await assertPhotoCanBeViewed(req.params.photoId, req.user.id);
      await prisma.like.deleteMany({
        where: {
          userId: req.user.id,
          photoId: req.params.photoId
        }
      });

      res.json(successResponse(await likeSummary(req.params.photoId, req.user.id), "Photo unliked."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  count: (async (req, res, next) => {
    try {
      await assertPhotoCanBeViewed(req.params.photoId, req.user?.id);
      res.json(successResponse(await likeSummary(req.params.photoId, req.user?.id)));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
