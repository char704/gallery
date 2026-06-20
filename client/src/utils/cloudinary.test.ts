import { afterEach, describe, expect, it, vi } from "vitest";
import { cloudinary, sanitizeCloudinaryCloudName } from "./cloudinary";

describe("cloudinary helper", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sanitizes accidental cloud name labels and whitespace", () => {
    expect(sanitizeCloudinaryCloudName(" Cloud name\ndpl2u9uak ")).toBe("dpl2u9uak");
    expect(sanitizeCloudinaryCloudName("Cloud namedpl2u9uak")).toBe("dpl2u9uak");
    expect(sanitizeCloudinaryCloudName(" dp l2\nu9uak ")).toBe("dpl2u9uak");
  });

  it("returns an empty cloud name for invalid values", () => {
    expect(sanitizeCloudinaryCloudName("Cloud name !!!")).toBe("");
    expect(sanitizeCloudinaryCloudName(undefined)).toBe("");
  });

  it("builds optimized URLs with the sanitized cloud name", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "Cloud name\ndpl2u9uak");

    expect(
      cloudinary.url("framehub/user/image-id", {
        secure: true,
        transformation: [
          {
            width: 800,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto"
          }
        ]
      })
    ).toBe("https://res.cloudinary.com/dpl2u9uak/image/upload/w_800,c_limit,q_auto,f_auto/framehub/user/image-id");
  });

  it("does not generate a URL when the cloud name is missing", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "");

    expect(cloudinary.url("framehub/user/image-id")).toBe("");
  });
});
