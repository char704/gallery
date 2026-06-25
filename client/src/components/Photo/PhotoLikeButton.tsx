import { Heart } from "lucide-react";
import { usePhotoLike } from "../../hooks/usePhotoLike";

interface PhotoLikeButtonProps {
  photoId: string;
}

export function PhotoLikeButton({ photoId }: PhotoLikeButtonProps) {
  const { isLoggedIn, count, isLiked, toggleLike, isPending } = usePhotoLike(photoId);

  if (!isLoggedIn) {
    return (
      <div className="inline-flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-vellum bg-mist px-3 py-2 text-sm text-ink-soft">
        <Heart size={16} />
        <span className="font-semibold text-ink">{count} {count === 1 ? "like" : "likes"}</span>
        <span>Log in to like this photo.</span>
      </div>
    );
  }

  return (
    <button
      className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      onClick={() => toggleLike()}
      disabled={isPending}
      aria-pressed={isLiked}
    >
      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
      {isLiked ? "Unlike" : "Like"} / {count}
    </button>
  );
}
