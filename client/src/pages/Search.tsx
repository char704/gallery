import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, ArrowRight, Search as SearchIcon, SlidersHorizontal, Tag, X } from "lucide-react";
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
  const hasActiveFilters = Boolean(urlQuery || tag || sort !== "latest");
  const activeDescription = [
    urlQuery ? `"${urlQuery}"` : null,
    tag ? `tagged #${tag}` : null,
    sort !== "latest" ? `sorted by ${sort}` : null
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="space-y-6" aria-labelledby="search-title">
      <div className="flex flex-col gap-3 border-b border-vellum pb-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-lagoon-dark">Public discovery</p>
          <h1 id="search-title" className="mt-2 text-3xl font-semibold text-ink md:text-4xl">
            Search photos
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted md:text-base">
            Find public photos by title, description, tag, or creator without leaving the gallery flow.
          </p>
        </div>
        <p className="text-sm font-medium text-ink-muted" aria-live="polite">
          {photosQuery.isLoading ? "Searching photos..." : `${total} public ${total === 1 ? "photo" : "photos"} found`}
        </p>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={queryInput}
          onChange={(value) => {
            setQueryInput(value);
          }}
        />

        {suggestionsQuery.data?.suggestions.length ? (
          <section className="space-y-2" aria-labelledby="search-suggestions-title">
            <h2 id="search-suggestions-title" className="text-sm font-semibold text-ink">
              Suggestions
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestionsQuery.data.suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-lg border border-vellum bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
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
                  {suggestion.type === "tag" ? <Tag size={14} aria-hidden="true" /> : <SearchIcon size={14} aria-hidden="true" />}
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <section className="space-y-3 border-y border-vellum bg-surface/45 py-4" aria-labelledby="search-filters-title">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <SlidersHorizontal className="text-lagoon-dark" size={18} aria-hidden="true" />
          <h2 id="search-filters-title">Refine results</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="search-filter-tag">
              Tag filter
            </label>
            <input
              id="search-filter-tag"
              className="focus-ring min-h-11 w-full rounded-lg border border-vellum bg-white px-3 py-2 text-ink placeholder:text-ink-muted"
              value={tag}
              onChange={(event) => {
                updateParams({
                  tag: event.target.value,
                  page: 1
                });
              }}
              placeholder="Filter by tag"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="search-filter-sort">
              Sort by
            </label>
            <select
              id="search-filter-sort"
              className="focus-ring min-h-11 w-full rounded-lg border border-vellum bg-white px-3 py-2 text-ink"
              value={sort}
              onChange={(event) => {
                updateParams({
                  sort: event.target.value as SortOption,
                  page: 1
                });
              }}
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
              <option value="popular">Most liked</option>
            </select>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-ink-muted">Active:</span>
            {urlQuery ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-vellum bg-surface px-3 py-1 font-medium text-ink">
                Search "{urlQuery}"
              </span>
            ) : null}
            {tag ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-vellum bg-surface px-3 py-1 font-medium text-ink">
                <Tag size={14} aria-hidden="true" />#{tag}
              </span>
            ) : null}
            {sort !== "latest" ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-vellum bg-surface px-3 py-1 font-medium text-ink">
                {sort === "popular" ? "Most liked" : "Oldest first"}
              </span>
            ) : null}
            <button
              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-vellum bg-surface px-3 py-1 font-semibold text-ink transition hover:border-red-300 hover:text-red-700 motion-reduce:transition-none"
              type="button"
              onClick={() => {
                setQueryInput("");
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
            >
              <X size={14} aria-hidden="true" />
              Clear filters
            </button>
          </div>
        ) : null}
      </section>

      {tagsQuery.data?.tags.length ? (
        <section className="space-y-2" aria-labelledby="popular-tags-title">
          <h2 id="popular-tags-title" className="text-sm font-semibold text-ink">
            Popular tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tagsQuery.data.tags.map((trendingTag) => (
              <button
                key={trendingTag.id}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-vellum bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
                type="button"
                onClick={() => {
                  updateParams({
                    tag: trendingTag.slug,
                    page: 1
                  });
                }}
              >
                <Tag size={14} aria-hidden="true" />
                <span>#{trendingTag.name}</span>
                <span className="text-ink-muted">{trendingTag.photoCount}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {photosQuery.isError ? (
        <section className="flex gap-3 border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold">Search could not load</h2>
            <p className="mt-1 text-sm">
              {photosQuery.error instanceof Error ? photosQuery.error.message : "Could not search photos."}
            </p>
          </div>
        </section>
      ) : null}

      {photosQuery.isLoading ? (
        <PhotoGrid photos={[]} isLoading layout="masonry" />
      ) : (
        <section className="space-y-3" aria-labelledby="search-results-title">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="search-results-title" className="text-xl font-semibold text-ink">
                Results
              </h2>
              <p className="text-sm text-ink-muted">
                {activeDescription ? `Showing ${activeDescription}.` : "Showing public photos from FrameHub."}
              </p>
            </div>
            {photos.length > 0 ? (
              <p className="text-sm font-medium text-ink-muted">
                Page {page} of {Math.max(1, pages)}
              </p>
            ) : null}
          </div>
          <SearchResults
            photos={photos}
            emptyTitle={hasActiveFilters ? "No matching photos" : "Start searching public photos"}
            emptyMessage={
              hasActiveFilters
                ? "Try a broader search term, remove the tag filter, or choose a different popular tag."
                : "Search by title, description, tag, or creator to discover public photos."
            }
          />
        </section>
      )}

      {photos.length > 0 ? (
        <nav className="flex flex-wrap items-center justify-center gap-3 pt-2" aria-label="Search pagination">
          <button
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            type="button"
            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
            disabled={page === 1}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Previous
          </button>
          <span className="text-sm font-medium text-ink-muted" aria-current="page">
            Page {page} of {Math.max(1, pages)}
          </span>
          <button
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            type="button"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={page >= pages}
          >
            Next
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </section>
  );
}
