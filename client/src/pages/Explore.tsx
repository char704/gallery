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
  const pages = data?.pages ?? 1;
  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 1);
    const end = Math.min(Math.max(1, pages), page + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, pages]);

  useEffect(() => {
    setTagInput(urlTag);
  }, [urlTag]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (debouncedTag) {
      nextParams.set("tag", debouncedTag);
    } else {
      nextParams.delete("tag");
    }

    if (page !== 1) {
      nextParams.set("page", "1");
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedTag, page, searchParams, setSearchParams]);

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
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Explore</h1>
      <p className="mt-2 text-slate-600">Public photos from the FrameHub community.</p>
      <div className="mt-5">
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
          <div className="mb-5 flex flex-wrap gap-2">
            {tagInput.trim() ? (
              <span className="inline-flex items-center gap-2 rounded-lg bg-pine/10 px-3 py-1 text-sm font-semibold text-pine">
                Tag: {tagInput.trim()}
                <button
                  className="focus-ring rounded text-pine"
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
              <span className="inline-flex items-center gap-2 rounded-lg bg-pine/10 px-3 py-1 text-sm font-semibold text-pine">
                Sort: {sort === "popular" ? "popular" : "oldest"}
                <button
                  className="focus-ring rounded text-pine"
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
      <div className="mt-5">
        <PhotoGrid
          photos={photos}
          isLoading={isLoading}
          isError={isError}
          error={error instanceof Error ? error : null}
          emptyTitle={debouncedTag ? "No matching photos" : "No public photos yet"}
          emptyMessage={
            debouncedTag
              ? `No public photos found with tag "${debouncedTag}".`
              : "Upload a public photo to start the community gallery."
          }
        />
        {!isLoading && !isError && photos.length > 0 && pages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {visiblePages.map((visiblePage) => (
                <button
                  className={`focus-ring h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                    visiblePage === page ? "bg-pine text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"
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
              className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
