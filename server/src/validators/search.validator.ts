import { query } from "express-validator";

export const searchValidator = [
  query("q").optional().isString().trim().isLength({ max: 120 }),
  query("tag").optional().isString().trim().isLength({ max: 80 }),
  query("userId").optional().isUUID(),
  query("sort").optional().isIn(["latest", "oldest", "popular"])
];
