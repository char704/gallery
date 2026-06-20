import type { Photo, Prisma, Visibility } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import { cloudinaryService } from "./cloudinary.service";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 60;
type PhotoSort = "latest" | "oldest" | "popular";

export interface PhotoListResult {
  photos: Array<
    Photo & {
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
      _count: {
        likes: number;
        comments: number;
      };
      tags: Array<{
        tag: {
          id: string;
          name: string;
          slug: string;
          createdAt: Date;
          updatedAt: Date;
        };
      }>;
    }
  >;
  total: number;
  page: number;
  pages: number;
}

function normalizePagination(page = 1, limit = DEFAULT_LIMIT) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : DEFAULT_LIMIT;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit
  };
}

function visibilityOrDefault(value: unknown): Visibility {
  return value === "PUBLIC" || value === "UNLISTED" || value === "PRIVATE" ? value : "PRIVATE";
}

function sortOrDefault(value: unknown): PhotoSort {
  return value === "oldest" || value === "popular" || value === "latest" ? value : "latest";
}

function toPublicOrderBy(sort: PhotoSort): Prisma.PhotoOrderByWithRelationInput[] {
  if (sort === "oldest") {
    return [{ createdAt: "asc" }];
  }

  if (sort === "popular") {
    return [
      {
        likes: {
          _count: "desc"
        }
      },
      {
        createdAt: "desc"
      }
    ];
  }

  return [{ createdAt: "desc" }];
}

function toTagSlug(name: string) {
  return name.replace(/\s+/g, "-");
}

const photoInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true
    }
  },
  tags: {
    include: {
      tag: true
    }
  },
  _count: {
    select: {
      likes: true,
      comments: true
    }
  }
} satisfies Prisma.PhotoInclude;

export const photoService = {
  async createPhoto(
    userId: string,
    title: string,
    description: string | null,
    fileBuffer: Buffer,
    originalFileName: string,
    visibility: Visibility = "PRIVATE",
    tags: string[] = []
  ) {
    const cloudinaryData = await cloudinaryService.uploadImage({
      fileBuffer,
      userId,
      originalFileName
    });

    try {
      const tagRecords = await this.ensureTags(tags);

      return await prisma.photo.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          imageUrl: cloudinaryData.url,
          thumbnailUrl: cloudinaryData.thumbnailUrl,
          publicId: cloudinaryData.publicId,
          width: cloudinaryData.width,
          height: cloudinaryData.height,
          fileSize: cloudinaryData.fileSize,
          visibility,
          userId,
          tags: tagRecords.length
            ? {
                createMany: {
                  data: tagRecords.map((tag) => ({
                    tagId: tag.id
                  }))
                }
              }
            : undefined
        },
        include: photoInclude
      });
    } catch (error) {
      try {
        await cloudinaryService.deleteImage(cloudinaryData.publicId);
      } catch (cleanupError) {
        logger.warn("Failed to clean up Cloudinary upload after database error", {
          publicId: cloudinaryData.publicId,
          cleanupError
        });
      }

      throw error;
    }
  },

  async ensureTags(tagNames: string[]) {
    const normalizedTags = tagNames
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length <= 30)
      .map((name) => ({
        name,
        slug: toTagSlug(name)
      }))
      .filter((tag, index, self) => self.findIndex((item) => item.slug === tag.slug) === index)
      .slice(0, 20);

    if (!normalizedTags.length) {
      return [];
    }

    return Promise.all(
      normalizedTags.map(({ name, slug }) =>
        prisma.tag.upsert({
          where: {
            slug
          },
          update: {},
          create: {
            name,
            slug
          }
        })
      )
    );
  },

  async getUserPhotos(userId: string, page = 1, limit = DEFAULT_LIMIT, includePrivate = false): Promise<PhotoListResult> {
    const pagination = normalizePagination(page, limit);
    const where: Prisma.PhotoWhereInput = {
      userId,
      ...(includePrivate ? {} : { visibility: "PUBLIC" })
    };

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc"
        },
        include: photoInclude
      }),
      prisma.photo.count({ where })
    ]);

    return {
      photos,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit)
    };
  },

  async getPublicPhotos(
    page = 1,
    limit = DEFAULT_LIMIT,
    options: {
      tag?: string;
      sort?: string;
    } = {}
  ): Promise<PhotoListResult> {
    const pagination = normalizePagination(page, limit);
    const where: Prisma.PhotoWhereInput = {
      visibility: "PUBLIC"
    };
    const tag = options.tag?.trim();

    if (tag) {
      where.tags = {
        some: {
          tag: {
            OR: [
              {
                slug: tag.toLowerCase()
              },
              {
                name: {
                  equals: tag,
                  mode: "insensitive"
                }
              }
            ]
          }
        }
      };
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: toPublicOrderBy(sortOrDefault(options.sort)),
        include: photoInclude
      }),
      prisma.photo.count({ where })
    ]);

    return {
      photos,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit)
    };
  },

  async getPhotoById(photoId: string) {
    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!photo) {
      throw new AppError("Photo not found.", 404, "PHOTO_NOT_FOUND");
    }

    return photo;
  },

  async updatePhoto(
    photoId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string | null;
      visibility?: string;
    }
  ) {
    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId
      }
    });

    if (!photo) {
      throw new AppError("Photo not found.", 404, "PHOTO_NOT_FOUND");
    }

    if (photo.userId !== userId) {
      throw new AppError("Forbidden - Not photo owner.", 403, "FORBIDDEN");
    }

    const data: Prisma.PhotoUpdateInput = {};

    if (updates.title !== undefined) {
      data.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      data.description = updates.description?.trim() || null;
    }

    if (updates.visibility !== undefined) {
      data.visibility = visibilityOrDefault(updates.visibility);
    }

    return prisma.photo.update({
      where: {
        id: photoId
      },
      data,
      include: photoInclude
    });
  },

  async updatePhotoTags(photoId: string, userId: string, tagNames: string[]) {
    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId
      }
    });

    if (!photo) {
      throw new AppError("Photo not found.", 404, "PHOTO_NOT_FOUND");
    }

    if (photo.userId !== userId) {
      throw new AppError("Forbidden - Not photo owner.", 403, "FORBIDDEN");
    }

    const tags = await this.ensureTags(tagNames);

    await prisma.$transaction([
      prisma.photoTag.deleteMany({
        where: {
          photoId
        }
      }),
      ...(tags.length
        ? [
            prisma.photoTag.createMany({
              data: tags.map((tag) => ({
                photoId,
                tagId: tag.id
              }))
            })
          ]
        : [])
    ]);

    return prisma.photo.findUniqueOrThrow({
      where: {
        id: photoId
      },
      include: photoInclude
    });
  },

  async deletePhoto(photoId: string, userId: string) {
    const photo = await prisma.photo.findUnique({
      where: {
        id: photoId
      }
    });

    if (!photo) {
      throw new AppError("Photo not found.", 404, "PHOTO_NOT_FOUND");
    }

    if (photo.userId !== userId) {
      throw new AppError("Forbidden - Not photo owner.", 403, "FORBIDDEN");
    }

    const deletedPhoto = await prisma.photo.delete({
      where: {
        id: photoId
      }
    });

    try {
      await cloudinaryService.deleteImage(photo.publicId);
    } catch (error) {
      logger.warn("Failed to delete Cloudinary image after database record removal", {
        publicId: photo.publicId,
        error
      });
    }

    return deletedPhoto;
  },

  parseVisibility: visibilityOrDefault,
  parseSort: sortOrDefault
};
