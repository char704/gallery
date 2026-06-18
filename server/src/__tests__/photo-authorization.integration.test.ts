import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { authService } from "../services/auth.service";
import { cloudinaryService } from "../services/cloudinary.service";

const app = createApp();
const runId = `photo-${Date.now()}`;

function emailFor(name: string) {
  return `${name}.${runId}@example.test`;
}

async function cleanup() {
  await prisma.photo.deleteMany({
    where: {
      publicId: {
        contains: runId
      }
    }
  });
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: runId
      }
    }
  });
}

describe("Photo authorization integration", () => {
  let ownerToken: string;
  let otherToken: string;
  let ownerId: string;
  let privatePhotoId: string;

  beforeEach(async () => {
    await cleanup();
    vi.spyOn(cloudinaryService, "deleteImage").mockResolvedValue(undefined);

    const owner = await authService.createUser(emailFor("owner"), "SecurePass123", "Owner");
    const other = await authService.createUser(emailFor("other"), "SecurePass123", "Other");
    ownerId = owner.id;
    ownerToken = authService.generateAccessToken(owner.id, owner.email, owner.role);
    otherToken = authService.generateAccessToken(other.id, other.email, other.role);

    const photo = await prisma.photo.create({
      data: {
        title: "Private Photo",
        imageUrl: "https://example.test/private.jpg",
        thumbnailUrl: "https://example.test/private-thumb.jpg",
        publicId: `private-${runId}`,
        width: 1000,
        height: 800,
        fileSize: 1000,
        visibility: "PRIVATE",
        userId: ownerId
      }
    });
    privatePhotoId = photo.id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("allows the owner to view a private photo", async () => {
    const response = await request(app).get(`/api/photos/${privatePhotoId}`).set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Private Photo");
  });

  it("rejects non-owners from viewing a private photo", async () => {
    const response = await request(app).get(`/api/photos/${privatePhotoId}`).set("Authorization", `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("allows the owner to update photo metadata", async () => {
    const response = await request(app)
      .patch(`/api/photos/${privatePhotoId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Updated Title"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated Title");
  });

  it("allows the owner to update photo tags", async () => {
    const response = await request(app)
      .patch(`/api/photos/${privatePhotoId}/tags`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        tags: ["Portrait", "Studio"]
      });

    expect(response.status).toBe(200);
    expect(response.body.data.tags.map((photoTag: { tag: { slug: string } }) => photoTag.tag.slug)).toEqual(["portrait", "studio"]);
  });

  it("rejects non-owners from updating photo metadata", async () => {
    const response = await request(app)
      .patch(`/api/photos/${privatePhotoId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        title: "Not Allowed"
      });

    expect(response.status).toBe(403);
  });

  it("rejects non-owners from updating photo tags", async () => {
    const response = await request(app)
      .patch(`/api/photos/${privatePhotoId}/tags`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        tags: ["not-allowed"]
      });

    expect(response.status).toBe(403);
  });

  it("allows the owner to delete a photo", async () => {
    const response = await request(app).delete(`/api/photos/${privatePhotoId}`).set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    await expect(
      prisma.photo.findUnique({
        where: {
          id: privatePhotoId
        }
      })
    ).resolves.toBeNull();
  });

  it("rejects non-owners from deleting a photo", async () => {
    const response = await request(app).delete(`/api/photos/${privatePhotoId}`).set("Authorization", `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
  });

  it("excludes private photos from the public gallery", async () => {
    const response = await request(app).get("/api/photos");

    expect(response.status).toBe(200);
    expect(response.body.data.photos.some((photo: { id: string }) => photo.id === privatePhotoId)).toBe(false);
  });

  it("includes public photos in the public gallery", async () => {
    await prisma.photo.create({
      data: {
        title: "Public Photo",
        imageUrl: "https://example.test/public.jpg",
        thumbnailUrl: "https://example.test/public-thumb.jpg",
        publicId: `public-${runId}`,
        width: 1000,
        height: 800,
        fileSize: 1000,
        visibility: "PUBLIC",
        userId: ownerId
      }
    });

    const response = await request(app).get("/api/photos");

    expect(response.status).toBe(200);
    expect(response.body.data.photos.some((photo: { publicId: string }) => photo.publicId === `public-${runId}`)).toBe(true);
  });
});
