import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { photoService } from "../services/photo.service";

export default function UserPhotos() {
  const { userId } = useParams();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["photos", "user", userId, page],
    queryFn: () => photoService.getPublicUserPhotos(userId ?? "", page, 12),
    enabled: Boolean(userId)
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {error instanceof Error ? error.message : "Could not load user photos."}
      </section>
    );
  }

  const photos = data?.photos ?? [];
  const pages = data?.pages ?? 1;

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Public Photos</h1>
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
