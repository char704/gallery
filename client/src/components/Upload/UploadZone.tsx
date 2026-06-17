import { UploadCloud } from "lucide-react";

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
}

export function UploadZone({ onFilesSelected }: UploadZoneProps) {
  return (
    <label className="focus-within:ring-pine flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm ring-2 ring-transparent ring-offset-2 hover:border-pine">
      <UploadCloud className="text-pine" size={32} />
      <span className="mt-3 text-base font-semibold text-ink">Choose images</span>
      <span className="mt-1 text-sm text-slate-500">JPG, PNG, or WebP up to 5 MB</span>
      <input
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(event.target.files);
          }
        }}
      />
    </label>
  );
}
