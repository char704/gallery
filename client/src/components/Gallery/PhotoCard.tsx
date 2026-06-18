import { Eye, Heart, Image, Lock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Photo } from "../../types";
import { formatDate, formatFileSize } from "../../utils/formatters";

interface PhotoCardProps {
  photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const VisibilityIcon = photo.visibility === "PUBLIC" ? Eye : Lock;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Link
        className="focus-ring group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100"
        to={`/photos/${photo.id}`}
        aria-label={`Open ${photo.title}`}
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
        <span className="absolute inset-0 bg-ink/0 transition duration-300 group-hover:bg-ink/10" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="min-w-0">
          <Link className="focus-ring block rounded-lg font-semibold text-ink hover:text-pine" to={`/photos/${photo.id}`}>
            {photo.title}
          </Link>
          <p className="mt-1 truncate text-sm text-slate-500">{photo.description}</p>
        </div>
        {photo.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {photo.tags.slice(0, 2).map((photoTag) => (
              <Link
                className="focus-ring rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                key={photoTag.tag.id}
                to={`/explore?tag=${encodeURIComponent(photoTag.tag.slug)}`}
              >
                #{photoTag.tag.name}
              </Link>
            ))}
            {photo.tags.length > 2 ? <span className="px-2 py-1 text-xs text-slate-500">+{photo.tags.length - 2}</span> : null}
          </div>
        ) : null}
        <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Image size={14} />
            <span>{formatFileSize(photo.fileSize)}</span>
          </div>
          <div className="text-right">{formatDate(photo.createdAt)}</div>
          <div className="flex items-center gap-1">
            <Heart size={14} />
            <span>{photo._count?.likes ?? 0}</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <MessageCircle size={14} />
            <span>{photo._count?.comments ?? 0}</span>
          </div>
        </dl>
      </div>
    </article>
  );
}
