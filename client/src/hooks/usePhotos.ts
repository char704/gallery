import { useQuery } from "@tanstack/react-query";
import { photoService } from "../services/photo.service";
import type { PhotoQueryParams } from "../types";
import { useAuthStore } from "../store/authStore";

export function usePhotos(params: PhotoQueryParams = {}) {
  return useQuery({
    queryKey: ["photos", params],
    queryFn: () => photoService.list(params)
  });
}

export function usePhoto(photoId: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["photos", photoId],
    queryFn: () => photoService.getPhotoById(photoId, token),
    enabled: Boolean(photoId)
  });
}

export function useMyPhotos(page = 1, limit = 12) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["photos", "mine", page, limit],
    queryFn: () => photoService.getUserPhotos(page, limit, token),
    enabled: Boolean(token)
  });
}

export function usePublicPhotos(page = 1, limit = 12, params: Omit<PhotoQueryParams, "page" | "limit" | "visibility"> = {}) {
  return useQuery({
    queryKey: ["photos", "public", page, limit, params],
    queryFn: () => photoService.getPublicPhotos(page, limit, params)
  });
}
