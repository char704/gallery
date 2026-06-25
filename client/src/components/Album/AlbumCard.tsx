import { Eye, FolderOpen, Link2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Album, Visibility } from "../../types";

interface AlbumCardProps {
  album: Album;
}

const visibilityDetails: Record<Visibility, { label: string; Icon: typeof Lock }> = {
  PUBLIC: {
    label: "Public",
    Icon: Eye
  },
  UNLISTED: {
    label: "Unlisted",
    Icon: Link2
  },
  PRIVATE: {
    label: "Private",
    Icon: Lock
  }
};

export function AlbumCard({ album }: AlbumCardProps) {
  const VisibilityIcon = visibilityDetails[album.visibility].Icon;

  return (
    <article className="group overflow-hidden rounded-xl border border-vellum/90 bg-surface/80 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 hover:bg-surface hover:shadow-soft">
      <Link className="focus-ring block aspect-[4/3] overflow-hidden bg-mist" to={`/albums/${album.id}`} aria-label={`Open ${album.name}`}>
        {album.coverPhoto ? (
          <img
            className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-[1.03]"
            src={album.coverPhoto.thumbnailUrl}
            alt={album.coverPhoto.title}
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-lagoon-dark">
            <FolderOpen size={32} />
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link className="focus-ring rounded-lg font-semibold text-ink" to={`/albums/${album.id}`}>
          {album.name}
        </Link>
        {album.description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-muted">{album.description}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-mist px-2 py-1 text-xs font-semibold text-ink-soft">
            {album.photoCount ?? 0} {(album.photoCount ?? 0) === 1 ? "photo" : "photos"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-pine-light px-2 py-1 text-xs font-semibold text-pine-dark">
            <VisibilityIcon size={13} />
            {visibilityDetails[album.visibility].label}
          </span>
        </div>
      </div>
    </article>
  );
}
