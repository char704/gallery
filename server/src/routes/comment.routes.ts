import { Router } from "express";
import { commentController } from "../controllers/commentController";
import { requireAuth } from "../middlewares/auth.middleware";

export const commentRouter = Router();

commentRouter.patch("/:commentId", requireAuth, commentController.update);
commentRouter.delete("/:commentId", requireAuth, commentController.remove);
