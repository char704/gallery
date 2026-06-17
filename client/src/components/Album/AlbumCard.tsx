import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { Album } from "../../types";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Link className="focus-ring block aspect-[4/3] bg-slate-100" to={`/albums/${album.id}`}>
        {album.coverPhoto ? (
          <img
            className="h-full w-full object-cover"
            src={album.coverPhoto.thumbnailUrl}
            alt={album.coverPhoto.title}
            loading="lazy"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-slate-400">
            <FolderOpen size={32} />
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link className="focus-ring rounded-lg font-semibold text-ink" to={`/albums/${album.id}`}>
          {album.name}
        </Link>
        <p className="mt-1 text-sm text-slate-500">{album.description}</p>
        <p className="mt-3 text-xs font-medium uppercase text-slate-500">
          {album.photoCount ?? 0} photos / {album.visibility.toLowerCase()}
        </p>
      </div>
    </article>
  );
}
