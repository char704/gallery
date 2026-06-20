import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 60;

type SearchSort = "latest" | "oldest" | "popular";

interface SearchPhotosParams {
  q?: string;
  tag?: string;
  userId?: string;
  sort?: SearchSort;
  page?: number;
  limit?: number;
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

function normalizeSearchTerm(value: unknown): string | undefined {
  const term = String(value ?? "").trim();
  return term.length > 0 ? term : undefined;
}

function toOrderBy(sort: SearchSort = "latest"): Prisma.PhotoOrderByWithRelationInput {
  if (sort === "oldest") {
    return {
      createdAt: "asc"
    };
  }

  if (sort === "popular") {
    return {
      likes: {
        _count: "desc"
      }
    };
  }

  return {
    createdAt: "desc"
  };
}

const searchPhotoInclude = {
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

type SearchPhoto = Prisma.PhotoGetPayload<{
  include: typeof searchPhotoInclude;
}>;

interface SearchPhotosResult {
  photos: SearchPhoto[];
  total: number;
  page: number;
  pages: number;
}

export const searchService = {
  async searchPhotos(params: SearchPhotosParams): Promise<SearchPhotosResult> {
    const pagination = normalizePagination(params.page, params.limit);
    const q = normalizeSearchTerm(params.q);
    const tag = normalizeSearchTerm(params.tag);
    const where: Prisma.PhotoWhereInput = {
      visibility: "PUBLIC",
      ...(params.userId ? { userId: params.userId } : {})
    };

    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: q,
            mode: "insensitive"
          }
        },
        {
          tags: {
            some: {
              tag: {
                OR: [
                  {
                    name: {
                      contains: q,
                      mode: "insensitive"
                    }
                  },
                  {
                    slug: {
                      contains: q.toLowerCase(),
                      mode: "insensitive"
                    }
                  }
                ]
              }
            }
          }
        }
      ];
    }

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
        orderBy: toOrderBy(params.sort),
        include: searchPhotoInclude
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

  async getSuggestions(q: string, limit = 8) {
    const term = normalizeSearchTerm(q);

    if (!term) {
      return [];
    }

    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const [photos, tags] = await Promise.all([
      prisma.photo.findMany({
        where: {
          visibility: "PUBLIC",
          title: {
            contains: term,
            mode: "insensitive"
          }
        },
        select: {
          id: true,
          title: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: safeLimit
      }),
      prisma.tag.findMany({
        where: {
          OR: [
            {
              name: {
                contains: term,
                mode: "insensitive"
              }
            },
            {
              slug: {
                contains: term.toLowerCase(),
                mode: "insensitive"
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true
        },
        orderBy: {
          name: "asc"
        },
        take: safeLimit
      })
    ]);

    return [
      ...photos.map((photo) => ({
        type: "photo" as const,
        id: photo.id,
        label: photo.title,
        value: photo.title
      })),
      ...tags.map((tag) => ({
        type: "tag" as const,
        id: tag.id,
        label: `#${tag.name}`,
        value: tag.slug
      }))
    ].slice(0, safeLimit);
  },

  async getTrendingTags(limit = 12) {
    const safeLimit = Math.min(Math.max(limit, 1), 30);
    const tags = await prisma.tag.findMany({
      orderBy: {
        photos: {
          _count: "desc"
        }
      },
      include: {
        _count: {
          select: {
            photos: true
          }
        }
      },
      take: safeLimit
    });

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      photoCount: tag._count.photos
    }));
  }
};
