import { Router } from "express";
import { authController } from "../controllers/authController";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { loginValidator, registerValidator } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/register", registerValidator, validateRequest, authController.register);
authRouter.post("/login", loginValidator, validateRequest, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
