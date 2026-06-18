import { body, param, query } from "express-validator";

export const photoIdValidator = [param("id").isUUID()];

export const photoActionIdValidator = [param("photoId").isUUID()];

export const commentIdValidator = [param("commentId").isUUID()];

export const photoListValidator = [
  query("tag").optional().isString().trim().isLength({ max: 80 }),
  query("sort").optional().isIn(["latest", "oldest", "popular"]),
  query("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"])
];

export const photoMetadataValidator = [
  body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"])
];

export const photoTagsValidator = [
  body("tags")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.length <= 20 && value.every((tag) => typeof tag === "string" && tag.length <= 30);
      }

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value) as unknown;
          return Array.isArray(parsed) && parsed.length <= 20 && parsed.every((tag) => typeof tag === "string" && tag.length <= 30);
        } catch {
          return value.length <= 800;
        }
      }

      return false;
    })
];

export const photoUploadValidator = [
  body("title").isString().trim().isLength({ min: 1, max: 120 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("visibility").optional().isIn(["PUBLIC", "PRIVATE", "UNLISTED"]),
  ...photoTagsValidator
];

export const commentMetadataValidator = [body("content").isString().trim().isLength({ min: 1, max: 1000 })];
