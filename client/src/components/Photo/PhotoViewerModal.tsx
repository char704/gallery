import { Calendar, RotateCcw, User, X, ZoomIn, ZoomOut } from "lucide-react";
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

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
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

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(photo.createdAt));
  }, [photo]);

  const label = photo ? `Viewing ${photo.title}` : "Photo viewer";

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
        <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-50 flex bg-black/95">
          <div className="flex min-h-0 w-full flex-col lg:flex-row">
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="absolute left-3 top-3 z-10 flex gap-2">
                <button
                  ref={closeButtonRef}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white shadow-soft backdrop-blur hover:bg-white/15"
                  type="button"
                  aria-label="Close photo viewer"
                  onClick={() => navigate(-1)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center p-4 pt-16 lg:p-8">
                {isLoading ? (
                  <LoadingSpinner />
                ) : isError || !photo ? (
                  <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
                    {error instanceof Error ? error.message : "Photo not found."}
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
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/15 bg-black/60 p-1.5 shadow-soft backdrop-blur">
                          <button
                            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/15"
                            type="button"
                            aria-label="Zoom in"
                            onClick={() => zoomIn(0.5, prefersReducedMotion ? 0 : 200)}
                          >
                            <ZoomIn size={19} />
                          </button>
                          <button
                            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/15"
                            type="button"
                            aria-label="Zoom out"
                            onClick={() => zoomOut(0.5, prefersReducedMotion ? 0 : 200)}
                          >
                            <ZoomOut size={19} />
                          </button>
                          <button
                            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/15"
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
              <aside className="max-h-[42vh] overflow-y-auto border-t border-white/10 bg-white p-5 text-ink lg:h-screen lg:max-h-screen lg:w-96 lg:border-l lg:border-t-0">
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
                      <div>
                        <h1 className="text-2xl font-semibold text-ink">{photo.title}</h1>
                        {photo.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{photo.description}</p> : null}
                      </div>

                      <div className="space-y-3 text-sm text-slate-600">
                        {photo.user ? (
                          <Link className="focus-ring inline-flex items-center gap-2 rounded-lg font-semibold text-pine" to={`/users/${photo.user.id}/photos`}>
                            <User size={16} />
                            {photo.user.name}
                          </Link>
                        ) : null}
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          {createdDate}
                        </p>
                        <PhotoLikeButton photoId={photo.id} />
                        {isOwner ? (
                          <div className="flex flex-wrap gap-2">
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
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}

                  <div className="border-t border-slate-200 pt-5">
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
