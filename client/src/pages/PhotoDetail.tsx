import { Calendar, Eye, Link2, Lock, MessageCircle, Tag, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/Common/ConfirmDialog";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoComments } from "../components/Photo/PhotoComments";
import { PhotoLikeButton } from "../components/Photo/PhotoLikeButton";
import { usePhotoOwnerActions } from "../hooks/usePhotoOwnerActions";
import { usePhoto } from "../hooks/usePhotos";
import { cloudinary } from "../utils/cloudinary";
import type { Visibility } from "../types";

const visibilityDetails: Record<Visibility, { label: string; Icon: typeof Lock; description: string }> = {
  PUBLIC: {
    label: "Public",
    Icon: Eye,
    description: "Visible in Explore and public galleries"
  },
  UNLISTED: {
    label: "Unlisted",
    Icon: Link2,
    description: "Visible to people with the link"
  },
  PRIVATE: {
    label: "Private",
    Icon: Lock,
    description: "Only visible to the owner"
  }
};

function formatPhotoDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(value));
}

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

  const displayUrl = useMemo(() => {
    if (!photo) {
      return "";
    }

    return (
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
      }) || photo.imageUrl
    );
  }, [photo]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-vellum bg-surface/75 p-8" role="status" aria-label="Loading photo">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError || !photo) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="text-xl font-semibold text-red-950">Photo unavailable</h1>
        <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Photo not found."}</p>
        <Link className="focus-ring mt-4 inline-flex rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-red-800" to="/explore">
          Back to Explore
        </Link>
      </section>
    );
  }

  const VisibilityIcon = visibilityDetails[photo.visibility].Icon;
  const createdDate = formatPhotoDate(photo.createdAt);

  return (
    <section className="space-y-5" aria-labelledby="photo-detail-heading">
      <Link className="focus-ring inline-flex rounded-lg text-sm font-semibold text-pine-dark hover:text-pine" to="/gallery">
        Back to gallery
      </Link>

      <article className="overflow-hidden rounded-xl border border-vellum bg-surface shadow-soft">
        <div className="bg-ink">
          <img className="mx-auto max-h-[72vh] w-full object-contain" src={displayUrl} alt={photo.title} width={photo.width} height={photo.height} />
        </div>

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0">
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
                <label className="block text-sm font-semibold text-ink-soft">
                  Title
                  <input
                    className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-ink-soft">
                  Description
                  <textarea
                    className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>
                <label className="block text-sm font-semibold text-ink-soft">
                  Visibility
                  <select
                    className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink"
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
                    className="focus-ring rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    className="focus-ring rounded-lg border border-vellum bg-surface px-4 py-2 font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark"
                    type="button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
                {updateMutation.error ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{updateMutation.error.message}</p>
                ) : null}
              </form>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h1 id="photo-detail-heading" className="text-3xl font-bold leading-tight text-ink">
                      {photo.title}
                    </h1>
                    {photo.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">{photo.description}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <PhotoLikeButton photoId={photo.id} />
                    {isOwner ? (
                      <>
                        <button
                          className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark"
                          type="button"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </button>
                        <button
                          className="focus-ring rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{deleteMutation.error.message}</p>
                ) : null}
              </>
            )}

            <section className="mt-5 border-t border-vellum pt-5" aria-labelledby="photo-tags-heading">
              <div className="flex items-center justify-between gap-3">
                <h2 id="photo-tags-heading" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft">
                  <Tag size={16} className="text-lagoon-dark" />
                  Tags
                </h2>
                {isOwner ? (
                  <button
                    className="focus-ring rounded-lg px-2 py-1 text-sm font-semibold text-pine-dark transition hover:bg-pine-light"
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
                  <label className="block text-sm font-semibold text-ink-soft">
                    Tag names
                    <input
                      className="focus-ring mt-1 w-full rounded-lg border border-vellum bg-surface px-3 py-2 text-ink placeholder:text-ink-muted"
                      value={tagText}
                      onChange={(event) => setTagText(event.target.value)}
                      placeholder="nature, travel, sunset"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="focus-ring rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-60"
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
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{updateTagsMutation.error.message}</p>
                  ) : null}
                </div>
              ) : photo.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photo.tags.map((photoTag) => (
                    <Link
                      className="focus-ring rounded-lg bg-pine-light px-3 py-1 text-sm font-semibold text-pine-dark transition hover:bg-lagoon-light hover:text-lagoon-dark"
                      key={photoTag.tag.id}
                      to={`/explore?tag=${encodeURIComponent(photoTag.tag.slug)}`}
                    >
                      #{photoTag.tag.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">No tags yet.</p>
              )}
            </section>
          </div>

          <aside className="space-y-3 rounded-lg border border-vellum bg-mist p-4" aria-label="Photo details">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pine-light text-pine-dark">
                <VisibilityIcon size={17} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{visibilityDetails[photo.visibility].label}</p>
                <p className="text-xs leading-5 text-ink-muted">{visibilityDetails[photo.visibility].description}</p>
              </div>
            </div>
            {photo.user ? (
              <Link className="focus-ring flex items-center gap-3 rounded-lg text-sm font-semibold text-pine-dark hover:text-pine" to={`/users/${photo.user.id}/photos`}>
                <User size={17} />
                <span>By {photo.user.name}</span>
              </Link>
            ) : null}
            <p className="flex items-center gap-3 text-sm text-ink-soft">
              <Calendar size={17} className="text-lagoon-dark" />
              {createdDate}
            </p>
            <p className="flex items-center gap-3 text-sm text-ink-soft">
              <MessageCircle size={17} className="text-lagoon-dark" />
              {photo._count?.comments ?? 0} {(photo._count?.comments ?? 0) === 1 ? "comment" : "comments"}
            </p>
          </aside>
        </div>
      </article>

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
