import { apiRequest } from "./api";
import type { PaginatedResponse, Photo, PhotoQueryParams } from "../types";

function toQueryString(params: PhotoQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const photoService = {
  list(params?: PhotoQueryParams): Promise<PaginatedResponse<Photo>> {
    return apiRequest<PaginatedResponse<Photo>>(`/photos${toQueryString(params)}`);
  },

  detail(photoId: string): Promise<Photo> {
    return apiRequest<Photo>(`/photos/${photoId}`);
  }
};
