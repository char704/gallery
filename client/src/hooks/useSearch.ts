import { useQuery } from "@tanstack/react-query";
import { searchService } from "../services/search.service";
import type { SearchQueryParams } from "../types";

export function useSearch(params: SearchQueryParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: () => searchService.photos(params),
    enabled: Boolean(params.q || params.tag || params.userId)
  });
}
