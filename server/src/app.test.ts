import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("FrameHub API", () => {
  it("returns health status", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });
});
