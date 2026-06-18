import { prisma } from "../config/database";
import type { RequestHandler } from "express";
import { AppError } from "../utils/errorHandler";
import { successResponse } from "../utils/responseFormatter";

function parsePage(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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

  return photo;
}

export const commentController = {
  list: (async (req, res, next) => {
    try {
      const page = parsePage(req.query.page, 1);
      const limit = Math.min(parsePage(req.query.limit, 20), 50);
      const skip = (page - 1) * limit;

      await assertPhotoCanBeViewed(req.params.photoId, req.user?.id);

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            photoId: req.params.photoId
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc"
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }),
        prisma.comment.count({
          where: {
            photoId: req.params.photoId
          }
        })
      ]);

      res.json(
        successResponse({
          comments,
          total,
          page,
          pages: Math.ceil(total / limit)
        })
      );
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  create: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const content = String(req.body.content ?? "").trim();

      if (!content) {
        throw new AppError("Comment content is required.", 400, "VALIDATION_ERROR", [
          {
            field: "content",
            message: "Comment content is required."
          }
        ]);
      }

      if (content.length > 1000) {
        throw new AppError("Comment content must be 1000 characters or fewer.", 400, "VALIDATION_ERROR", [
          {
            field: "content",
            message: "Comment content must be 1000 characters or fewer."
          }
        ]);
      }

      await assertPhotoCanBeViewed(req.params.photoId, req.user.id);

      const comment = await prisma.comment.create({
        data: {
          content,
          photoId: req.params.photoId,
          userId: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      });

      res.status(201).json(successResponse(comment, "Comment created."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  update: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const content = String(req.body.content ?? "").trim();

      if (!content || content.length > 1000) {
        throw new AppError("Comment content must be between 1 and 1000 characters.", 400, "VALIDATION_ERROR");
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: req.params.commentId
        }
      });

      if (!comment) {
        throw new AppError("Comment not found.", 404, "COMMENT_NOT_FOUND");
      }

      if (comment.userId !== req.user.id) {
        throw new AppError("Forbidden - Not comment owner.", 403, "FORBIDDEN");
      }

      const updatedComment = await prisma.comment.update({
        where: {
          id: req.params.commentId
        },
        data: {
          content
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      });

      res.json(successResponse(updatedComment, "Comment updated."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  remove: (async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized - No token provided.", 401, "UNAUTHORIZED");
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: req.params.commentId
        }
      });

      if (!comment) {
        throw new AppError("Comment not found.", 404, "COMMENT_NOT_FOUND");
      }

      if (comment.userId !== req.user.id) {
        throw new AppError("Forbidden - Not comment owner.", 403, "FORBIDDEN");
      }

      await prisma.comment.delete({
        where: {
          id: req.params.commentId
        }
      });

      res.json(successResponse({ deleted: true }, "Comment deleted."));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
