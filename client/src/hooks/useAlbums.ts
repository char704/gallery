import { useQuery } from "@tanstack/react-query";
import { albumService } from "../services/album.service";
import { useAuthStore } from "../store/authStore";

export function useAlbums(page = 1, limit = 12) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["albums", page, limit],
    queryFn: () => albumService.list(token ?? "", page, limit),
    enabled: Boolean(token)
  });
}
