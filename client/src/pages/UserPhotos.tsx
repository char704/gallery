import { Image, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { photoService } from "../services/photo.service";
import { useAuthStore } from "../store/authStore";

export default function UserPhotos() {
  const { userId } = useParams();
  const [page, setPage] = useState(1);
  const currentUser = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["photos", "user", userId, page],
    queryFn: () => photoService.getPublicUserPhotos(userId ?? "", page, 12),
    enabled: Boolean(userId)
  });

  const photos = data?.photos ?? [];
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const photoOwner = photos[0]?.user;
  const profileUser = photoOwner ?? (currentUser?.id === userId ? currentUser : null);
  const initial = profileUser?.name.trim().charAt(0).toUpperCase();
  const resultSummary = useMemo(() => {
    if (isLoading) {
      return "Loading public photos";
    }

    if (isError) {
      return "Unable to load public photos";
    }

    const photoLabel = total === 1 ? "public photo" : "public photos";
    const pageText = pages > 1 ? `, page ${Math.min(page, pages)} of ${pages}` : "";

    return `${total} ${photoLabel}${pageText}`;
  }, [isError, isLoading, page, pages, total]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-vellum bg-surface/75 p-8" role="status" aria-label="Loading user photos">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="text-xl font-semibold text-red-950">User photos unavailable</h1>
        <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Could not load user photos."}</p>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="user-photos-heading">
      <header className="flex flex-col gap-4 border-b border-vellum pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink text-xl font-bold text-white shadow-soft">
            {profileUser?.avatarUrl ? (
              <img className="h-full w-full object-cover" src={profileUser.avatarUrl} alt={`${profileUser.name} avatar`} />
            ) : initial ? (
              initial
            ) : (
              <User size={28} />
            )}
          </div>
          <div className="min-w-0">
            <h1 id="user-photos-heading" className="truncate text-3xl font-bold leading-tight text-ink">
              {profileUser?.name ?? "Public Photos"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
              Public photos from this FrameHub gallery.
            </p>
          </div>
        </div>
        <p id="user-photos-summary" className="text-sm font-semibold text-pine-dark sm:rounded-lg sm:border sm:border-vellum sm:bg-surface/70 sm:px-3 sm:py-2" aria-live="polite">
          {resultSummary}
        </p>
      </header>

      {photos.length > 0 ? (
        <div aria-describedby="user-photos-summary">
          <PhotoGrid photos={photos} layout="masonry" photoCardPresentation="explore" />
          {pages > 1 ? (
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-3" aria-label="User photos pagination">
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
          <h2 className="mt-3 text-2xl font-bold text-ink">No public photos</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
            This user does not have public photos available right now.
          </p>
        </section>
      )}
    </section>
  );
}
