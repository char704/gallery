import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { logger } from "../utils/logger";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true
});

if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
  logger.warn("Cloudinary credentials are incomplete. Photo upload will fail until CLOUDINARY_* values are configured.");
}

export { cloudinary };
