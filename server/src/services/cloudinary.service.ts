import type { UploadApiResponse } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
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
  folderPath: string;
}

export interface UploadImageParams {
  fileBuffer: Buffer;
  userId: string;
  originalFileName: string;
}

export interface CloudinaryImageResource {
  publicId: string;
  url: string;
  createdAt: string;
}

interface CloudinaryListedResource {
  public_id: string;
  secure_url: string;
  created_at: string;
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
  async uploadImage({ fileBuffer, userId, originalFileName }: UploadImageParams): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const folderPath = `framehub/${userId}`;
      const uniqueId = uuidv4();
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: folderPath,
          public_id: uniqueId,
          quality: "auto",
          fetch_format: "auto",
          context: {
            alt: originalFileName,
            uploadedAt: new Date().toISOString()
          }
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
            fileSize: result.bytes,
            folderPath
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });

    if (result.result === "not found") {
      logger.warn("Cloudinary image was already missing", {
        publicId
      });
      return;
    }

    if (result.result !== "ok") {
      throw new AppError(`Cloudinary deletion failed: ${result.result}`, 502, "CLOUDINARY_DELETE_FAILED");
    }
  },

  async listUserImages(userId: string): Promise<CloudinaryImageResource[]> {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `framehub/${userId}`,
      max_results: 500
    });

    return (result.resources as CloudinaryListedResource[]).map((resource) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      createdAt: resource.created_at
    }));
  }
};
