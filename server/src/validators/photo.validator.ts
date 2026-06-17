import { body, param, query } from "express-validator";

export const photoIdValidator = [param("id").isUUID()];

export const photoListValidator = [
  query("tag").optional().isString().trim().isLength({ max: 80 }),
  query("sort").optional().isIn(["latest", "oldest", "popular"]),
  query("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"])
];

export const photoMetadataValidator = [
  body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"]),
  body("tags").optional().isArray({ max: 20 })
];

export const photoUploadValidator = [
  body("title").isString().trim().isLength({ min: 1, max: 120 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"])
];
