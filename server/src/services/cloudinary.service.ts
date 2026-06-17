import type { UploadApiResponse } from "cloudinary";
import { isProduction } from "../config/env";
import { cloudinary } from "../config/cloudinary";
import { AppError } from "../utils/errorHandler";
import { logger } from "../utils/logger";

export interface UploadedImage {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
}

function sanitizePublicId(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function getCloudinaryErrorInfo(error: unknown): { message: string; httpCode?: number } {
  if (error instanceof Error) {
    return {
      message: error.message
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as {
      message?: unknown;
      http_code?: unknown;
      error?: {
        message?: unknown;
        http_code?: unknown;
      };
    };
    const message = record.error?.message ?? record.message;
    const httpCode = record.error?.http_code ?? record.http_code;

    return {
      message: typeof message === "string" ? message : JSON.stringify(error),
      httpCode: typeof httpCode === "number" ? httpCode : undefined
    };
  }

  return {
    message: String(error)
  };
}

export const cloudinaryService = {
  async uploadImage(fileBuffer: Buffer, fileName: string): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "framehub",
          public_id: sanitizePublicId(fileName),
          quality: "auto",
          fetch_format: "auto"
        },
        (error, result?: UploadApiResponse) => {
          if (error) {
            const errorInfo = getCloudinaryErrorInfo(error);

            logger.error("Cloudinary upload failed", {
              message: errorInfo.message,
              httpCode: errorInfo.httpCode
            });
            reject(
              new AppError(
                isProduction ? "Image upload failed." : `Image upload failed: ${errorInfo.message}`,
                502,
                "CLOUDINARY_UPLOAD_FAILED"
              )
            );
            return;
          }

          if (!result) {
            reject(new AppError("Image upload returned no result.", 502, "CLOUDINARY_UPLOAD_FAILED"));
            return;
          }

          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            thumbnailUrl: cloudinary.url(result.public_id, {
              secure: true,
              transformation: [{ width: 300, height: 300, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }]
            }),
            width: result.width,
            height: result.height,
            fileSize: result.bytes
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });
  }
};
