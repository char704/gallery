import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CloudUpload,
  Compass,
  Folders,
  Image,
  Images,
  LogIn,
  Search,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { photoService } from "../services/photo.service";
import { useAuthStore } from "../store/authStore";
import type { Photo } from "../types";

function photoSource(photo: Photo) {
  return photo.thumbnailUrl || photo.imageUrl;
}

function CaptionedPhoto({
  photo,
  className = "",
  priority = false
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      className={`focus-ring group relative block overflow-hidden rounded-xl bg-ink ${className}`}
      to={`/photos/${photo.id}`}
      aria-label={`Open ${photo.title}`}
    >
      <img
        className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-[1.025]"
        src={photoSource(photo)}
        alt={photo.title}
        loading={priority ? "eager" : "lazy"}
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/82 via-ink/25 to-transparent p-3 text-white">
        <span className="block font-display text-lg font-bold leading-tight sm:text-xl">{photo.title}</span>
        {photo.user ? <span className="mt-1 block text-xs font-semibold text-white/78">by {photo.user.name}</span> : null}
      </span>
    </Link>
  );
}

function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end rounded-xl border border-dashed border-vellum bg-surface/75 p-5 ${className}`}>
      <div>
        <Image className="text-lagoon" size={30} aria-hidden="true" />
        <p className="mt-3 max-w-xs font-display text-2xl font-bold leading-tight text-ink">A public frame will land here.</p>
      </div>
    </div>
  );
}

function HeroMedia({ photos }: { photos: Photo[] }) {
  const [lead, second, third] = photos;

  return (
    <div className="grid gap-3 md:grid-cols-12">
      <div className="md:col-span-8">
        {lead ? (
          <CaptionedPhoto photo={lead} priority className="aspect-[5/4] md:aspect-auto md:h-full md:min-h-[25rem] xl:min-h-[28rem]" />
        ) : (
          <PhotoPlaceholder className="min-h-72 md:h-full md:min-h-[25rem] xl:min-h-[28rem]" />
        )}
      </div>
      <div className="grid gap-3 md:col-span-4 md:grid-rows-2">
        {second ? (
          <CaptionedPhoto photo={second} className="aspect-[4/3] md:aspect-auto md:h-full" />
        ) : (
          <PhotoPlaceholder className="min-h-48" />
        )}
        {third ? (
          <CaptionedPhoto photo={third} className="aspect-[4/3] md:aspect-auto md:h-full" />
        ) : (
          <PhotoPlaceholder className="min-h-48" />
        )}
      </div>
    </div>
  );
}

function LoadingHeroMedia() {
  return (
    <div className="grid gap-3 md:grid-cols-12" aria-label="Loading featured public photos">
      <div className="aspect-[5/4] animate-pulse rounded-xl bg-vellum motion-reduce:animate-none md:col-span-8 md:aspect-auto md:h-full md:min-h-[25rem] xl:min-h-[28rem]" />
      <div className="grid gap-3 md:col-span-4 md:grid-rows-2">
        <div className="aspect-[4/3] animate-pulse rounded-xl bg-vellum motion-reduce:animate-none md:aspect-auto md:h-full" />
        <div className="aspect-[4/3] animate-pulse rounded-xl bg-vellum motion-reduce:animate-none md:aspect-auto md:h-full" />
      </div>
    </div>
  );
}

function AuthActions({ isAuthenticated, compact = false }: { isAuthenticated: boolean; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-3 ${compact ? "" : "pt-1"}`}>
      <Link
        className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg bg-pine px-5 py-3 font-semibold text-white transition hover:bg-pine-dark motion-reduce:transition-none"
        to="/explore"
      >
        Explore photos
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
      {isAuthenticated ? (
        <>
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
            to="/upload"
          >
            <CloudUpload size={18} aria-hidden="true" />
            Upload
          </Link>
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
            to="/gallery"
          >
            <Images size={18} aria-hidden="true" />
            My Gallery
          </Link>
        </>
      ) : (
        <>
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
            to="/register"
          >
            <UserPlus size={18} aria-hidden="true" />
            Register
          </Link>
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-vellum bg-surface px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
            to="/login"
          >
            <LogIn size={18} aria-hidden="true" />
            Login
          </Link>
        </>
      )}
    </div>
  );
}

