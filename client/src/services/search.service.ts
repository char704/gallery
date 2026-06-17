import { apiRequest } from "./api";
import type { PaginatedResponse, Photo, SearchQueryParams } from "../types";

function toQueryString(params: SearchQueryParams): string {
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
  photos(params: SearchQueryParams): Promise<PaginatedResponse<Photo>> {
    return apiRequest<PaginatedResponse<Photo>>(`/search${toQueryString(params)}`);
  }
};
