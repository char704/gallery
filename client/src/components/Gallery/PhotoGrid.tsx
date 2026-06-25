import type { CSSProperties } from "react";
import type { Photo } from "../../types";
import { SkeletonGrid } from "../Common/SkeletonCard";
import { PhotoCard } from "./PhotoCard";

export interface PhotoGridProps {
  photos: Photo[];
  layout?: "grid" | "masonry";
  photoCardPresentation?: "default" | "explore";
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function PhotoGrid({
  photos,
  layout = "grid",
  photoCardPresentation = "default",
  isLoading = false,
  isError = false,
  error = null,
  emptyTitle = "No photos found",
  emptyMessage = "No photos match this view."
}: PhotoGridProps) {
  if (isLoading) {
    return (
      <section role="status" aria-label="Loading photos">
        <span className="sr-only">Loading photos</span>
        <SkeletonGrid layout={layout} />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-900">Error loading photos</h2>
        <p className="mt-2 text-sm text-red-700">{error?.message ?? "Please try again later."}</p>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-vellum bg-surface/75 p-8 text-center">
        <h2 className="text-2xl font-bold text-ink">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-ink-muted">{emptyMessage}</p>
      </section>
    );
  }

  if (layout === "masonry") {
    return (
      <div className="masonry-grid">
        {photos.map((photo, index) => (
          <div
            className="masonry-item stagger-item"
            key={photo.id}
            style={{ "--stagger-index": index } as CSSProperties}
          >
            <PhotoCard photo={photo} layout="masonry" presentation={photoCardPresentation} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {photos.map((photo, index) => (
        <div className="stagger-item" key={photo.id} style={{ "--stagger-index": index } as CSSProperties}>
          <PhotoCard photo={photo} presentation={photoCardPresentation} />
        </div>
      ))}
    </div>
  );
}
