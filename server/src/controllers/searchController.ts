import type { RequestHandler } from "express";
import { successResponse } from "../utils/responseFormatter";

export const searchController = {
  search: ((_req, res) => {
    res.json(successResponse({ items: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  }) satisfies RequestHandler
};
