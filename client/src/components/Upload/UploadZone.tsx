import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, ImagePlus, Link2, Lock, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { photoService } from "../../services/photo.service";
import { useAuthStore } from "../../store/authStore";
import { uploadSchema } from "../../utils/validators";
import type { Visibility } from "../../types";

type UploadFormValues = z.infer<typeof uploadSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_LABEL = "JPG, PNG, WebP, or GIF up to 5 MB";

const visibilityOptions: Array<{ value: Visibility; label: string; description: string; Icon: typeof Lock }> = [
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can see it.",
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
    description: "Visible in Explore and public galleries.",
    Icon: Eye
  }
];

function formatFileSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const fileInputId = useId();
  const uploadErrorId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      visibility: "PRIVATE",
      tags: ""
    }
  });
  const selectedVisibility = watch("visibility") ?? "PRIVATE";

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function handleFileSelect(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG, WebP, and GIF images are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size exceeds the 5MB limit.");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  }

  function removeSelectedFile() {
    setSelectedFile(null);
    setUploadError(null);
  }

  async function onSubmit(values: UploadFormValues) {
    if (!token) {
      setUploadError("You must be logged in to upload photos.");
      return;
    }

    if (!selectedFile) {
      setUploadError("Choose an image before uploading.");
      return;
    }

    setUploadError(null);

    try {
      const photo = await photoService.uploadPhoto(
        {
          file: selectedFile,
          title: values.title,
          description: values.description,
          visibility: values.visibility,
          tags: values.tags
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        },
        token
      );

      await queryClient.invalidateQueries({ queryKey: ["photos"] });
      navigate(`/photos/${photo.id}`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <form className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]" onSubmit={handleSubmit(onSubmit)}>
      <section className="space-y-3" aria-labelledby="upload-file-heading">
        <h2 id="upload-file-heading" className="sr-only">
          Choose image
        </h2>
        <label
          className={[
            "focus-within:ring-pine flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-surface px-5 py-8 text-center shadow-soft ring-2 ring-transparent ring-offset-2 ring-offset-canvas transition",
            isDragging ? "border-pine bg-pine-light" : "border-vellum hover:border-pine"
          ].join(" ")}
          htmlFor={fileInputId}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];

            if (file) {
              handleFileSelect(file);
            }
          }}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => event.preventDefault()}
        >
          {previewUrl ? (
            <img className="max-h-[26rem] w-full rounded-lg object-contain" src={previewUrl} alt="Selected upload preview" />
          ) : (
            <>
              <UploadCloud className="text-pine" size={34} />
              <span className="mt-3 text-base font-semibold text-ink">Choose a photo</span>
              <span className="mt-1 text-sm text-ink-muted">{ACCEPTED_LABEL}</span>
            </>
          )}
          <span className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition">
            <ImagePlus size={16} />
            Browse files
          </span>
          <input
            id={fileInputId}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            aria-describedby={uploadError ? uploadErrorId : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                handleFileSelect(file);
              }
            }}
          />
        </label>

        {selectedFile ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-vellum bg-mist p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{selectedFile.name}</p>
              <p className="text-xs text-ink-muted">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-red-200 hover:bg-red-50 hover:text-red-800"
              type="button"
              onClick={removeSelectedFile}
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">The upload button stays disabled until an image is selected.</p>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-vellum bg-surface p-4 shadow-soft sm:p-5" aria-labelledby="upload-details-heading">
        <div>
          <h2 id="upload-details-heading" className="text-xl font-bold text-ink">
            Photo details
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">These details help you find the photo later.</p>
        </div>

        <label className="block text-sm font-semibold text-ink-soft">
          Title
          <input className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink" {...register("title")} />
          {errors.title ? <span className="mt-1 block text-sm text-red-700">{errors.title.message}</span> : null}
        </label>

        <label className="block text-sm font-semibold text-ink-soft">
          Description
          <textarea
            className="focus-ring mt-1 min-h-24 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink"
            {...register("description")}
          />
          {errors.description ? <span className="mt-1 block text-sm text-red-700">{errors.description.message}</span> : null}
        </label>

        <label className="block text-sm font-semibold text-ink-soft">
          Tags
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink placeholder:text-ink-muted"
            placeholder="nature, travel, sunset"
            {...register("tags")}
          />
          <span className="mt-1 block text-xs text-ink-muted">Separate tags with commas.</span>
          {errors.tags ? <span className="mt-1 block text-sm text-red-700">{errors.tags.message}</span> : null}
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

        {uploadError ? (
          <p id={uploadErrorId} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            {uploadError}
          </p>
        ) : null}

        <button
          className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-pine px-5 py-2 font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          type="submit"
          disabled={!selectedFile || isSubmitting}
        >
          <UploadCloud size={18} />
          {isSubmitting ? "Uploading..." : "Upload photo"}
        </button>
      </section>
    </form>
  );
}
