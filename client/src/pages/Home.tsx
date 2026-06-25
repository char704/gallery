import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Camera, CloudUpload, Compass, Folders, Image, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  const heroPhotos = photos.slice(0, 3);
  const stats =
    totalPhotos > 0
      ? [
          ["Public photos", totalPhotos],
          ["Gallery pages", totalPages],
          ["Recent uploads", photos.length]
        ]
      : [];

  return (
    <div className="space-y-10">
      <section className="grid gap-8 border-b border-vellum pb-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1fr)] lg:items-end">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-vellum bg-surface px-3 py-1.5 text-sm font-semibold text-lagoon-dark">
            <Camera size={16} aria-hidden="true" />
            Personal photo galleries, quietly organized
          </div>
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">FrameHub</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
              A focused home for browsing public photos, managing private albums, and sharing images with clear privacy controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg bg-pine px-5 py-3 font-semibold text-white transition hover:bg-pine-dark motion-reduce:transition-none"
              to="/explore"
            >
              Explore photos
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
              to="/upload"
            >
              <CloudUpload size={18} aria-hidden="true" />
              Upload
            </Link>
            <Link
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
              to="/register"
            >
              <UserPlus size={18} aria-hidden="true" />
              Register
            </Link>
          </div>
          {stats.length > 0 ? (
            <dl className="grid max-w-xl grid-cols-3 gap-3 border-t border-vellum pt-4">
              {stats.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-pine-dark">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="min-h-[360px]">
          {isLoading ? (
            <div className="grid h-full min-h-[360px] grid-cols-[1.1fr_0.9fr] gap-3" aria-label="Loading recent public photos">
              <div className="animate-pulse rounded-lg bg-vellum motion-reduce:animate-none" />
              <div className="grid gap-3">
                <div className="animate-pulse rounded-lg bg-vellum motion-reduce:animate-none" />
                <div className="animate-pulse rounded-lg bg-vellum motion-reduce:animate-none" />
              </div>
            </div>
          ) : heroPhotos.length > 0 ? (
            <div className="grid min-h-[360px] grid-cols-[1.1fr_0.9fr] gap-3">
              {heroPhotos.map((photo, index) => (
                <Link
                  key={photo.id}
                  className={`focus-ring group relative overflow-hidden rounded-lg bg-ink ${index === 0 ? "row-span-2" : ""}`}
                  to={`/photos/${photo.id}`}
                >
                  <img
                    className="h-full min-h-[174px] w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-sm font-semibold text-white">
                    {photo.title}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center border border-dashed border-vellum bg-surface p-8 text-center">
              <Image className="text-lagoon" size={34} aria-hidden="true" />
              <h2 className="mt-3 text-2xl font-semibold text-ink">No public photos yet</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">The first public upload will appear here automatically.</p>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="home-recent-title">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="home-recent-title" className="text-3xl font-semibold text-ink">
              Recent photos
            </h2>
            <p className="mt-1 text-sm text-ink-muted">Fresh public work from FrameHub contributors.</p>
          </div>
          {photos.length > 0 ? (
            <Link
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-vellum bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
              to="/explore"
            >
              View all
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        {isLoading ? (
          <PhotoGrid photos={[]} isLoading layout="masonry" />
        ) : isError ? (
          <div className="flex gap-3 border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
            <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold">Recent photos could not load</h3>
              <p className="mt-1 text-sm">{error instanceof Error ? error.message : "Failed to load recent photos."}</p>
            </div>
          </div>
        ) : photos.length > 0 ? (
          <PhotoGrid photos={photos} layout="masonry" photoCardPresentation="explore" />
        ) : (
          <div className="border border-dashed border-vellum bg-surface p-8 text-center">
            <Image className="mx-auto text-lagoon" size={34} aria-hidden="true" />
            <h3 className="mt-3 text-2xl font-semibold text-ink">No public photos yet</h3>
            <p className="mt-2 text-sm text-ink-muted">Create an account and upload a public photo to fill this space.</p>
            <button
              className="focus-ring mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-pine-dark motion-reduce:transition-none"
              type="button"
              onClick={() => navigate("/register")}
            >
              <UserPlus size={18} aria-hidden="true" />
              Join FrameHub
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="home-purpose-title">
        <h2 id="home-purpose-title" className="text-2xl font-semibold text-ink">
          Built for photo sharing that stays understandable
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Upload with context",
              text: "Add images with metadata and visibility controls.",
              icon: CloudUpload
            },
            {
              title: "Browse public work",
              text: "Browse public photos from every contributor.",
              icon: Compass
            },
            {
              title: "Separate spaces",
              text: "Keep private work separate from public galleries.",
              icon: Folders
            }
          ].map(({ title, text, icon: Icon }) => (
            <article key={title} className="border border-vellum bg-surface p-5">
              <Icon className="text-lagoon" size={22} aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
