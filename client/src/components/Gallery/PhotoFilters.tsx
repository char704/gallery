import { SlidersHorizontal } from "lucide-react";
import type { PhotoQueryParams } from "../../types";

interface PhotoFiltersProps {
  tag: string;
  sort: NonNullable<PhotoQueryParams["sort"]>;
  onTagChange: (tag: string) => void;
  onSortChange: (sort: NonNullable<PhotoQueryParams["sort"]>) => void;
}

export function PhotoFilters({
  tag,
  sort,
  onTagChange,
  onSortChange
}: PhotoFiltersProps) {
  return (
    <form
      aria-label="Photo filters"
      className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal size={18} />
        Filters
      </div>
      <label className="sr-only" htmlFor="photo-filter-tag">
        Filter by tag
      </label>
      <input
        id="photo-filter-tag"
        className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
        value={tag}
        onChange={(event) => onTagChange(event.target.value)}
        placeholder="Filter by tag"
      />
      <label className="sr-only" htmlFor="photo-filter-sort">
        Sort photos
      </label>
      <select
        id="photo-filter-sort"
        className="focus-ring rounded-lg border border-slate-300 px-3 py-2"
        value={sort}
        onChange={(event) => {
          onSortChange(event.target.value as NonNullable<PhotoQueryParams["sort"]>);
        }}
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Popular</option>
      </select>
    </form>
  );
}
