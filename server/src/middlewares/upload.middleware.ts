import multer from "multer";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { IMAGE_MIME_TYPES } from "../utils/constants";
import { AppError } from "../utils/errorHandler";

function hasAllowedImageSignature(file: Express.Multer.File): boolean {
  const buffer = file.buffer;

  if (file.mimetype === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (file.mimetype === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (file.mimetype === "image/webp") {
    return buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  if (file.mimetype === "image/gif") {
    return buffer.length >= 6 && (buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a");
  }

  return false;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSize,
    files: env.maxFilesPerRequest
  },
  fileFilter: (_req, file, callback) => {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype as (typeof IMAGE_MIME_TYPES)[number])) {
      callback(new AppError("Only JPG, PNG, WebP, and GIF images are supported.", 400, "UNSUPPORTED_FILE_TYPE"));
      return;
    }

    callback(null, true);
  }
});

export const validateUpload: RequestHandler = (req, _res, next) => {
  if (!req.file) {
    next(new AppError("No file uploaded.", 400, "NO_FILE_UPLOADED"));
    return;
  }

  if (!hasAllowedImageSignature(req.file)) {
    next(new AppError("Uploaded file content does not match a supported image type.", 400, "INVALID_IMAGE_SIGNATURE"));
    return;
  }

  next();
};
