import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
        {error instanceof Error ? error.message : "Could not load albums."}
      </section>
    );
  }

  const albums = data?.albums ?? [];
  const pages = data?.pages ?? 1;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Albums</h1>
          <p className="mt-1 text-sm text-slate-600">Organize your uploads into public, private, or unlisted collections.</p>
        </div>
        <button
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={() => setIsCreating((current) => !current)}
        >
          <Plus size={18} />
          {isCreating ? "Close form" : "New album"}
        </button>
      </div>

      {isCreating ? (
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
      ) : null}

      {createMutation.isError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">No albums yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create your first album to start organizing your photos.</p>
        </section>
      )}

      {albums.length > 0 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {Math.max(1, pages)}
          </span>
          <button
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
