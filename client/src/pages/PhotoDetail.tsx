import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { photoService } from "../services/photo.service";
import { useAuthStore } from "../store/authStore";
import { usePhoto } from "../hooks/usePhotos";
import type { Visibility } from "../types";

export default function PhotoDetail() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { data: photo, isLoading, isError, error } = usePhoto(photoId ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const isOwner = Boolean(user && photo && user.id === photo.userId);

  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setDescription(photo.description ?? "");
      setVisibility(photo.visibility);
    }
  }, [photo]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!photo || !token) {
        throw new Error("You must be logged in to update this photo.");
      }

      return photoService.updatePhoto(
        photo.id,
        {
          title,
          description,
          visibility
        },
        token
      );
    },
    onSuccess: async () => {
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!photo || !token) {
        throw new Error("You must be logged in to delete this photo.");
      }

      return photoService.deletePhoto(photo.id, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
      navigate("/gallery", { replace: true });
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !photo) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {error instanceof Error ? error.message : "Photo not found."}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <Link className="focus-ring rounded-lg text-sm font-semibold text-pine" to="/gallery">
        Back to gallery
      </Link>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img className="max-h-[70vh] w-full object-cover" src={photo.imageUrl} alt={photo.title} />
        <div className="p-5">
          {isEditing ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateMutation.mutate();
              }}
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Visibility</span>
                <select
                  className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as Visibility)}
                >
                  <option value="PRIVATE">Private</option>
                  <option value="UNLISTED">Unlisted</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  className="focus-ring rounded-lg bg-pine px-4 py-2 font-semibold text-white disabled:opacity-60"
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </button>
                <button
                  className="focus-ring rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
              {updateMutation.error ? (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{updateMutation.error.message}</p>
              ) : null}
            </form>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-ink">{photo.title}</h1>
                  <p className="mt-2 text-slate-600">{photo.description}</p>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {photo.visibility.toLowerCase()} / {photo._count?.likes ?? 0} likes / {photo._count?.comments ?? 0} comments
                  </p>
                </div>
                {isOwner ? (
                  <div className="flex gap-2">
                    <button
                      className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="focus-ring rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                      type="button"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ) : null}
              </div>
              {deleteMutation.error ? (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteMutation.error.message}</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
