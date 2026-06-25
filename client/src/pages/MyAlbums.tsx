import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlbumCard } from "../components/Album/AlbumCard";
import { AlbumForm } from "../components/Album/AlbumForm";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { useAlbums } from "../hooks/useAlbums";
import { albumService } from "../services/album.service";
import { useAuthStore } from "../store/authStore";
import type { Visibility } from "../types";

interface MyAlbumsProps {
  showCreateForm?: boolean;
}

export default function MyAlbums({ showCreateForm = false }: MyAlbumsProps) {
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(showCreateForm);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useAlbums(page, 12);

  const createMutation = useMutation({
    mutationFn: (values: { name: string; description?: string; visibility: Visibility }) =>
      albumService.create(values, token ?? ""),
    onSuccess: (album) => {
      void queryClient.invalidateQueries({ queryKey: ["albums"] });
      setIsCreating(false);
      navigate(`/albums/${album.id}`);
    }
  });

  if (isLoading) {
    return (
      <section className="rounded-lg border border-vellum bg-surface/75 p-8" role="status" aria-label="Loading albums">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="text-xl font-semibold text-red-950">Albums unavailable</h1>
        <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Could not load albums."}</p>
      </section>
    );
  }

  const albums = data?.albums ?? [];
  const pages = data?.pages ?? 1;

  return (
    <section className="space-y-5" aria-labelledby="my-albums-heading">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 id="my-albums-heading" className="text-3xl font-bold leading-tight text-ink">
            Albums
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            Organize your uploads into calm collections with clear privacy settings.
          </p>
        </div>
        <button
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine-dark"
          type="button"
          onClick={() => setIsCreating((current) => !current)}
          aria-expanded={isCreating}
        >
          <Plus size={18} />
          {isCreating ? "Close form" : "New album"}
        </button>
      </header>

      {isCreating ? (
        <section className="space-y-3" aria-labelledby="create-album-heading">
          <div>
            <h2 id="create-album-heading" className="text-xl font-bold text-ink">
              Create album
            </h2>
            <p className="mt-1 text-sm text-ink-muted">Start with a name and privacy setting. You can add photos after it is created.</p>
          </div>
          <AlbumForm
            isSubmitting={createMutation.isPending}
            onSubmit={(values) =>
              createMutation.mutate({
                name: values.name,
                description: values.description,
                visibility: values.visibility
              })
            }
          />
        </section>
      ) : null}

      {createMutation.isError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {createMutation.error instanceof Error ? createMutation.error.message : "Could not create album."}
        </p>
      ) : null}

      {albums.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <section className="rounded-xl border border-dashed border-vellum bg-surface/75 p-8 text-center">
          <FolderOpen className="mx-auto text-lagoon" size={34} />
          <h2 className="mt-3 text-2xl font-bold text-ink">No albums yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">Create your first album to group photos by trip, project, or private collection.</p>
          {!isCreating ? (
            <button
              className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine-dark"
              type="button"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={18} />
              New album
            </button>
          ) : null}
        </section>
      )}

      {albums.length > 0 ? (
        <nav className="flex items-center justify-center gap-3" aria-label="Album pagination">
          <button
            className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-ink-soft">
            Page {page} of {Math.max(1, pages)}
          </span>
          <button
            className="focus-ring rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </nav>
      ) : null}
    </section>
  );
}
