import { Eye, Image, Lock, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import type { Photo } from "../../types";
import { formatDate, formatFileSize } from "../../utils/formatters";

interface PhotoCardProps {
  photo: Photo;
  onSelect?: (photo: Photo) => void;
}

export function PhotoCard({ photo, onSelect }: PhotoCardProps) {
  const VisibilityIcon = photo.visibility === "PUBLIC" ? Eye : Lock;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        className="group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left"
        type="button"
        onClick={() => onSelect?.(photo)}
      >
        <img
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={photo.thumbnailUrl}
          alt={photo.title}
          loading="lazy"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">
          <VisibilityIcon size={13} />
          {photo.visibility.toLowerCase()}
        </span>
      </button>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link className="focus-ring block rounded-lg font-semibold text-ink" to={`/photos/${photo.id}`}>
              {photo.title}
            </Link>
            <p className="mt-1 truncate text-sm text-slate-500">{photo.description}</p>
          </div>
          <button
            className="focus-ring shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            type="button"
            aria-label={`Open actions for ${photo.title}`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Image size={14} />
            <span>{formatFileSize(photo.fileSize)}</span>
          </div>
          <div className="text-right">{formatDate(photo.createdAt)}</div>
        </dl>
      </div>
    </article>
  );
}
