import { apiRequest } from "./api";
import type { Photo, PhotoListResult, PhotoQueryParams, UploadPhotoPayload, Visibility } from "../types";

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
  list(params?: PhotoQueryParams): Promise<PhotoListResult> {
    return apiRequest<PhotoListResult>(`/photos${toQueryString(params)}`);
  },

  detail(photoId: string): Promise<Photo> {
    return apiRequest<Photo>(`/photos/${photoId}`);
  },

  getPhotoById(photoId: string, token?: string | null): Promise<Photo> {
    return apiRequest<Photo>(`/photos/${photoId}`, {
      token: token ?? undefined
    });
  },

  getPublicPhotos(page = 1, limit = 12): Promise<PhotoListResult> {
    return apiRequest<PhotoListResult>(`/photos${toQueryString({ page, limit })}`);
  },

  getUserPhotos(page = 1, limit = 12, token?: string | null): Promise<PhotoListResult> {
    return apiRequest<PhotoListResult>(`/photos/feed${toQueryString({ page, limit })}`, {
      token: token ?? undefined
    });
  },

  getPublicUserPhotos(userId: string, page = 1, limit = 12): Promise<PhotoListResult> {
    return apiRequest<PhotoListResult>(`/photos/user/${userId}${toQueryString({ page, limit })}`);
  },

  uploadPhoto(payload: UploadPhotoPayload, token: string): Promise<Photo> {
    const formData = new FormData();
    formData.append("image", payload.file);
    formData.append("title", payload.title);
    formData.append("description", payload.description ?? "");
    formData.append("visibility", payload.visibility);

    return apiRequest<Photo>("/photos", {
      method: "POST",
      body: formData,
      token
    });
  },

  updatePhoto(
    photoId: string,
    data: {
      title?: string;
      description?: string | null;
      visibility?: Visibility;
    },
    token: string
  ): Promise<Photo> {
    return apiRequest<Photo>(`/photos/${photoId}`, {
      method: "PATCH",
      body: data,
      token
    });
  },

  deletePhoto(photoId: string, token: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/photos/${photoId}`, {
      method: "DELETE",
      token
    });
  }
};
