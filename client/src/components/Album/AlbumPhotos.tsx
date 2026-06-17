import type { Photo } from "../../types";
import { PhotoGrid } from "../Gallery/PhotoGrid";

interface AlbumPhotosProps {
  photos: Photo[];
}

export function AlbumPhotos({ photos }: AlbumPhotosProps) {
  return <PhotoGrid photos={photos} />;
}
