import { Router } from "express";
import { userController } from "../controllers/userController";
import { requireAuth } from "../middlewares/auth.middleware";

export const userRouter = Router();

userRouter.get("/:userId", userController.profile);
userRouter.patch("/profile", requireAuth, userController.updateProfile);
userRouter.get("/:userId/stats", userController.stats);
userRouter.post("/:userId/follow", requireAuth, userController.follow);
userRouter.delete("/:userId/follow", requireAuth, userController.unfollow);
