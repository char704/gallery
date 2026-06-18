export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-lg bg-slate-200" />
          <div className="h-6 w-16 rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-3 rounded bg-slate-200" />
          <div className="h-3 rounded bg-slate-200" />
          <div className="h-3 rounded bg-slate-200" />
          <div className="h-3 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
