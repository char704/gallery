import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { authService } from "../services/auth.service";
import type { Visibility } from "@prisma/client";

const app = createApp();
const runId = `search-${randomUUID()}`;
const tagRunId = runId;

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

describe("Search integration", () => {
  let userId: string;

  beforeEach(async () => {
    await cleanup();
    const user = await authService.createUser(emailFor("search"), "SecurePass123", "Search User");
    userId = user.id;
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  async function createTaggedPhoto(tagId: string, visibility: Visibility, index: number, createdAt = new Date()) {
    return prisma.photo.create({
      data: {
        title: `${visibility.toLowerCase()} leak ${tagRunId} ${index}`,
        imageUrl: `https://example.test/${runId}-${index}.jpg`,
        thumbnailUrl: `https://example.test/${runId}-${index}-thumb.jpg`,
        publicId: `${runId}-${index}`,
        width: 1000,
        height: 800,
        fileSize: 1000,
        visibility,
        createdAt,
        userId,
        tags: {
          create: {
            tagId
          }
        }
      }
    });
  }

  it("excludes private-only and unlisted-only tags from public suggestions and trending tags", async () => {
    const privateOnlyTag = await prisma.tag.create({
      data: {
        name: `private leak ${tagRunId}`,
        slug: `private-leak-${tagRunId}`
      }
    });
    const unlistedOnlyTag = await prisma.tag.create({
      data: {
        name: `unlisted leak ${tagRunId}`,
        slug: `unlisted-leak-${tagRunId}`
      }
    });
    const publicTag = await prisma.tag.create({
      data: {
        name: `public leak ${tagRunId}`,
        slug: `public-leak-${tagRunId}`
      }
    });
    const mixedTag = await prisma.tag.create({
      data: {
        name: `mixed leak ${tagRunId}`,
        slug: `mixed-leak-${tagRunId}`
      }
    });

    await Promise.all([
      createTaggedPhoto(privateOnlyTag.id, "PRIVATE", 1),
      createTaggedPhoto(privateOnlyTag.id, "PRIVATE", 2),
      createTaggedPhoto(privateOnlyTag.id, "UNLISTED", 3),
      createTaggedPhoto(unlistedOnlyTag.id, "UNLISTED", 4),
      createTaggedPhoto(publicTag.id, "PUBLIC", 5),
      createTaggedPhoto(mixedTag.id, "PUBLIC", 6),
      createTaggedPhoto(mixedTag.id, "PRIVATE", 7),
      createTaggedPhoto(mixedTag.id, "UNLISTED", 8)
    ]);

    const suggestionsResponse = await request(app).get("/api/search/suggestions").query({
      q: `leak ${tagRunId}`,
      limit: 20
    });

    expect(suggestionsResponse.status).toBe(200);
    const suggestionSlugs = suggestionsResponse.body.data.suggestions
      .filter((suggestion: { type: string }) => suggestion.type === "tag")
      .map((suggestion: { value: string }) => suggestion.value);
    expect(suggestionSlugs).toContain(publicTag.slug);
    expect(suggestionSlugs).toContain(mixedTag.slug);
    expect(suggestionSlugs).not.toContain(privateOnlyTag.slug);
    expect(suggestionSlugs).not.toContain(unlistedOnlyTag.slug);

    const trendingResponse = await request(app).get("/api/search/tags").query({
      limit: 30
    });

    expect(trendingResponse.status).toBe(200);
    const trendingTags = trendingResponse.body.data.tags as Array<{ slug: string; photoCount: number }>;
    const trendingSlugs = trendingTags.map((tag) => tag.slug);
    expect(trendingSlugs).toContain(publicTag.slug);
    expect(trendingSlugs).toContain(mixedTag.slug);
    expect(trendingSlugs).not.toContain(privateOnlyTag.slug);
    expect(trendingSlugs).not.toContain(unlistedOnlyTag.slug);
    expect(trendingTags.find((tag) => tag.slug === mixedTag.slug)?.photoCount).toBe(1);
  });

  it("uses newest creation date as a secondary sort for equally popular photos", async () => {
    const tag = await prisma.tag.create({
      data: {
        name: `popular tie ${tagRunId}`,
        slug: `popular-tie-${tagRunId}`
      }
    });
    const olderPhoto = await createTaggedPhoto(tag.id, "PUBLIC", 21, new Date("2026-01-01T00:00:00.000Z"));
    const newerPhoto = await createTaggedPhoto(tag.id, "PUBLIC", 22, new Date("2026-02-01T00:00:00.000Z"));

    const response = await request(app).get("/api/search").query({
      q: `leak ${tagRunId}`,
      sort: "popular",
      limit: 10
    });

    expect(response.status).toBe(200);
    const resultIds = response.body.data.photos.map((photo: { id: string }) => photo.id);
    expect(resultIds.indexOf(newerPhoto.id)).toBeLessThan(resultIds.indexOf(olderPhoto.id));
  });
});
