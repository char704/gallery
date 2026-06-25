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
      <div className={`${imageShape} bg-vellum motion-safe:animate-pulse`} />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-vellum motion-safe:animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-vellum motion-safe:animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-lg bg-vellum motion-safe:animate-pulse" />
          <div className="h-6 w-16 rounded-lg bg-vellum motion-safe:animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-3 rounded bg-vellum motion-safe:animate-pulse" />
          <div className="h-3 rounded bg-vellum motion-safe:animate-pulse" />
          <div className="h-3 rounded bg-vellum motion-safe:animate-pulse" />
          <div className="h-3 rounded bg-vellum motion-safe:animate-pulse" />
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
      <div className="masonry-grid" aria-hidden="true">
        {skeletons.map((skeleton, index) => (
          <div className="masonry-item" key={index}>
            {skeleton}
          </div>
        ))}
      </div>
    );
  }

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">{skeletons}</div>;
}
