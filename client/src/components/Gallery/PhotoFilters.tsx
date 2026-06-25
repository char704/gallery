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
      className="flex flex-col gap-4 border-y border-vellum/80 bg-surface/70 py-4 sm:flex-row sm:items-end sm:justify-between"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft sm:min-w-24 sm:pb-2">
        <SlidersHorizontal className="text-lagoon-dark" size={18} />
        Refine
      </div>
      <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <label className="min-w-0 text-sm font-semibold text-ink-soft" htmlFor="photo-filter-tag">
          Tag search
          <input
            id="photo-filter-tag"
            className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink placeholder:text-ink-muted"
            value={tag}
            onChange={(event) => onTagChange(event.target.value)}
            placeholder="nature, travel, sunset"
          />
        </label>
        <label className="text-sm font-semibold text-ink-soft" htmlFor="photo-filter-sort">
          Sort
          <select
            id="photo-filter-sort"
            className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink"
            value={sort}
            onChange={(event) => {
              onSortChange(event.target.value as NonNullable<PhotoQueryParams["sort"]>);
            }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Popular</option>
          </select>
        </label>
      </div>
    </form>
  );
}
