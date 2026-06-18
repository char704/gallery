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
    <div className="space-y-8">
      <section className="grid gap-6 rounded-lg bg-white p-6 shadow-soft lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pine text-white">
            <Camera size={24} />
          </div>
          <h1 className="text-3xl font-semibold text-ink">FrameHub</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Share polished photo collections, keep private work organized, and discover public uploads from the community.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="focus-ring rounded-lg bg-pine px-4 py-2 font-semibold text-white" to="/upload">
              Upload photos
            </Link>
            <Link className="focus-ring rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700" to="/explore">
              Explore
            </Link>
          </div>
        </div>
        {stats.length > 0 ? (
          <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-3">
                <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-semibold text-ink">Start the public gallery</h2>
            <p className="mt-2 text-sm text-slate-600">The first public upload will appear here automatically.</p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Recent photos</h2>
          {photos.length > 0 ? (
            <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-pine" to="/explore">
              View all
            </Link>
          ) : null}
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            {error instanceof Error ? error.message : "Failed to load recent photos."}
          </div>
        ) : photos.length > 0 ? (
          <PhotoGrid photos={photos} />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <Image className="mx-auto text-slate-400" size={34} />
            <h3 className="mt-3 text-lg font-semibold text-ink">No public photos yet</h3>
            <p className="mt-2 text-sm text-slate-500">Create an account and upload a public photo to fill this space.</p>
            <button
              className="focus-ring mt-4 rounded-lg bg-pine px-4 py-2 font-semibold text-white"
              type="button"
              onClick={() => navigate("/register")}
            >
              Join FrameHub
            </button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Why FrameHub?</h2>
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
            <article key={title} className="rounded-lg border border-slate-200 p-4">
              <Icon className="text-pine" size={22} />
              <h3 className="mt-3 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
