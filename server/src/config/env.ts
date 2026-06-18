import "dotenv/config";

function readNumber(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

function readList(name: string, fallback: string[]): string[] {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const defaultCorsOrigins = [
  "https://gallery-ebon-six.vercel.app/"
];

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readNumber("PORT", 5000),
  corsOrigins: readList("CORS_ORIGIN", defaultCorsOrigins),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/framehub",
  jwtSecret: process.env.JWT_SECRET ?? "development-only-secret",
  jwtExpiry: process.env.JWT_EXPIRY ?? "7d",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  maxFileSize: readNumber("MAX_FILE_SIZE", 5 * 1024 * 1024),
  maxFilesPerRequest: readNumber("MAX_FILES_PER_REQUEST", 10),
  rateLimitWindowMs: readNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  rateLimitMaxRequests: readNumber("RATE_LIMIT_MAX_REQUESTS", 100)
} as const;

export const isProduction = env.nodeEnv === "production";
