import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { photoService } from "../../services/photo.service";
import { useAuthStore } from "../../store/authStore";

interface PhotoCommentsProps {
  photoId: string;
}

export function PhotoComments({ photoId }: PhotoCommentsProps) {
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const commentsQuery = useQuery({
    queryKey: ["comments", photoId, page],
    queryFn: () => photoService.getComments(photoId, page, 20, token),
    enabled: Boolean(photoId)
  });

  const invalidateComments = () => {
    void queryClient.invalidateQueries({ queryKey: ["comments", photoId] });
    void queryClient.invalidateQueries({ queryKey: ["photos"] });
  };

  const createMutation = useMutation({
    mutationFn: () => photoService.createComment(photoId, content, token ?? ""),
    onSuccess: () => {
      setContent("");
      setPage(1);
      invalidateComments();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => photoService.deleteComment(commentId, token ?? ""),
    onSuccess: invalidateComments
  });

  const comments = commentsQuery.data?.comments ?? [];
  const pages = commentsQuery.data?.pages ?? 1;

  return (
    <section className="rounded-xl border border-vellum bg-surface p-4 shadow-soft sm:p-5" aria-labelledby="photo-comments-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="photo-comments-heading" className="text-xl font-bold text-ink">
          Comments
        </h2>
        {commentsQuery.data ? <span className="text-sm font-semibold text-ink-muted">{commentsQuery.data.total} total</span> : null}
      </div>

      {token ? (
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (content.trim()) {
              createMutation.mutate();
            }
          }}
        >
          <label className="sr-only" htmlFor="photo-comment-content">
            Add a comment
          </label>
          <input
            id="photo-comment-content"
            className="focus-ring min-w-0 flex-1 rounded-lg border border-vellum bg-surface px-3 py-2 text-ink placeholder:text-ink-muted"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a comment"
            maxLength={1000}
          />
          <button
            className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={createMutation.isPending || !content.trim()}
          >
            <Send size={16} />
            Post
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-lg border border-vellum bg-mist p-3 text-sm text-ink-soft">Log in to join the conversation.</p>
      )}

      {createMutation.isError ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {createMutation.error instanceof Error ? createMutation.error.message : "Could not post comment."}
        </p>
      ) : null}

      <div className="mt-5 divide-y divide-vellum">
        {commentsQuery.isLoading ? <p className="py-4 text-sm text-ink-muted">Loading comments...</p> : null}
        {comments.map((comment) => (
          <article key={comment.id} className="flex items-start justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-semibold text-ink">{comment.user?.name ?? "FrameHub user"}</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">{comment.content}</p>
            </div>
            {user?.id === comment.userId ? (
              <button
                className="focus-ring rounded-lg border border-vellum bg-surface p-2 text-ink-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                type="button"
                aria-label="Delete comment"
                onClick={() => deleteMutation.mutate(comment.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={15} />
              </button>
            ) : null}
          </article>
        ))}
        {!commentsQuery.isLoading && comments.length === 0 ? <p className="py-4 text-sm text-ink-muted">No comments yet.</p> : null}
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
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
        </div>
      ) : null}
    </section>
  );
}
