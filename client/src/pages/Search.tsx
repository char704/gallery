import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SearchBar } from "../components/Search/SearchBar";
import { SearchResults } from "../components/Search/SearchResults";
import { searchService } from "../services/search.service";
import type { SearchQueryParams } from "../types";

type SortOption = NonNullable<SearchQueryParams["sort"]>;

export default function Search() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      q: query.trim(),
      tag: tag.trim(),
      sort,
      page,
      limit: 12
    }),
    [page, query, sort, tag]
  );

  const photosQuery = useQuery({
    queryKey: ["search", params],
    queryFn: () => searchService.photos(params),
    staleTime: 1000 * 30
  });

  const suggestionsQuery = useQuery({
    queryKey: ["search", "suggestions", query],
    queryFn: () => searchService.suggestions(query.trim(), 6),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60
  });

  const tagsQuery = useQuery({
    queryKey: ["search", "tags"],
    queryFn: () => searchService.tags(12),
    staleTime: 1000 * 60 * 5
  });

  const photos = photosQuery.data?.photos ?? [];
  const pages = photosQuery.data?.pages ?? 1;
  const total = photosQuery.data?.total ?? 0;

  const resetPage = () => setPage(1);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Search</h1>
        <p className="mt-1 text-sm text-slate-600">Find public photos by title, description, or tag.</p>
      </div>

      <div className="space-y-3">
        <SearchBar
          value={query}
          onChange={(value) => {
            setQuery(value);
            resetPage();
          }}
        />

        {suggestionsQuery.data?.suggestions.length ? (
          <div className="flex flex-wrap gap-2">
            {suggestionsQuery.data.suggestions.map((suggestion) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                className="focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:border-pine hover:text-pine"
                type="button"
                onClick={() => {
                  if (suggestion.type === "tag") {
                    setTag(suggestion.value);
                  } else {
                    setQuery(suggestion.value);
                  }
                  resetPage();
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <input
          className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
          value={tag}
          onChange={(event) => {
            setTag(event.target.value);
            resetPage();
          }}
          placeholder="Filter by tag"
        />
        <select
          className="focus-ring rounded-lg border border-slate-300 px-3 py-2"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as SortOption);
            resetPage();
          }}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      {tagsQuery.data?.tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tagsQuery.data.tags.map((trendingTag) => (
            <button
              key={trendingTag.id}
              className="focus-ring rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-pine hover:text-white"
              type="button"
              onClick={() => {
                setTag(trendingTag.slug);
                resetPage();
              }}
            >
              #{trendingTag.name} ({trendingTag.photoCount})
            </button>
          ))}
        </div>
      ) : null}

      {photosQuery.isError ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {photosQuery.error instanceof Error ? photosQuery.error.message : "Could not search photos."}
        </section>
      ) : null}

      {photosQuery.isLoading ? (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Searching photos...
        </section>
      ) : (
        <>
          <p className="text-sm text-slate-600">{total} public photos found</p>
          <SearchResults photos={photos} />
        </>
      )}

      {photos.length > 0 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {Math.max(1, pages)}
          </span>
          <button
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
