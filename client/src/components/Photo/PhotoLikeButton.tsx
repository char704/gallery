import { Heart } from "lucide-react";
import { usePhotoLike } from "../../hooks/usePhotoLike";

interface PhotoLikeButtonProps {
  photoId: string;
}

export function PhotoLikeButton({ photoId }: PhotoLikeButtonProps) {
  const { isLoggedIn, count, isLiked, toggleLike, isPending } = usePhotoLike(photoId);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
        <Heart size={16} />
        <span>{count} likes</span>
        <span className="text-slate-400">/</span>
        <span>Log in to like this photo.</span>
      </div>
    );
  }

  return (
    <button
      className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
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
