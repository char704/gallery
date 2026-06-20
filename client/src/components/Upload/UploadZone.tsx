import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { photoService } from "../../services/photo.service";
import { useAuthStore } from "../../store/authStore";
import { uploadSchema } from "../../utils/validators";

type UploadFormValues = z.infer<typeof uploadSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function UploadZone() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      visibility: "PRIVATE",
      tags: ""
    }
  });

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
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <label
        className="focus-within:ring-pine flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm ring-2 ring-transparent ring-offset-2 hover:border-pine"
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];

          if (file) {
            handleFileSelect(file);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
      >
        {previewUrl ? (
          <img className="max-h-72 rounded-lg object-contain" src={previewUrl} alt="Selected upload preview" />
        ) : (
          <>
            <UploadCloud className="text-pine" size={34} />
            <span className="mt-3 text-base font-semibold text-ink">Drag an image here</span>
            <span className="mt-1 text-sm text-slate-500">JPG, PNG, WebP, or GIF up to 5 MB</span>
          </>
        )}
        <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
          <ImagePlus size={16} />
          Browse files
        </span>
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              handleFileSelect(file);
            }
          }}
        />
      </label>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...register("title")} />
          {errors.title ? <span className="text-sm text-red-600">{errors.title.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
            {...register("description")}
          />
          {errors.description ? <span className="text-sm text-red-600">{errors.description.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tags</span>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="nature, travel, sunset"
            {...register("tags")}
          />
          <span className="mt-1 block text-xs text-slate-500">Separate tags with commas.</span>
          {errors.tags ? <span className="text-sm text-red-600">{errors.tags.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visibility</span>
          <select className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" {...register("visibility")}>
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </label>
      </div>

      {uploadError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{uploadError}</p> : null}

      <button
        className="focus-ring inline-flex items-center gap-2 rounded-lg bg-pine px-5 py-2 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={!selectedFile || isSubmitting}
      >
        <UploadCloud size={18} />
        {isSubmitting ? "Uploading..." : "Upload photo"}
      </button>
    </form>
  );
}
