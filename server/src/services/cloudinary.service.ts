import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { AppError } from "../utils/errorHandler";

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
            reject(new AppError("Image upload failed.", 502, "CLOUDINARY_UPLOAD_FAILED"));
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
