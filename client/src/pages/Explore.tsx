import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PhotoFilters } from "../components/Gallery/PhotoFilters";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { useDebounce } from "../hooks/useDebounce";
import { usePublicPhotos } from "../hooks/usePhotos";
import type { PhotoQueryParams } from "../types";

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseSort(value: string | null): NonNullable<PhotoQueryParams["sort"]> {
  return value === "oldest" || value === "popular" || value === "latest" ? value : "latest";
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTag = searchParams.get("tag") ?? "";
  const page = parsePage(searchParams.get("page"));
  const sort = parseSort(searchParams.get("sort"));
  const [tagInput, setTagInput] = useState(urlTag);
  const debouncedTag = useDebounce(tagInput.trim(), 400);
  const { data, isLoading, isError, error } = usePublicPhotos(page, 12, {
    tag: debouncedTag || undefined,
    sort
  });
  const photos = data?.photos ?? [];
  const totalPhotos = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const resultSummary = useMemo(() => {
    if (isLoading) {
      return "Loading public photos";
    }

    if (isError) {
      return "Unable to load public photos";
    }

    const photoLabel = totalPhotos === 1 ? "photo" : "photos";
    const tagText = debouncedTag ? ` tagged "${debouncedTag}"` : "";
    const pageText = pages > 1 ? `, page ${Math.min(page, pages)} of ${pages}` : "";

    return `${totalPhotos} public ${photoLabel}${tagText}${pageText}`;
  }, [debouncedTag, isError, isLoading, page, pages, totalPhotos]);
  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 1);
    const end = Math.min(Math.max(1, pages), page + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, pages]);

  useEffect(() => {
    setTagInput(urlTag);
  }, [urlTag]);

  useEffect(() => {
    const currentTag = searchParams.get("tag") ?? "";

    // Prevent resetting if the tag hasn't actually changed
    if (debouncedTag === currentTag) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (debouncedTag) {
      nextParams.set("tag", debouncedTag);
    } else {
      nextParams.delete("tag");
    }

    // Reset to page 1 only because the filter tag changed
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  }, [debouncedTag, searchParams, setSearchParams]);

  useEffect(() => {
    if (!isLoading && !isError && data && page > Math.max(1, pages)) {
      const nextParams = new URLSearchParams(searchParams);

      if (pages <= 1) {
        nextParams.delete("page");
      } else {
        nextParams.set("page", String(pages));
      }

      setSearchParams(nextParams, { replace: true });
    }
  }, [data, isError, isLoading, page, pages, searchParams, setSearchParams]);

  function updateParams(updates: { tag?: string; sort?: NonNullable<PhotoQueryParams["sort"]>; page?: number }) {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.tag !== undefined) {
      if (updates.tag.trim()) {
        nextParams.set("tag", updates.tag.trim());
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

    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage: number) {
    updateParams({
      page: Math.min(Math.max(1, nextPage), Math.max(1, pages))
    });

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  return (
    <section className="space-y-4 sm:space-y-5" aria-labelledby="explore-heading">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="explore-heading" className="text-3xl font-bold leading-tight text-ink">
            Explore
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            Browse public photos by tag, date, or the images people return to.
          </p>
        </div>
        <p
          id="explore-results-summary"
          className="text-sm font-semibold text-pine-dark sm:rounded-lg sm:border sm:border-vellum sm:bg-surface/70 sm:px-3 sm:py-2"
          aria-live="polite"
        >
          {resultSummary}
        </p>
      </header>
      <div className="space-y-3">
        <PhotoFilters
          tag={tagInput}
          sort={sort}
          onTagChange={(value) => {
            setTagInput(value);
          }}
          onSortChange={(value) => {
            updateParams({
              sort: value,
              page: 1
            });
          }}
        />
        {tagInput.trim() || sort !== "latest" ? (
          <div className="flex flex-wrap gap-2" aria-label="Active filters">
            {tagInput.trim() ? (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-pine-light py-1 pl-3 pr-1 text-sm font-semibold text-pine-dark">
                Tag: {tagInput.trim()}
                <button
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-pine-dark hover:bg-surface/70"
                  type="button"
                  onClick={() => {
                    setTagInput("");
                    updateParams({
                      tag: "",
                      page: 1
                    });
                  }}
                  aria-label="Clear tag filter"
                >
                  <X size={14} />
                </button>
              </span>
            ) : null}
            {sort !== "latest" ? (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-pine-light py-1 pl-3 pr-1 text-sm font-semibold text-pine-dark">
                Sort: {sort === "popular" ? "popular" : "oldest"}
                <button
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-pine-dark hover:bg-surface/70"
                  type="button"
                  onClick={() =>
                    updateParams({
                      sort: "latest",
                      page: 1
                    })
                  }
                  aria-label="Clear sort filter"
                >
                  <X size={14} />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div aria-busy={isLoading} aria-describedby="explore-results-summary">
        <PhotoGrid
          photos={photos}
          layout="masonry"
          photoCardPresentation="explore"
          isLoading={isLoading}
          isError={isError}
          error={error instanceof Error ? error : null}
          emptyTitle={debouncedTag ? "No matching photos" : "No public photos yet"}
          emptyMessage={
            debouncedTag
              ? `No public photos found with tag "${debouncedTag}".`
              : "Upload a public photo to start the gallery."
          }
        />
        {!isLoading && !isError && photos.length > 0 && pages > 1 ? (
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-3" aria-label="Explore pagination">
            <button
              className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {visiblePages.map((visiblePage) => (
                <button
                  className={`focus-ring h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                    visiblePage === page ? "bg-pine text-white" : "border border-vellum bg-surface text-ink-soft hover:border-lagoon hover:text-lagoon-dark"
                  }`}
                  key={visiblePage}
                  type="button"
                  onClick={() => handlePageChange(visiblePage)}
                  aria-current={visiblePage === page ? "page" : undefined}
                >
                  {visiblePage}
                </button>
              ))}
            </div>
            <button
              className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pages}
              aria-label="Go to next page"
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
