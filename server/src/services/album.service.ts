import type { Prisma, Visibility } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/errorHandler";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 60;

function normalizePagination(page = 1, limit = DEFAULT_LIMIT) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : DEFAULT_LIMIT;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit
  };
}

function parseVisibility(value: unknown): Visibility {
  return value === "PUBLIC" || value === "UNLISTED" || value === "PRIVATE" ? value : "PRIVATE";
}

const albumInclude = {
  coverPhoto: {
    select: {
      id: true,
      title: true,
      imageUrl: true,
      thumbnailUrl: true,
      width: true,
      height: true,
      visibility: true,
      userId: true,
      createdAt: true,
      updatedAt: true
    }
  },
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true
    }
  },
  _count: {
    select: {
      photos: true
    }
  }
} satisfies Prisma.AlbumInclude;

const albumDetailInclude = {
  ...albumInclude,
  photos: {
    orderBy: {
      addedAt: "desc"
    },
    include: {
      photo: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.AlbumInclude;

export const albumService = {
  async createAlbum(
    userId: string,
    name: string,
    description: string | null,
    visibility: Visibility = "PRIVATE"
  ) {
    return prisma.album.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        visibility,
        userId
      },
      include: albumInclude
    });
  },

  async getUserAlbums(userId: string, page = 1, limit = DEFAULT_LIMIT, includePrivate = false) {
    const pagination = normalizePagination(page, limit);
    const where: Prisma.AlbumWhereInput = {
      userId,
      ...(includePrivate ? {} : { visibility: "PUBLIC" })
    };

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc"
        },
        include: albumInclude
      }),
      prisma.album.count({ where })
    ]);

    return {
      albums,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit)
    };
  },

  async getPublicAlbums(page = 1, limit = DEFAULT_LIMIT) {
    const pagination = normalizePagination(page, limit);
    const where: Prisma.AlbumWhereInput = {
      visibility: "PUBLIC"
    };

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc"
        },
        include: albumInclude
      }),
      prisma.album.count({ where })
    ]);

    return {
      albums,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit)
    };
  },

  async getAlbumById(albumId: string, requesterId?: string) {
    const album = await prisma.album.findUnique({
      where: {
        id: albumId
      },
      include: albumDetailInclude
    });

    if (!album) {
      throw new AppError("Album not found.", 404, "ALBUM_NOT_FOUND");
    }

    if (album.visibility === "PRIVATE" && album.userId !== requesterId) {
      throw new AppError("Forbidden - Cannot view private album.", 403, "FORBIDDEN");
    }

    return album;
  },

  async updateAlbum(
    albumId: string,
    userId: string,
    updates: {
      name?: string;
      description?: string | null;
      visibility?: string;
      coverPhotoId?: string | null;
    }
  ) {
    const album = await prisma.album.findUnique({
      where: {
        id: albumId
      }
    });

    if (!album) {
      throw new AppError("Album not found.", 404, "ALBUM_NOT_FOUND");
    }

    if (album.userId !== userId) {
      throw new AppError("Forbidden - Not album owner.", 403, "FORBIDDEN");
    }

    if (updates.coverPhotoId) {
      const albumPhoto = await prisma.albumPhoto.findUnique({
        where: {
          albumId_photoId: {
            albumId,
            photoId: updates.coverPhotoId
          }
        }
      });

      if (!albumPhoto) {
        throw new AppError("Cover photo must already belong to this album.", 400, "COVER_PHOTO_NOT_IN_ALBUM");
      }
    }

    const data: Prisma.AlbumUpdateInput = {};

    if (updates.name !== undefined) {
      data.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      data.description = updates.description?.trim() || null;
    }

    if (updates.visibility !== undefined) {
      data.visibility = parseVisibility(updates.visibility);
    }

    if (updates.coverPhotoId !== undefined) {
      data.coverPhoto = updates.coverPhotoId
        ? {
            connect: {
              id: updates.coverPhotoId
            }
          }
        : {
            disconnect: true
          };
    }

    return prisma.album.update({
      where: {
        id: albumId
      },
      data,
      include: albumInclude
    });
  },

  async deleteAlbum(albumId: string, userId: string) {
    const album = await prisma.album.findUnique({
      where: {
        id: albumId
      }
    });

    if (!album) {
      throw new AppError("Album not found.", 404, "ALBUM_NOT_FOUND");
    }

    if (album.userId !== userId) {
      throw new AppError("Forbidden - Not album owner.", 403, "FORBIDDEN");
    }

    return prisma.album.delete({
      where: {
        id: albumId
      }
    });
  },

  async addPhotoToAlbum(albumId: string, photoId: string, userId: string) {
    const [album, photo] = await Promise.all([
      prisma.album.findUnique({
        where: {
          id: albumId
        }
      }),
      prisma.photo.findUnique({
        where: {
          id: photoId
        }
      })
    ]);

    if (!album) {
      throw new AppError("Album not found.", 404, "ALBUM_NOT_FOUND");
    }

    if (!photo) {
      throw new AppError("Photo not found.", 404, "PHOTO_NOT_FOUND");
    }

    if (album.userId !== userId || photo.userId !== userId) {
      throw new AppError("Forbidden - Not album or photo owner.", 403, "FORBIDDEN");
    }

    try {
      return await prisma.albumPhoto.create({
        data: {
          albumId,
          photoId
        },
        include: {
          photo: true
        }
      });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        throw new AppError("Photo is already in this album.", 409, "PHOTO_ALREADY_IN_ALBUM");
      }

      throw error;
    }
  },

  async removePhotoFromAlbum(albumId: string, photoId: string, userId: string) {
    const album = await prisma.album.findUnique({
      where: {
        id: albumId
      }
    });

    if (!album) {
      throw new AppError("Album not found.", 404, "ALBUM_NOT_FOUND");
    }

    if (album.userId !== userId) {
      throw new AppError("Forbidden - Not album owner.", 403, "FORBIDDEN");
    }

    const albumPhoto = await prisma.albumPhoto.findUnique({
      where: {
        albumId_photoId: {
          albumId,
          photoId
        }
      }
    });

    if (!albumPhoto) {
      throw new AppError("Photo is not in this album.", 404, "PHOTO_NOT_IN_ALBUM");
    }

    if (album.coverPhotoId === photoId) {
      await prisma.album.update({
        where: {
          id: albumId
        },
        data: {
          coverPhotoId: null
        }
      });
    }

    return prisma.albumPhoto.delete({
      where: {
        albumId_photoId: {
          albumId,
          photoId
        }
      }
    });
  },

  parseVisibility
};
