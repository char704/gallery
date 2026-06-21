import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, User } from "lucide-react";
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
  const total = data?.total ?? 0;
  const photoOwner = photos[0]?.user;
  const profileUser = photoOwner ?? (currentUser?.id === userId ? currentUser : null);
  const photoLabel = total === 1 ? "published photo" : "published photos";
  const initial = profileUser?.name.trim().charAt(0).toUpperCase();

  return (
    <section className="space-y-5">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xl font-bold text-white">
              {profileUser?.avatarUrl ? (
                <img className="h-full w-full object-cover" src={profileUser.avatarUrl} alt={`${profileUser.name} avatar`} />
              ) : initial ? (
                initial
              ) : (
                <User size={28} />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">{profileUser?.name ?? "Public Photos"}</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {total} {photoLabel}
              </p>
            </div>
          </div>
          {currentUser?.id === userId ? (
            <button
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              disabled
            >
              <Settings size={16} />
              Settings coming soon
            </button>
          ) : null}
        </div>
      </header>
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
