import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Link2, Lock, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Album, Visibility } from "../../types";
import { albumSchema } from "../../utils/validators";

type AlbumFormValues = z.infer<typeof albumSchema>;

interface AlbumFormProps {
  album?: Album;
  isSubmitting?: boolean;
  onSubmit?: (values: AlbumFormValues) => void;
}

const visibilityOptions: Array<{ value: Visibility; label: string; description: string; Icon: typeof Lock }> = [
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can see this album.",
    Icon: Lock
  },
  {
    value: "UNLISTED",
    label: "Unlisted",
    description: "People with the link can view it.",
    Icon: Link2
  },
  {
    value: "PUBLIC",
    label: "Public",
    description: "Visible to others when shared or discovered.",
    Icon: Eye
  }
];

export function AlbumForm({ album, isSubmitting = false, onSubmit }: AlbumFormProps) {
  const { register, handleSubmit, watch, formState } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      name: album?.name ?? "",
      description: album?.description ?? "",
      visibility: album?.visibility ?? "PRIVATE"
    }
  });
  const selectedVisibility = watch("visibility") ?? "PRIVATE";

  return (
    <form
      className="space-y-4 rounded-xl border border-vellum bg-surface p-4 shadow-soft sm:p-5"
      onSubmit={handleSubmit((values) => onSubmit?.(values))}
    >
      <label className="block text-sm font-semibold text-ink-soft">
        Name
        <input className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink" {...register("name")} />
        {formState.errors.name ? <span className="mt-1 block text-sm text-red-700">{formState.errors.name.message}</span> : null}
      </label>
      <label className="block text-sm font-semibold text-ink-soft">
        Description
        <textarea
          className="focus-ring mt-1 min-h-24 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink"
          {...register("description")}
        />
        {formState.errors.description ? (
          <span className="mt-1 block text-sm text-red-700">{formState.errors.description.message}</span>
        ) : null}
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink-soft">Visibility</legend>
        <div className="grid gap-2">
          {visibilityOptions.map(({ value, label, description, Icon }) => (
            <label
              className={[
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                selectedVisibility === value ? "border-pine bg-pine-light text-pine-dark" : "border-vellum bg-surface text-ink-soft hover:border-lagoon"
              ].join(" ")}
              key={value}
            >
              <input className="focus-ring mt-1" type="radio" value={value} {...register("visibility")} />
              <Icon className="mt-0.5 shrink-0" size={17} />
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs leading-5">{description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        <Save size={18} />
        {isSubmitting ? "Saving..." : "Save album"}
      </button>
    </form>
  );
}
