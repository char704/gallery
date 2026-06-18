import { config as loadDotenv } from "dotenv";
import path from "path";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  loadDotenv({
    path: path.resolve(process.cwd(), ".env")
  });
}

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string"
    }),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRY: z.string().default("7d"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  PORT: z.coerce.number().int().min(1024).max(65535).default(5000),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    )
    .pipe(z.array(z.string().url("Each CORS origin must be a valid URL"))),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  MAX_FILES_PER_REQUEST: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

type RawEnv = z.infer<typeof rawEnvSchema>;

function formatValidationErrors(error: z.ZodError): string {
  return Object.entries(error.flatten().fieldErrors)
    .map(([field, messages]) => `- ${field}: ${Array.isArray(messages) ? messages.join("; ") : "Invalid value"}`)
    .join("\n");
}

function parseRawEnv(): RawEnv {
  const result = rawEnvSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Environment validation failed:\n${formatValidationErrors(result.error)}`);
  }

  return result.data;
}

function validateProduction(rawEnv: RawEnv): void {
  if (rawEnv.NODE_ENV !== "production") {
    return;
  }

  const errors: string[] = [];
  const weakSecretFragments = ["development", "password", "secret", "admin", "123456", "test"];

  if (rawEnv.JWT_SECRET === "development-only-secret") {
    errors.push("JWT_SECRET cannot use the development placeholder in production");
  }

  if (rawEnv.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters in production");
  }

  if (weakSecretFragments.some((fragment) => rawEnv.JWT_SECRET.toLowerCase().includes(fragment))) {
    errors.push("JWT_SECRET appears weak. Use a random 32+ character value");
  }

  if (rawEnv.DATABASE_URL.includes("localhost") || rawEnv.DATABASE_URL.includes("127.0.0.1")) {
    errors.push("DATABASE_URL cannot point to localhost in production");
  }

  if (rawEnv.CORS_ORIGIN.some((origin) => origin.includes("localhost") || origin.includes("127.0.0.1"))) {
    errors.push("CORS_ORIGIN cannot include localhost in production");
  }

  if (errors.length > 0) {
    throw new Error(`Production environment validation failed:\n${errors.map((message) => `- ${message}`).join("\n")}`);
  }
}

function toSafeDatabaseLabel(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return "unknown";
  }
}

function logEnvironmentConfig(rawEnv: RawEnv): void {
  if (rawEnv.NODE_ENV !== "development") {
    return;
  }

  console.info("Environment configuration", {
    nodeEnv: rawEnv.NODE_ENV,
    port: rawEnv.PORT,
    database: toSafeDatabaseLabel(rawEnv.DATABASE_URL),
    cloudinaryCloudName: rawEnv.CLOUDINARY_CLOUD_NAME,
    corsOrigins: rawEnv.CORS_ORIGIN,
    maxFileSize: rawEnv.MAX_FILE_SIZE,
    logLevel: rawEnv.LOG_LEVEL
  });
}

const rawEnv = parseRawEnv();
validateProduction(rawEnv);
logEnvironmentConfig(rawEnv);

export const env = {
  nodeEnv: rawEnv.NODE_ENV,
  port: rawEnv.PORT,
  corsOrigins: rawEnv.CORS_ORIGIN,
  databaseUrl: rawEnv.DATABASE_URL,
  jwtSecret: rawEnv.JWT_SECRET,
  jwtExpiry: rawEnv.JWT_EXPIRY,
  cloudinaryCloudName: rawEnv.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: rawEnv.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: rawEnv.CLOUDINARY_API_SECRET,
  maxFileSize: rawEnv.MAX_FILE_SIZE,
  maxFilesPerRequest: rawEnv.MAX_FILES_PER_REQUEST,
  rateLimitWindowMs: rawEnv.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: rawEnv.RATE_LIMIT_MAX_REQUESTS,
  logLevel: rawEnv.LOG_LEVEL
} as const;

export const isProduction = env.nodeEnv === "production";
export const isTest = env.nodeEnv === "test";

export type Env = typeof env;
