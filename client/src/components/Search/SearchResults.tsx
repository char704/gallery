import type { Photo } from "../../types";
import { PhotoGrid } from "../Gallery/PhotoGrid";

interface SearchResultsProps {
  photos: Photo[];
  emptyTitle?: string;
  emptyMessage?: string;
}

export function SearchResults({ photos, emptyTitle, emptyMessage }: SearchResultsProps) {
  return (
    <PhotoGrid
      photos={photos}
      layout="masonry"
      photoCardPresentation="explore"
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
    />
  );
}
