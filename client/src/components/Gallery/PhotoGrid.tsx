import type { Photo } from "../../types";
import { SkeletonGrid } from "../Common/SkeletonCard";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function PhotoGrid({
  photos,
  isLoading = false,
  isError = false,
  error = null,
  emptyTitle = "No photos found",
  emptyMessage = "No photos match this view."
}: PhotoGridProps) {
  if (isLoading) {
    return <SkeletonGrid />;
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-900">Error loading photos</h2>
        <p className="mt-2 text-sm text-red-700">{error?.message ?? "Please try again later."}</p>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-slate-500">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
