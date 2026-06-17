import { Link } from "react-router-dom";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { samplePhotos } from "../utils/sampleData";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-lg bg-white p-6 shadow-soft lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-3xl font-semibold text-ink">FrameHub</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Organize personal galleries, manage albums, and share public photo collections.
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
        <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {[
            ["Photos", "128"],
            ["Albums", "14"],
            ["Public", "36"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 p-3">
              <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Recent photos</h2>
          <Link className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-pine" to="/gallery">
            View gallery
          </Link>
        </div>
        <PhotoGrid photos={samplePhotos} />
      </section>
    </div>
  );
}
