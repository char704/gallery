import { Eye, Heart, Link2, Lock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Photo, Tag } from "../../types";
import { cloudinary } from "../../utils/cloudinary";

interface PhotoCardProps {
  photo: Photo;
  layout?: "grid" | "masonry";
  presentation?: "default" | "explore";
}

export function PhotoCard({ photo, layout = "grid", presentation = "default" }: PhotoCardProps) {
  const VisibilityIcon = photo.visibility === "PUBLIC" ? Eye : photo.visibility === "UNLISTED" ? Link2 : Lock;
  const isMasonry = layout === "masonry";
  const isExplorePresentation = presentation === "explore";
  const visibilityLabel = photo.visibility.toLowerCase();
  const photoPath = `/photos/${photo.id}`;
  const displayUrl =
    cloudinary.url(photo.publicId, {
      secure: true,
      transformation: [
        {
          width: 400,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto"
        }
      ]
    }) || photo.imageUrl;
  const tags =
    photo.tags?.map((photoTag) => ("tag" in photoTag ? photoTag.tag : (photoTag as unknown as Tag))) ?? [];

  return (
    <article className="group relative overflow-hidden rounded-xl bg-ink shadow-soft transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 hover:shadow-gallery">
      <Link
        className={`focus-ring block w-full overflow-hidden ${isMasonry ? "" : "aspect-[4/3]"}`}
        to={photoPath}
        aria-label={`Open ${photo.title}`}
      >
        <img
          className={`${isMasonry ? "h-auto" : "h-full"} w-full object-cover transition duration-500 motion-safe:group-hover:scale-105`}
          src={isMasonry ? displayUrl : photo.thumbnailUrl}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          loading="lazy"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/82 via-ink/10 to-transparent opacity-75 transition duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100" />
      </Link>
      <span
        className={[
          "pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold capitalize text-white shadow-sm backdrop-blur-md",
          isExplorePresentation ? "border border-white/35 bg-ink/70" : "border border-white/30 bg-white/25"
        ].join(" ")}
      >
        <VisibilityIcon size={13} />
        {visibilityLabel}
      </span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2 p-3 opacity-100 transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        <div
          className={[
            "p-3 text-white",
            isExplorePresentation ? "rounded-lg bg-ink/54 backdrop-blur-sm" : "rounded-xl border border-white/30 bg-white/20 shadow-soft backdrop-blur-xl"
          ].join(" ")}
        >
          {isExplorePresentation ? (
            <div className="font-display text-xl font-bold leading-snug">{photo.title}</div>
          ) : (
            <Link
              className="focus-ring pointer-events-auto block rounded-lg font-display text-xl font-bold leading-snug hover:text-marigold-light"
              to={photoPath}
            >
              {photo.title}
            </Link>
          )}
          {photo.description ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/80">{photo.description}</p> : null}
          {photo.user ? (
            <Link className="focus-ring pointer-events-auto mt-2 inline-flex rounded text-sm font-semibold text-white/85 hover:text-white" to={`/users/${photo.user.id}/photos`}>
              by {photo.user.name}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold backdrop-blur-md",
              isExplorePresentation ? "bg-ink/48 text-white/90" : "border border-white/30 bg-white/20 text-white"
            ].join(" ")}
            aria-label={`${photo._count?.likes ?? 0} likes`}
          >
            <Heart size={13} />
            {photo._count?.likes ?? 0}
          </span>
          <span
            className={[
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold backdrop-blur-md",
              isExplorePresentation ? "bg-ink/48 text-white/90" : "border border-white/30 bg-white/20 text-white"
            ].join(" ")}
            aria-label={`${photo._count?.comments ?? 0} comments`}
          >
            <MessageCircle size={13} />
            {photo._count?.comments ?? 0}
          </span>
          {tags.slice(0, 2).map((tag) => (
            <Link
              className={[
                "focus-ring pointer-events-auto rounded-lg px-2 py-1 text-xs font-semibold backdrop-blur-md transition",
                isExplorePresentation ? "bg-ink/48 text-white/90 hover:bg-ink/70" : "border border-white/30 bg-white/20 text-white hover:bg-white/30"
              ].join(" ")}
              key={tag.id}
              to={`/explore?tag=${encodeURIComponent(tag.slug)}`}
            >
              #{tag.name}
            </Link>
          ))}
          {tags.length > 2 ? (
            <span
              className={[
                "rounded-lg px-2 py-1 text-xs font-semibold text-white/75 backdrop-blur-md",
                isExplorePresentation ? "bg-ink/40" : "border border-white/20 bg-white/10"
              ].join(" ")}
            >
              +{tags.length - 2}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
