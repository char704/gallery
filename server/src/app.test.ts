import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("FrameHub API", () => {
  it("returns health status", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("rejects protected auth/me requests without a token", async () => {
    const response = await request(createApp()).get("/api/auth/me").expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("validates registration payloads before creating users", async () => {
    const response = await request(createApp())
      .post("/api/auth/register")
      .send({
        email: "not-an-email",
        password: "short",
        name: ""
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
