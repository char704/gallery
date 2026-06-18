import { apiRequest } from "./api";
import type { PhotoListResult, SearchQueryParams, SearchSuggestion, TrendingTag } from "../types";

function toQueryString(params: SearchQueryParams & { limit?: number } = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const searchService = {
  photos(params: SearchQueryParams): Promise<PhotoListResult> {
    return apiRequest<PhotoListResult>(`/search${toQueryString(params)}`);
  },

  suggestions(q: string, limit = 8): Promise<{ suggestions: SearchSuggestion[] }> {
    return apiRequest<{ suggestions: SearchSuggestion[] }>(`/search/suggestions${toQueryString({ q, limit })}`);
  },

  tags(limit = 12): Promise<{ tags: TrendingTag[] }> {
    return apiRequest<{ tags: TrendingTag[] }>(`/search/tags${toQueryString({ limit })}`);
  }
};
