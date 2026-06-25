import { Calendar, Eye, Link2, Lock, MessageCircle, RotateCcw, Tag, User, X, ZoomIn, ZoomOut } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ConfirmDialog } from "../Common/ConfirmDialog";
import { LoadingSpinner } from "../Common/LoadingSpinner";
import { PhotoComments } from "./PhotoComments";
import { PhotoLikeButton } from "./PhotoLikeButton";
import { usePhotoOwnerActions } from "../../hooks/usePhotoOwnerActions";
import { usePhoto } from "../../hooks/usePhotos";
import { cloudinary } from "../../utils/cloudinary";
import type { Visibility } from "../../types";

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

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    if (!mediaQuery) {
      return undefined;
    }

    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function PhotoViewerModal() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
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
      navigate(-1);
    }
  });

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setDescription(photo.description ?? "");
      setVisibility(photo.visibility);
      setTagText(photo.tags?.map((photoTag) => photoTag.tag.name).join(", ") ?? "");
    }
  }, [photo]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const displayUrl = useMemo(() => {
    if (!photo) {
      return "";
    }

    return (
      cloudinary.url(photo.publicId, {
        secure: true,
        transformation: [
          {
            width: 1800,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto"
          }
        ]
      }) || photo.imageUrl
    );
  }, [photo]);

  const createdDate = useMemo(() => {
    if (!photo) {
      return "";
    }

    return formatPhotoDate(photo.createdAt);
  }, [photo]);

  const label = photo ? `Viewing ${photo.title}` : "Photo viewer";
  const VisibilityIcon = photo ? visibilityDetails[photo.visibility].Icon : Lock;

  return (
    <>
      <FocusTrap
        active={!isDeleteConfirmOpen}
        focusTrapOptions={{
          initialFocus: () => closeButtonRef.current ?? false,
          returnFocusOnDeactivate: true,
          escapeDeactivates: false
        }}
      >
        <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-50 flex bg-ink">
          <div className="flex min-h-0 w-full flex-col lg:flex-row">
            <div className="relative flex min-h-0 flex-1 flex-col bg-black">
              <div className="absolute left-3 top-3 z-10 flex gap-2">
                <button
                  ref={closeButtonRef}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-white shadow-soft backdrop-blur transition hover:bg-white/15"
                  type="button"
                  aria-label="Close photo viewer"
                  onClick={() => navigate(-1)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center p-3 pt-16 sm:p-5 sm:pt-16 lg:p-8">
                {isLoading ? (
                  <LoadingSpinner />
                ) : isError || !photo ? (
                  <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
                    <h1 className="text-xl font-semibold text-red-950">Photo unavailable</h1>
                    <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Photo not found."}</p>
                  </section>
                ) : (
                  <TransformWrapper
                    centerOnInit
                    centerZoomedOut
                    minScale={1}
                    maxScale={5}
                    smooth={!prefersReducedMotion}
                    wheel={{ step: 0.18 }}
                    panning={{ disabled: false }}
                    doubleClick={{ disabled: true }}
                    zoomAnimation={{ disabled: prefersReducedMotion }}
                  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/15 bg-black/65 p-1.5 shadow-soft backdrop-blur">
                          <button
                            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
                            type="button"
                            aria-label="Zoom in"
                            onClick={() => zoomIn(0.5, prefersReducedMotion ? 0 : 200)}
                          >
                            <ZoomIn size={19} />
                          </button>
                          <button
                            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
                            type="button"
                            aria-label="Zoom out"
                            onClick={() => zoomOut(0.5, prefersReducedMotion ? 0 : 200)}
                          >
                            <ZoomOut size={19} />
                          </button>
                          <button
                            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
                            type="button"
                            aria-label="Reset zoom"
                            onClick={() => resetTransform(prefersReducedMotion ? 0 : 200)}
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                        <TransformComponent
                          wrapperClass="h-full w-full"
                          contentClass="flex h-full w-full items-center justify-center"
                          wrapperStyle={{ width: "100%", height: "100%" }}
                          contentStyle={{ width: "100%", height: "100%" }}
                        >
                          <img
                            className="h-full max-h-full w-full max-w-full object-contain"
                            src={displayUrl}
                            alt={photo.title}
                            width={photo.width}
                            height={photo.height}
                            loading="eager"
                            decoding="async"
                          />
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                )}
              </div>
            </div>

            {photo ? (
              <aside className="max-h-[45vh] overflow-y-auto border-t border-vellum bg-surface p-4 text-ink sm:p-5 lg:h-screen lg:max-h-screen lg:w-[26rem] lg:border-l lg:border-t-0" aria-label="Photo details">
                <div className="space-y-5">
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
                      <div>
                        <h1 className="text-2xl font-bold leading-tight text-ink">{photo.title}</h1>
                        {photo.description ? <p className="mt-2 text-sm leading-6 text-ink-soft">{photo.description}</p> : null}
                      </div>

                      <div className="space-y-3 text-sm text-ink-soft">
                        <div className="flex items-start gap-3 rounded-lg border border-vellum bg-mist p-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pine-light text-pine-dark">
                            <VisibilityIcon size={17} />
                          </span>
                          <div>
                            <p className="font-semibold text-ink">{visibilityDetails[photo.visibility].label}</p>
                            <p className="text-xs leading-5 text-ink-muted">{visibilityDetails[photo.visibility].description}</p>
                          </div>
                        </div>
                        {photo.user ? (
                          <Link className="focus-ring inline-flex items-center gap-2 rounded-lg font-semibold text-pine-dark hover:text-pine" to={`/users/${photo.user.id}/photos`}>
                            <User size={16} />
                            {photo.user.name}
                          </Link>
                        ) : null}
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="text-lagoon-dark" />
                          {createdDate}
                        </p>
                        <p className="flex items-center gap-2">
                          <MessageCircle size={16} className="text-lagoon-dark" />
                          {photo._count?.comments ?? 0} {(photo._count?.comments ?? 0) === 1 ? "comment" : "comments"}
                        </p>
                        <PhotoLikeButton photoId={photo.id} />
                        {isOwner ? (
                          <div className="flex flex-wrap gap-2">
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
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}

                  <section className="border-t border-vellum pt-5" aria-labelledby="viewer-tags-heading">
                    <div className="flex items-center justify-between gap-3">
                      <h2 id="viewer-tags-heading" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft">
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

                  <PhotoComments photoId={photo.id} />
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </FocusTrap>
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
    </>
  );
}
