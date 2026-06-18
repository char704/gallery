import { useQuery } from "@tanstack/react-query";
import { Camera, CloudUpload, Compass, Folders, Image } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { photoService } from "../services/photo.service";

export default function Home() {
  const navigate = useNavigate();
  const {
    data: publicPhotosData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["photos", "home", "public"],
    queryFn: () => photoService.getPublicPhotos(1, 6),
    staleTime: 5 * 60 * 1000
  });
  const photos = publicPhotosData?.photos ?? [];
  const totalPhotos = publicPhotosData?.total ?? 0;
  const totalPages = publicPhotosData?.pages ?? 0;
  const stats =
    totalPhotos > 0
      ? [
          ["Public Photos", totalPhotos],
          ["Gallery Pages", totalPages],
          ["Recent Uploads", photos.length]
        ]
      : [];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 py-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-vellum bg-surface/70 px-3 py-1 text-sm font-semibold text-lagoon-dark shadow-sm">
            <Camera size={16} />
            Visual collections, quietly organized
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight text-ink sm:text-6xl">FrameHub</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
            Share polished photo collections, keep private work organized, and discover public uploads from the community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="focus-ring rounded-lg bg-pine px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-pine-dark" to="/upload">
              Upload photos
            </Link>
            <Link
              className="focus-ring rounded-lg border border-vellum bg-surface/70 px-5 py-3 font-semibold text-ink-soft transition hover:border-lagoon hover:text-lagoon-dark"
              to="/explore"
            >
              Explore
            </Link>
          </div>
        </div>
        {stats.length > 0 ? (
          <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-vellum bg-surface/80 p-4 shadow-soft backdrop-blur">
                <dt className="text-xs font-semibold uppercase text-ink-muted">{label}</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-pine-dark">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="rounded-xl border border-vellum bg-surface/80 p-5 shadow-soft backdrop-blur">
            <h2 className="text-xl font-bold text-ink">Start the public gallery</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">The first public upload will appear here automatically.</p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-ink">Recent photos</h2>
            <p className="mt-1 text-sm text-ink-muted">Fresh public work from FrameHub contributors.</p>
          </div>
          {photos.length > 0 ? (
            <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-pine-dark transition hover:bg-pine-light" to="/explore">
              View all
            </Link>
          ) : null}
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error instanceof Error ? error.message : "Failed to load recent photos."}
          </div>
        ) : photos.length > 0 ? (
          <PhotoGrid photos={photos} />
        ) : (
          <div className="rounded-xl border border-dashed border-vellum bg-surface/70 p-8 text-center">
            <Image className="mx-auto text-lagoon" size={34} />
            <h3 className="mt-3 text-2xl font-bold text-ink">No public photos yet</h3>
            <p className="mt-2 text-sm text-ink-muted">Create an account and upload a public photo to fill this space.</p>
            <button
              className="focus-ring mt-4 rounded-lg bg-pine px-4 py-2 font-semibold text-white shadow-soft transition hover:bg-pine-dark"
              type="button"
              onClick={() => navigate("/register")}
            >
              Join FrameHub
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-ink">Why FrameHub?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Easy Upload",
              text: "Add images with metadata and visibility controls.",
              icon: CloudUpload
            },
            {
              title: "Discover",
              text: "Browse public photos from every contributor.",
              icon: Compass
            },
            {
              title: "Organize",
              text: "Keep private work separate from public galleries.",
              icon: Folders
            }
          ].map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-xl border border-vellum bg-surface/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
              <Icon className="text-lagoon" size={22} />
              <h3 className="mt-3 text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
