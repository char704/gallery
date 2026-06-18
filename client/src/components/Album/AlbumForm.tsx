import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Album } from "../../types";
import { albumSchema } from "../../utils/validators";

type AlbumFormValues = z.infer<typeof albumSchema>;

interface AlbumFormProps {
  album?: Album;
  isSubmitting?: boolean;
  onSubmit?: (values: AlbumFormValues) => void;
}

export function AlbumForm({ album, isSubmitting = false, onSubmit }: AlbumFormProps) {
  const { register, handleSubmit, formState } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      name: album?.name ?? "",
      description: album?.description ?? "",
      visibility: album?.visibility ?? "PRIVATE"
    }
  });

  return (
    <form
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
      onSubmit={handleSubmit((values) => onSubmit?.(values))}
    >
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...register("name")} />
        {formState.errors.name ? <span className="mt-1 block text-sm text-red-600">{formState.errors.name.message}</span> : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
          {...register("description")}
        />
        {formState.errors.description ? (
          <span className="mt-1 block text-sm text-red-600">{formState.errors.description.message}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Visibility</span>
        <select className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...register("visibility")}>
          <option value="PRIVATE">Private</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PUBLIC">Public</option>
        </select>
      </label>
      <button
        className="focus-ring inline-flex items-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        <Save size={18} />
        {isSubmitting ? "Saving..." : "Save album"}
      </button>
    </form>
  );
}
