import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { authService } from "../services/auth.service";
import { cloudinaryService, type UploadedImage } from "../services/cloudinary.service";
import { photoService } from "../services/photo.service";

const app = createApp();
const runId = `upload-${Date.now()}`;
const tagRunId = runId.replace(/\D/g, "").slice(-8);
const pngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

function emailFor(name: string) {
  return `${name}.${runId}@example.test`;
}

function mockUpload(publicId = `framehub/test-user/${runId}`): UploadedImage {
  return {
    publicId,
    url: `https://res.cloudinary.com/test/image/upload/${publicId}.png`,
    thumbnailUrl: `https://res.cloudinary.com/test/image/upload/c_thumb/${publicId}.png`,
    width: 1,
    height: 1,
    fileSize: pngBuffer.length,
    folderPath: "framehub/test-user"
  };
}

async function createSession(name: string) {
  const user = await authService.createUser(emailFor(name), "SecurePass123", `${name} User`);
  const token = authService.generateAccessToken(user.id, user.email, user.role);

  return {
    user,
    token
  };
}

async function cleanup() {
  await prisma.photo.deleteMany({
    where: {
      OR: [
        {
          publicId: {
            contains: runId
          }
        },
        {
          title: {
            contains: runId
          }
        }
      ]
    }
  });
  await prisma.tag.deleteMany({
    where: {
      slug: {
        contains: tagRunId
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

describe("Photo upload integration", () => {
  beforeEach(async () => {
    await cleanup();
    vi.spyOn(cloudinaryService, "uploadImage").mockResolvedValue(mockUpload());
    vi.spyOn(cloudinaryService, "deleteImage").mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("uploads a valid authenticated image and stores metadata", async () => {
    const { token, user } = await createSession("valid");

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Upload ${runId}`)
      .field("description", "A mocked upload")
      .field("visibility", "PRIVATE")
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(`Upload ${runId}`);
    expect(response.body.data.userId).toBe(user.id);
    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        originalFileName: `${runId}.png`
      })
    );

    const photo = await prisma.photo.findUnique({
      where: {
        id: response.body.data.id
      }
    });
    expect(photo?.publicId).toContain(runId);
  });

  it("uploads tags and filters public photos by tag", async () => {
    const { token } = await createSession("tags");

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Tagged ${runId}`)
      .field("visibility", "PUBLIC")
      .field("tags", JSON.stringify(["Nature", "Travel", "nature"]))
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(201);
    expect(response.body.data.tags).toHaveLength(2);
    expect(response.body.data.tags.map((photoTag: { tag: { name: string } }) => photoTag.tag.name)).toEqual(["nature", "travel"]);

    const filtered = await request(app).get("/api/photos").query({
      tag: "nature"
    });

    expect(filtered.status).toBe(200);
    expect(filtered.body.data.photos.some((photo: { id: string }) => photo.id === response.body.data.id)).toBe(true);
  });

  it("maps tag inputs with matching slugs to one tag", async () => {
    const { token } = await createSession("tag-collision");
    const spacedName = `new york ${tagRunId}`;
    const slugName = `new-york-${tagRunId}`;

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Tag collision ${runId}`)
      .field("visibility", "PUBLIC")
      .field("tags", JSON.stringify([spacedName, slugName]))
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(201);
    expect(response.body.data.tags).toHaveLength(1);
    expect(response.body.data.tags[0].tag.slug).toBe(slugName);

    const matchingTags = await prisma.tag.findMany({
      where: {
        slug: slugName
      }
    });
    expect(matchingTags).toHaveLength(1);
  });

  it("returns search result tags in the nested photo tag shape", async () => {
    const { token } = await createSession("search-shape");
    const tagName = `search ${tagRunId}`;

    const uploadResponse = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Searchable ${runId}`)
      .field("visibility", "PUBLIC")
      .field("tags", JSON.stringify([tagName]))
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(uploadResponse.status).toBe(201);

    const searchResponse = await request(app).get("/api/search").query({
      q: `Searchable ${runId}`
    });

    expect(searchResponse.status).toBe(200);
    const photo = searchResponse.body.data.photos.find((result: { id: string }) => result.id === uploadResponse.body.data.id);
    expect(photo.tags).toEqual([
      expect.objectContaining({
        tag: expect.objectContaining({
          name: tagName,
          slug: `search-${tagRunId}`
        })
      })
    ]);
  });

  it("rejects uploads without authentication", async () => {
    const response = await request(app)
      .post("/api/photos")
      .field("title", `No auth ${runId}`)
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(401);
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects uploads without a title", async () => {
    const { token } = await createSession("missing-title");

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects uploads without a file", async () => {
    const { token } = await createSession("missing-file");

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Missing file ${runId}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("NO_FILE_UPLOADED");
  });

  it("rejects non-image uploads", async () => {
    const { token } = await createSession("non-image");

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Non image ${runId}`)
      .attach("image", Buffer.from("not an image"), {
        filename: `${runId}.txt`,
        contentType: "text/plain"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects oversized files before cloud upload", async () => {
    const { token } = await createSession("oversized");
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 1);

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", `Oversized ${runId}`)
      .attach("image", oversizedBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("UPLOAD_ERROR");
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects invalid metadata before cloud upload", async () => {
    const { token } = await createSession("metadata");

    const response = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "x".repeat(121))
      .attach("image", pngBuffer, {
        filename: `${runId}.png`,
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  });

  it("cleans up Cloudinary when database save fails after upload", async () => {
    const { user } = await createSession("cleanup");
    const uploaded = mockUpload(`framehub/${user.id}/${runId}-cleanup`);
    vi.mocked(cloudinaryService.uploadImage).mockResolvedValueOnce(uploaded);
    const createSpy = vi.spyOn(prisma.photo, "create").mockRejectedValueOnce(new Error("database failed"));

    await expect(
      photoService.createPhoto(user.id, `Cleanup ${runId}`, null, pngBuffer, `${runId}.png`, "PRIVATE")
    ).rejects.toThrow("database failed");

    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(uploaded.publicId);
    createSpy.mockRestore();
  });
});
