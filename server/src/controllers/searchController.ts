import type { RequestHandler } from "express";
import { searchService } from "../services/search.service";
import { successResponse } from "../utils/responseFormatter";

function parsePage(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const searchController = {
  search: (async (req, res, next) => {
    try {
      const result = await searchService.searchPhotos({
        q: typeof req.query.q === "string" ? req.query.q : undefined,
        tag: typeof req.query.tag === "string" ? req.query.tag : undefined,
        userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
        sort:
          req.query.sort === "oldest" || req.query.sort === "popular" || req.query.sort === "latest"
            ? req.query.sort
            : "latest",
        page: parsePage(req.query.page, 1),
        limit: parsePage(req.query.limit, 12)
      });

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  suggestions: (async (req, res, next) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q : "";
      const limit = parsePage(req.query.limit, 8);
      const suggestions = await searchService.getSuggestions(q, limit);

      res.json(successResponse({ suggestions }));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  tags: (async (req, res, next) => {
    try {
      const limit = parsePage(req.query.limit, 12);
      const tags = await searchService.getTrendingTags(limit);

      res.json(successResponse({ tags }));
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
