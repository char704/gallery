import { SlidersHorizontal } from "lucide-react";
import type { Visibility } from "../../types";

interface PhotoFiltersProps {
  tag: string;
  visibility?: Visibility;
  onTagChange: (tag: string) => void;
  onVisibilityChange: (visibility: Visibility | undefined) => void;
}

export function PhotoFilters({
  tag,
  visibility,
  onTagChange,
  onVisibilityChange
}: PhotoFiltersProps) {
  return (
    <form className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal size={18} />
        Filters
      </div>
      <input
        className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
        value={tag}
        onChange={(event) => onTagChange(event.target.value)}
        placeholder="Tag"
      />
      <select
        className="focus-ring rounded-lg border border-slate-300 px-3 py-2"
        value={visibility ?? ""}
        onChange={(event) => {
          const value = event.target.value as Visibility | "";
          onVisibilityChange(value === "" ? undefined : value);
        }}
      >
        <option value="">All visibility</option>
        <option value="PUBLIC">Public</option>
        <option value="PRIVATE">Private</option>
        <option value="UNLISTED">Unlisted</option>
      </select>
    </form>
  );
}
