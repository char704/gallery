import { apiRequest } from "./api";
import type { Album, PaginatedResponse } from "../types";

export const albumService = {
  list(token: string): Promise<PaginatedResponse<Album>> {
    return apiRequest<PaginatedResponse<Album>>("/albums", {
      token
    });
  }
};