function RecentPhotoGrid({ photos }: { photos: Photo[] }) {
  const spanClasses = [
    "lg:col-span-5",
    "lg:col-span-4",
    "lg:col-span-3",
    "lg:col-span-4",
    "lg:col-span-3",
    "lg:col-span-5"
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
      {photos.slice(0, 6).map((photo, index) => (
        <CaptionedPhoto
          key={photo.id}
          photo={photo}
          className={[
            "aspect-[4/3]",
            spanClasses[index] ?? "lg:col-span-4",
            index === 0 ? "lg:aspect-[5/4]" : "",
            index === 2 || index === 4 ? "lg:aspect-square" : ""
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    data: publicPhotosData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["photos", "home", "public"],
    queryFn: () => photoService.getPublicPhotos(1, 10),
    staleTime: 5 * 60 * 1000
  });
  const photos = publicPhotosData?.photos ?? [];
  const heroPhotos = photos.slice(0, 3);
  const recentPhotos = photos.slice(0, 6);

  return (
    <div className="space-y-12 pb-8">
      <section className="border-b border-vellum pb-10" aria-labelledby="home-title">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-vellum bg-surface/70 px-3 py-1.5 text-sm font-semibold text-lagoon-dark">
              <Camera size={16} aria-hidden="true" />
              Quiet contact sheet
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-pine-dark">
                {isAuthenticated ? "Welcome back to your gallery table" : "A personal photo journal without the feed noise"}
              </p>
              <h1 id="home-title" className="max-w-3xl font-display text-5xl font-bold leading-none text-ink sm:text-6xl xl:text-7xl">
                FrameHub
              </h1>
              <p className="max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
                Browse public photos, manage private albums, and share images with clear privacy controls.
              </p>
            </div>
            <AuthActions isAuthenticated={isAuthenticated} />
          </div>

          <div className="lg:col-span-7">
            {isLoading ? <LoadingHeroMedia /> : <HeroMedia photos={heroPhotos} />}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-12" aria-labelledby="home-recent-title">
        <div className="space-y-4 lg:col-span-3">
          <div>
            <p className="text-sm font-semibold text-lagoon-dark">Recent photos</p>
            <h2 id="home-recent-title" className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              A public index, arranged by eye
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-ink-muted">
            Discovery stays visual and direct, with captions kept consistent across the sheet.
          </p>
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

        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12" aria-label="Loading recent public photos">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className={[
                    "aspect-[4/3] animate-pulse rounded-xl bg-vellum motion-reduce:animate-none",
                    index === 0 ? "lg:col-span-5 lg:aspect-[5/4]" : "",
                    index === 1 ? "lg:col-span-4" : "",
                    index === 2 ? "lg:col-span-3 lg:aspect-square" : "",
                    index === 3 ? "lg:col-span-4" : "",
                    index === 4 ? "lg:col-span-3 lg:aspect-square" : "",
                    index === 5 ? "lg:col-span-5" : ""
                  ].join(" ")}
                />
              ))}
            </div>
          ) : isError ? (
            <div className="flex gap-3 border-y border-red-200 bg-red-50/70 p-4 text-red-800" role="alert">
              <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold">Recent photos could not load</h3>
                <p className="mt-1 text-sm">{error instanceof Error ? error.message : "Failed to load recent photos."}</p>
              </div>
            </div>
          ) : recentPhotos.length > 0 ? (
            <RecentPhotoGrid photos={recentPhotos} />
          ) : (
            <div className="border-y border-dashed border-vellum bg-surface/70 p-8">
              <Image className="text-lagoon" size={34} aria-hidden="true" />
              <h3 className="mt-3 font-display text-3xl font-bold text-ink">No public photos yet</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink-muted">
                {isAuthenticated
                  ? "Upload a public photo when you are ready to share something with the gallery."
                  : "Create an account or sign in to upload a public photo to this space."}
              </p>
              <div className="mt-4">
                {isAuthenticated ? (
                  <Link
                    className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-pine-dark motion-reduce:transition-none"
                    to="/upload"
                  >
                    <CloudUpload size={18} aria-hidden="true" />
                    Upload photo
                  </Link>
                ) : (
                  <AuthActions isAuthenticated={false} compact />
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 border-t border-vellum pt-8 lg:grid-cols-12" aria-labelledby="home-purpose-title">
        <div className="lg:col-span-4">
          <h2 id="home-purpose-title" className="font-display text-3xl font-bold text-ink">
            Built for photo sharing that stays understandable
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            The interface keeps the work around each photo clear without turning the gallery into a feed.
          </p>
        </div>
        <div className="divide-y divide-vellum border-y border-vellum lg:col-span-8">
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
            },
            {
              title: "Find the right frame",
              text: "Search by title, creator, description, or tag without leaving the gallery rhythm.",
              icon: Search
            }
          ].map(({ title, text, icon: Icon }) => (
            <article key={title} className="grid gap-3 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon-light text-lagoon-dark">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
