import { body, param } from "express-validator";

export const albumIdValidator = [param("id").isUUID()];

export const albumPhotoIdValidator = [param("id").isUUID(), param("photoId").isUUID()];

export const albumAddPhotoValidator = [param("id").isUUID(), body("photoId").isUUID()];

export const albumValidator = [
  body("name").isString().trim().isLength({ min: 1, max: 120 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"]),
  body("coverPhotoId").optional().isUUID()
];
