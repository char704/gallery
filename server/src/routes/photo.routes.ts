import { Router } from "express";
import { commentController } from "../controllers/commentController";
import { likeController } from "../controllers/likeController";
import { photoController } from "../controllers/photoController";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware";
import { upload, validateUpload } from "../middlewares/upload.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { paginationValidator } from "../validators/common.validator";
import { photoIdValidator, photoListValidator, photoMetadataValidator, photoUploadValidator } from "../validators/photo.validator";

export const photoRouter = Router();

photoRouter.get("/", paginationValidator, photoListValidator, validateRequest, photoController.list);
photoRouter.get("/feed", requireAuth, paginationValidator, validateRequest, photoController.feed);
photoRouter.get("/user/:userId", paginationValidator, validateRequest, photoController.userPhotos);
photoRouter.post("/", requireAuth, upload.single("image"), validateUpload, photoUploadValidator, validateRequest, photoController.upload);
photoRouter.get("/:id", optionalAuth, photoIdValidator, validateRequest, photoController.detail);
photoRouter.patch("/:id", requireAuth, photoIdValidator, photoMetadataValidator, validateRequest, photoController.update);
photoRouter.delete("/:id", requireAuth, photoIdValidator, validateRequest, photoController.remove);

photoRouter.post("/:photoId/like", requireAuth, likeController.like);
photoRouter.delete("/:photoId/like", requireAuth, likeController.unlike);
photoRouter.get("/:photoId/likes", likeController.count);
photoRouter.get("/:photoId/comments", paginationValidator, validateRequest, commentController.list);
photoRouter.post("/:photoId/comments", requireAuth, commentController.create);
