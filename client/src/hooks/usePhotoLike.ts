import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photo.service";
import { useAuthStore } from "../store/authStore";

export function usePhotoLike(photoId: string) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const likeQuery = useQuery({
    queryKey: ["likes", photoId, token],
    queryFn: () => photoService.getLikeSummary(photoId, token),
    enabled: Boolean(photoId)
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("You must be logged in to like this photo.");
      }

      return likeQuery.data?.isLiked ? photoService.unlikePhoto(photoId, token) : photoService.likePhoto(photoId, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["likes", photoId] });
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    }
  });

  return {
    isLoggedIn: Boolean(token),
    count: likeQuery.data?.count ?? 0,
    isLiked: likeQuery.data?.isLiked ?? false,
    isLoading: likeQuery.isLoading,
    toggleLike: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error
  };
}
