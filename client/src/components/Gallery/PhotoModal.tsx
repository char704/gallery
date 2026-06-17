import { X } from "lucide-react";
import type { Photo } from "../../types";

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
}

export function PhotoModal({ photo, onClose }: PhotoModalProps) {
  if (!photo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-ink">{photo.title}</h2>
          <button
            className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            type="button"
            onClick={onClose}
            aria-label="Close photo"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-slate-950">
          <img className="h-full w-full object-contain" src={photo.imageUrl} alt={photo.title} />
        </div>
        <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          {photo.description}
        </div>
      </div>
    </div>
  );
}
