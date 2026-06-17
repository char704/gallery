import type { UploadItem } from "../../hooks/useUpload";

interface UploadProgressProps {
  items: UploadItem[];
}

export function UploadProgress({ items }: UploadProgressProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 space-y-3">
      {items.map((item) => (
        <div key={`${item.file.name}-${item.file.lastModified}`} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate font-medium text-ink">{item.file.name}</span>
            <span className="text-slate-500">{item.status}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-pine" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      ))}
    </section>
  );
}
