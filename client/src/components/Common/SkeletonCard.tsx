import type { CSSProperties } from "react";

interface SkeletonCardProps {
  layout?: "grid" | "masonry";
  index?: number;
}

export function SkeletonCard({ layout = "grid", index = 0 }: SkeletonCardProps) {
  const masonryHeights = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[5/4]"];
  const imageShape = layout === "masonry" ? masonryHeights[index % masonryHeights.length] : "aspect-[4/3]";

  return (
    <div className="overflow-hidden rounded-xl bg-surface/80 shadow-soft">
      <div className={`${imageShape} animate-pulse bg-vellum`} />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-vellum" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-vellum" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-lg bg-vellum" />
          <div className="h-6 w-16 animate-pulse rounded-lg bg-vellum" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-3 animate-pulse rounded bg-vellum" />
          <div className="h-3 animate-pulse rounded bg-vellum" />
          <div className="h-3 animate-pulse rounded bg-vellum" />
          <div className="h-3 animate-pulse rounded bg-vellum" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12, layout = "grid" }: { count?: number; layout?: "grid" | "masonry" }) {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div className="stagger-skeleton" key={index} style={{ "--stagger-index": index } as CSSProperties}>
      <SkeletonCard index={index} layout={layout} />
    </div>
  ));

  if (layout === "masonry") {
    return (
      <div className="masonry-grid">
        {skeletons.map((skeleton, index) => (
          <div className="masonry-item" key={index}>
            {skeleton}
          </div>
        ))}
      </div>
    );
  }

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{skeletons}</div>;
}
