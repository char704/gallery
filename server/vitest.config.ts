import { defineConfig } from "vitest/config";

process.env.NODE_ENV ??= "test";
process.env.JWT_SECRET ??= "test_secret_key_at_least_32_characters_long";
process.env.CLOUDINARY_CLOUD_NAME ??= "test_cloud";
process.env.CLOUDINARY_API_KEY ??= "test_key";
process.env.CLOUDINARY_API_SECRET ??= "test_secret";
process.env.CORS_ORIGIN ??= "http://localhost:5173";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["src/__tests__/setup.ts"],
    testTimeout: 30_000,
    pool: "forks",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/server.ts", "src/config/**"]
    }
  }
});
