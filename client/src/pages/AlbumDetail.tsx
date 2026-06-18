import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlbumPhotos } from "../components/Album/AlbumPhotos";
import { ConfirmDialog } from "../components/Common/ConfirmDialog";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { useMyPhotos } from "../hooks/usePhotos";
import { albumService } from "../services/album.service";
import { useAuthStore } from "../store/authStore";

export default function AlbumDetail() {
  const { albumId } = useParams();
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [removePhotoId, setRemovePhotoId] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const albumQuery = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => albumService.detail(albumId ?? "", token),
    enabled: Boolean(albumId)
  });
  const galleryQuery = useMyPhotos(1, 60);

  const album = albumQuery.data;
  const isOwner = Boolean(album && user?.id === album.userId);
  const albumPhotoIds = useMemo(() => new Set(album?.photos.map((photo) => photo.id) ?? []), [album?.photos]);
  const addablePhotos = (galleryQuery.data?.photos ?? []).filter((photo) => !albumPhotoIds.has(photo.id));

  const invalidateAlbum = () => {
    void queryClient.invalidateQueries({ queryKey: ["albums", albumId] });
    void queryClient.invalidateQueries({ queryKey: ["albums"] });
  };

  const addPhotoMutation = useMutation({
    mutationFn: (photoId: string) => albumService.addPhoto(albumId ?? "", photoId, token ?? ""),
    onSuccess: () => {
      setSelectedPhotoId("");
      invalidateAlbum();
    }
  });

  const removePhotoMutation = useMutation({
    mutationFn: (photoId: string) => albumService.removePhoto(albumId ?? "", photoId, token ?? ""),
    onSuccess: () => {
      setRemovePhotoId(null);
      invalidateAlbum();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => albumService.delete(albumId ?? "", token ?? ""),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["albums"] });
      navigate("/albums", { replace: true });
    }
  });

  if (albumQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (albumQuery.isError || !album) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {albumQuery.error instanceof Error ? albumQuery.error.message : "Could not load album."}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{album.name}</h1>
          {album.description ? <p className="mt-2 text-slate-600">{album.description}</p> : null}
          <p className="mt-2 text-sm uppercase tracking-wide text-slate-500">
            {album.photoCount ?? album.photos.length} photos / {album.visibility.toLowerCase()}
          </p>
        </div>
        {isOwner ? (
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={16} />
            Delete album
          </button>
        ) : null}
      </div>

      {isOwner ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-ink">Add a photo</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <select
              className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
              value={selectedPhotoId}
              onChange={(event) => setSelectedPhotoId(event.target.value)}
            >
              <option value="">Choose from your gallery</option>
              {addablePhotos.map((photo) => (
                <option key={photo.id} value={photo.id}>
                  {photo.title}
                </option>
              ))}
            </select>
            <button
              className="focus-ring rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              type="button"
              disabled={!selectedPhotoId || addPhotoMutation.isPending}
              onClick={() => addPhotoMutation.mutate(selectedPhotoId)}
            >
              {addPhotoMutation.isPending ? "Adding..." : "Add"}
            </button>
          </div>
          {galleryQuery.isError ? <p className="mt-2 text-sm text-red-600">Could not load your gallery photos.</p> : null}
          {addPhotoMutation.isError ? (
            <p className="mt-2 text-sm text-red-600">
              {addPhotoMutation.error instanceof Error ? addPhotoMutation.error.message : "Could not add photo."}
            </p>
          ) : null}
        </section>
      ) : null}

      <AlbumPhotos photos={album.photos} />

      {isOwner && album.photos.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-ink">Manage album photos</h2>
          <div className="mt-3 divide-y divide-slate-100">
            {album.photos.map((photo) => (
              <div key={photo.id} className="flex items-center justify-between gap-3 py-3">
                <Link className="focus-ring rounded text-sm font-medium text-ink hover:text-pine" to={`/photos/${photo.id}`}>
                  {photo.title}
                </Link>
                <button
                  className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
                  type="button"
                  onClick={() => setRemovePhotoId(photo.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(removePhotoId)}
        title="Remove Photo"
        message="Remove this photo from the album? The original photo will stay in your gallery."
        confirmText="Remove"
        isLoading={removePhotoMutation.isPending}
        onCancel={() => setRemovePhotoId(null)}
        onConfirm={() => {
          if (removePhotoId) {
            removePhotoMutation.mutate(removePhotoId);
          }
        }}
      />
    </section>
  );
}
