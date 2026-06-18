import { Router } from "express";
import { commentController } from "../controllers/commentController";
import { likeController } from "../controllers/likeController";
import { photoController } from "../controllers/photoController";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware";
import { upload, validateUpload } from "../middlewares/upload.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { paginationValidator } from "../validators/common.validator";
import {
  commentMetadataValidator,
  photoActionIdValidator,
  photoIdValidator,
  photoListValidator,
  photoMetadataValidator,
  photoUploadValidator
} from "../validators/photo.validator";

export const photoRouter = Router();

photoRouter.get("/", paginationValidator, photoListValidator, validateRequest, photoController.list);
photoRouter.get("/feed", requireAuth, paginationValidator, validateRequest, photoController.feed);
photoRouter.get("/user/:userId", paginationValidator, validateRequest, photoController.userPhotos);
photoRouter.post("/", requireAuth, upload.single("image"), validateUpload, photoUploadValidator, validateRequest, photoController.upload);
photoRouter.get("/:id", optionalAuth, photoIdValidator, validateRequest, photoController.detail);
photoRouter.patch("/:id", requireAuth, photoIdValidator, photoMetadataValidator, validateRequest, photoController.update);
photoRouter.delete("/:id", requireAuth, photoIdValidator, validateRequest, photoController.remove);

photoRouter.post("/:photoId/like", requireAuth, photoActionIdValidator, validateRequest, likeController.like);
photoRouter.delete("/:photoId/like", requireAuth, photoActionIdValidator, validateRequest, likeController.unlike);
photoRouter.get("/:photoId/likes", optionalAuth, photoActionIdValidator, validateRequest, likeController.count);
photoRouter.get("/:photoId/comments", optionalAuth, photoActionIdValidator, paginationValidator, validateRequest, commentController.list);
photoRouter.post(
  "/:photoId/comments",
  requireAuth,
  photoActionIdValidator,
  commentMetadataValidator,
  validateRequest,
  commentController.create
);
