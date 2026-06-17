import { useState } from "react";
import { PhotoFilters } from "../components/Gallery/PhotoFilters";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { PhotoModal } from "../components/Gallery/PhotoModal";
import type { Photo, Visibility } from "../types";
import { samplePhotos } from "../utils/sampleData";

interface GalleryProps {
  title?: string;
}

export default function Gallery({ title = "Gallery" }: GalleryProps) {
  const [tag, setTag] = useState("");
  const [visibility, setVisibility] = useState<Visibility | undefined>();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const filteredPhotos = samplePhotos.filter((photo) => {
    const matchesTag = tag ? photo.tags?.some((photoTag) => photoTag.slug.includes(tag.toLowerCase())) : true;
    const matchesVisibility = visibility ? photo.visibility === visibility : true;
    return matchesTag && matchesVisibility;
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <div className="mt-5">
        <PhotoFilters
          tag={tag}
          visibility={visibility}
          onTagChange={setTag}
          onVisibilityChange={setVisibility}
        />
        <PhotoGrid photos={filteredPhotos} onSelect={setSelectedPhoto} />
      </div>
      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </section>
  );
}
