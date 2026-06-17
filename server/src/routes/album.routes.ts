import { Router } from "express";
import { albumController } from "../controllers/albumController";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { albumIdValidator, albumPhotoIdValidator, albumValidator } from "../validators/album.validator";

export const albumRouter = Router();

albumRouter.get("/", requireAuth, albumController.list);
albumRouter.post("/", requireAuth, albumValidator, validateRequest, albumController.create);
albumRouter.get("/:id", albumIdValidator, validateRequest, albumController.detail);
albumRouter.patch("/:id", requireAuth, albumIdValidator, albumValidator, validateRequest, albumController.update);
albumRouter.delete("/:id", requireAuth, albumIdValidator, validateRequest, albumController.remove);
albumRouter.post("/:id/photos", requireAuth, albumIdValidator, validateRequest, albumController.addPhoto);
albumRouter.delete("/:id/photos/:photoId", requireAuth, albumPhotoIdValidator, validateRequest, albumController.removePhoto);
