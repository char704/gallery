import { Link } from "react-router-dom";
import { useState } from "react";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { useMyPhotos } from "../hooks/usePhotos";

interface GalleryProps {
  title?: string;
}

export default function Gallery({ title = "Gallery" }: GalleryProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useMyPhotos(page, 12);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {error instanceof Error ? error.message : "Could not load photos."}
      </section>
    );
  }

  const photos = data?.photos ?? [];
  const pages = data?.pages ?? 1;

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <div className="mt-5">
        {photos.length > 0 ? (
          <>
            <PhotoGrid photos={photos} />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-ink">No photos yet</h2>
            <p className="mt-2 text-sm text-slate-500">Start by uploading your first photo.</p>
            <Link className="focus-ring mt-4 inline-block rounded-lg bg-pine px-4 py-2 font-semibold text-white" to="/upload">
              Upload photo
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
