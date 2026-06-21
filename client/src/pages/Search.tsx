import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { SearchBar } from "../components/Search/SearchBar";
import { SearchResults } from "../components/Search/SearchResults";
import { useDebounce } from "../hooks/useDebounce";
import { searchService } from "../services/search.service";
import type { SearchQueryParams } from "../types";

type SortOption = NonNullable<SearchQueryParams["sort"]>;

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseSort(value: string | null): SortOption {
  return value === "oldest" || value === "popular" || value === "latest" ? value : "latest";
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const sort = parseSort(searchParams.get("sort"));
  const page = parsePage(searchParams.get("page"));
  const [queryInput, setQueryInput] = useState(urlQuery);
  const debouncedQuery = useDebounce(queryInput.trim(), 350);

  useEffect(() => {
    setQueryInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const currentQuery = searchParams.get("q") ?? "";

    if (debouncedQuery === currentQuery) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (debouncedQuery) {
      nextParams.set("q", debouncedQuery);
    } else {
      nextParams.delete("q");
    }

    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  }, [debouncedQuery, searchParams, setSearchParams]);

  function updateParams(updates: { q?: string; tag?: string; sort?: SortOption; page?: number }, options?: { replace?: boolean }) {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.q !== undefined) {
      const nextQuery = updates.q.trim();

      if (nextQuery) {
        nextParams.set("q", nextQuery);
      } else {
        nextParams.delete("q");
      }
    }

    if (updates.tag !== undefined) {
      const nextTag = updates.tag.trim();

      if (nextTag) {
        nextParams.set("tag", nextTag);
      } else {
        nextParams.delete("tag");
      }
    }

    if (updates.sort !== undefined) {
      if (updates.sort === "latest") {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", updates.sort);
      }
    }

    if (updates.page !== undefined) {
      if (updates.page <= 1) {
        nextParams.delete("page");
      } else {
        nextParams.set("page", String(updates.page));
      }
    }

    setSearchParams(nextParams, { replace: options?.replace });
  }

  const params = useMemo(
    () => ({
      q: debouncedQuery,
      tag: tag.trim(),
      sort,
      page,
      limit: 12
    }),
    [debouncedQuery, page, sort, tag]
  );

  const photosQuery = useQuery({
    queryKey: ["search", params],
    queryFn: () => searchService.photos(params),
    staleTime: 1000 * 30
  });

  const suggestionsQuery = useQuery({
    queryKey: ["search", "suggestions", debouncedQuery],
    queryFn: () => searchService.suggestions(debouncedQuery, 6),
    enabled: debouncedQuery.length >= 2,
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

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Search</h1>
        <p className="mt-1 text-sm text-slate-600">Find public photos by title, description, or tag.</p>
      </div>

      <div className="space-y-3">
        <SearchBar
          value={queryInput}
          onChange={(value) => {
            setQueryInput(value);
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
                    updateParams({ tag: suggestion.value, page: 1 });
                  } else {
                    setQueryInput(suggestion.value);
                    updateParams({ q: suggestion.value, page: 1 });
                  }
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <label className="sr-only" htmlFor="search-filter-tag">
          Filter search results by tag
        </label>
        <input
          id="search-filter-tag"
          className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
          value={tag}
          onChange={(event) => {
            updateParams({
              tag: event.target.value,
              page: 1
            });
          }}
          placeholder="Filter by tag"
        />
        <label className="sr-only" htmlFor="search-filter-sort">
          Sort search results
        </label>
        <select
          id="search-filter-sort"
          className="focus-ring rounded-lg border border-slate-300 px-3 py-2"
          value={sort}
          onChange={(event) => {
            updateParams({
              sort: event.target.value as SortOption,
              page: 1
            });
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
                updateParams({
                  tag: trendingTag.slug,
                  page: 1
                });
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
        <PhotoGrid photos={[]} isLoading layout="masonry" />
      ) : (
        <>
          <p className="text-sm text-slate-600">{total} public photos found</p>
          <SearchResults photos={photos} />
        </>
      )}

      {photos.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            type="button"
            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
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
            onClick={() => updateParams({ page: page + 1 })}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
