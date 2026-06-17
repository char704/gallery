import { useQuery } from "@tanstack/react-query";
import { albumService } from "../services/album.service";
import { useAuthStore } from "../store/authStore";

export function useAlbums() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["albums"],
    queryFn: () => albumService.list(token ?? ""),
    enabled: Boolean(token)
  });
}
