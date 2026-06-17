import multer from "multer";
import { env } from "../config/env";
import { IMAGE_MIME_TYPES } from "../utils/constants";
import { AppError } from "../utils/errorHandler";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSize,
    files: env.maxFilesPerRequest
  },
  fileFilter: (_req, file, callback) => {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype as (typeof IMAGE_MIME_TYPES)[number])) {
      callback(new AppError("Only JPG, PNG, and WebP images are supported.", 400, "UNSUPPORTED_FILE_TYPE"));
      return;
    }

    callback(null, true);
  }
});
