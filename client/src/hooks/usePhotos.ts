import { useQuery } from "@tanstack/react-query";
import { photoService } from "../services/photo.service";
import type { PhotoQueryParams } from "../types";

export function usePhotos(params: PhotoQueryParams = {}) {
  return useQuery({
    queryKey: ["photos", params],
    queryFn: () => photoService.list(params)
  });
}

export function usePhoto(photoId: string) {
  return useQuery({
    queryKey: ["photos", photoId],
    queryFn: () => photoService.detail(photoId),
    enabled: Boolean(photoId)
  });
}
