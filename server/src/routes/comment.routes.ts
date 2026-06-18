import { Router } from "express";
import { commentController } from "../controllers/commentController";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { commentIdValidator, commentMetadataValidator } from "../validators/photo.validator";

export const commentRouter = Router();

commentRouter.patch("/:commentId", requireAuth, commentIdValidator, commentMetadataValidator, validateRequest, commentController.update);
commentRouter.delete("/:commentId", requireAuth, commentIdValidator, validateRequest, commentController.remove);
