import { Router } from "express";
import { albumController } from "../controllers/albumController";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { albumIdValidator, albumPhotoIdValidator, albumValidator } from "../validators/album.validator";
import { albumAddPhotoValidator } from "../validators/album.validator";
import { paginationValidator } from "../validators/common.validator";

export const albumRouter = Router();

albumRouter.get("/", requireAuth, paginationValidator, validateRequest, albumController.list);
albumRouter.get("/public", paginationValidator, validateRequest, albumController.publicList);
albumRouter.get("/user/:userId", paginationValidator, validateRequest, albumController.userAlbums);
albumRouter.post("/", requireAuth, albumValidator, validateRequest, albumController.create);
albumRouter.get("/:id", optionalAuth, albumIdValidator, validateRequest, albumController.detail);
albumRouter.patch("/:id", requireAuth, albumIdValidator, albumValidator, validateRequest, albumController.update);
albumRouter.delete("/:id", requireAuth, albumIdValidator, validateRequest, albumController.remove);
albumRouter.post("/:id/photos", requireAuth, albumAddPhotoValidator, validateRequest, albumController.addPhoto);
albumRouter.delete("/:id/photos/:photoId", requireAuth, albumPhotoIdValidator, validateRequest, albumController.removePhoto);
