import { Image, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { useMyPhotos } from "../hooks/usePhotos";

export default function MyPhotos() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useMyPhotos(page, 12);
  const photos = data?.photos ?? [];
  const pages = data?.pages ?? 1;
  const totalPhotos = data?.total ?? 0;
  const resultSummary = useMemo(() => {
    if (isLoading) {
      return "Loading your photos";
    }

    if (isError) {
      return "Unable to load your photos";
    }

    const photoLabel = totalPhotos === 1 ? "photo" : "photos";
    const pageText = pages > 1 ? `, page ${Math.min(page, pages)} of ${pages}` : "";

    return `${totalPhotos} ${photoLabel}${pageText}`;
  }, [isError, isLoading, page, pages, totalPhotos]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-vellum bg-surface/75 p-8" role="status" aria-label="Loading your photos">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="text-xl font-semibold text-red-950">Photos unavailable</h1>
        <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Could not load photos."}</p>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="my-photos-heading">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="my-photos-heading" className="text-3xl font-bold leading-tight text-ink">
            My Photos
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            Review your uploads and open any photo to manage details, tags, comments, and privacy.
          </p>
        </div>
        <p id="my-photos-summary" className="text-sm font-semibold text-pine-dark sm:rounded-lg sm:border sm:border-vellum sm:bg-surface/70 sm:px-3 sm:py-2" aria-live="polite">
          {resultSummary}
        </p>
      </header>

      {photos.length > 0 ? (
        <div aria-describedby="my-photos-summary">
          <PhotoGrid photos={photos} layout="masonry" photoCardPresentation="explore" />
          {pages > 1 ? (
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-3" aria-label="My photos pagination">
              <button
                className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm text-ink-soft">
                Page {page} of {Math.max(1, pages)}
              </span>
              <button
                className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= pages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </div>
      ) : (
        <section className="rounded-xl border border-dashed border-vellum bg-surface/75 p-8 text-center">
          <Image className="mx-auto text-lagoon" size={34} />
          <h2 className="mt-3 text-2xl font-bold text-ink">No photos yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Upload your first image to start building a private gallery you can organize into albums later.
          </p>
          <Link className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-pine-dark" to="/upload">
            <UploadCloud size={18} />
            Upload photo
          </Link>
        </section>
      )}
    </section>
  );
}
