import { useState } from "react";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoFilters } from "../components/Gallery/PhotoFilters";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { usePublicPhotos } from "../hooks/usePhotos";
import type { PhotoQueryParams } from "../types";

export default function Explore() {
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<NonNullable<PhotoQueryParams["sort"]>>("latest");
  const { data, isLoading, isError, error } = usePublicPhotos(page, 12, {
    tag: tag.trim() || undefined,
    sort
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {error instanceof Error ? error.message : "Could not load public photos."}
      </section>
    );
  }

  const photos = data?.photos ?? [];
  const pages = data?.pages ?? 1;

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Explore</h1>
      <p className="mt-2 text-slate-600">Public photos from the FrameHub community.</p>
      <div className="mt-5">
        <PhotoFilters
          tag={tag}
          sort={sort}
          onTagChange={(value) => {
            setTag(value);
            setPage(1);
          }}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </div>
      <div className="mt-5">
        <PhotoGrid photos={photos} />
        {photos.length > 0 ? (
          <div className="mt-6 flex items-center justify-center gap-3">
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
      </div>
    </section>
  );
}
