import type { Photo } from "../../types";
import { PhotoGrid } from "../Gallery/PhotoGrid";

interface SearchResultsProps {
  photos: Photo[];
}

export function SearchResults({ photos }: SearchResultsProps) {
  return <PhotoGrid photos={photos} />;
}
