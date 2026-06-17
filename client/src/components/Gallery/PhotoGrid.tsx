import type { Photo } from "../../types";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  onSelect?: (photo: Photo) => void;
}

export function PhotoGrid({ photos, onSelect }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">No photos yet</h2>
        <p className="mt-2 text-sm text-slate-500">Upload your first image to start the gallery.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} onSelect={onSelect} />
      ))}
    </div>
  );
}
