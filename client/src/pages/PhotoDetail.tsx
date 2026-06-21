import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/Common/ConfirmDialog";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoComments } from "../components/Photo/PhotoComments";
import { PhotoLikeButton } from "../components/Photo/PhotoLikeButton";
import { usePhotoOwnerActions } from "../hooks/usePhotoOwnerActions";
import { usePhoto } from "../hooks/usePhotos";
import { cloudinary } from "../utils/cloudinary";
import type { Visibility } from "../types";

export default function PhotoDetail() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const { data: photo, isLoading, isError, error } = usePhoto(photoId ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [tagText, setTagText] = useState("");
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { isOwner, updateMutation, updateTagsMutation, deleteMutation } = usePhotoOwnerActions(photo, {
    onDeleted: () => {
      setDeleteConfirmOpen(false);
      navigate("/gallery", { replace: true });
    }
  });

  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setDescription(photo.description ?? "");
      setVisibility(photo.visibility);
      setTagText(photo.tags?.map((photoTag) => photoTag.tag.name).join(", ") ?? "");
    }
  }, [photo]);

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

  const displayUrl =
    cloudinary.url(photo.publicId, {
      secure: true,
      transformation: [
        {
          width: 1400,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto"
        }
      ]
    }) || photo.imageUrl;

  return (
    <section className="space-y-5">
      <Link className="focus-ring rounded-lg text-sm font-semibold text-pine" to="/gallery">
        Back to gallery
      </Link>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img className="max-h-[70vh] w-full object-cover" src={displayUrl} alt={photo.title} />
        <div className="p-5">
          {isEditing ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateMutation.mutate(
                  {
                    title,
                    description,
                    visibility
                  },
                  {
                    onSuccess: () => setIsEditing(false)
                  }
                );
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
                    {photo.visibility.toLowerCase()} / {photo._count?.comments ?? 0} comments
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PhotoLikeButton photoId={photo.id} />
                  {isOwner ? (
                    <>
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
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                    </>
                  ) : null}
                </div>
              </div>
              {deleteMutation.error ? (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteMutation.error.message}</p>
              ) : null}
              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase text-slate-500">Tags</h2>
                  {isOwner ? (
                    <button
                      className="focus-ring rounded-lg px-2 py-1 text-sm font-semibold text-pine"
                      type="button"
                      onClick={() => {
                        setTagText(photo.tags?.map((photoTag) => photoTag.tag.name).join(", ") ?? "");
                        setIsEditingTags((current) => !current);
                      }}
                    >
                      {isEditingTags ? "Cancel" : "Edit tags"}
                    </button>
                  ) : null}
                </div>
                {isEditingTags ? (
                  <div className="mt-3 space-y-3">
                    <input
                      className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2"
                      value={tagText}
                      onChange={(event) => setTagText(event.target.value)}
                      placeholder="nature, travel, sunset"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="focus-ring rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        type="button"
                        onClick={() =>
                          updateTagsMutation.mutate(
                            tagText
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                            {
                              onSuccess: () => setIsEditingTags(false)
                            }
                          )
                        }
                        disabled={updateTagsMutation.isPending}
                      >
                        {updateTagsMutation.isPending ? "Saving..." : "Save tags"}
                      </button>
                    </div>
                    {updateTagsMutation.error ? (
                      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{updateTagsMutation.error.message}</p>
                    ) : null}
                  </div>
                ) : photo.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {photo.tags.map((photoTag) => (
                      <Link
                        className="focus-ring rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                        key={photoTag.tag.id}
                        to={`/explore?tag=${encodeURIComponent(photoTag.tag.slug)}`}
                      >
                        #{photoTag.tag.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No tags yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
      <PhotoComments photoId={photo.id} />
    </section>
  );
}
