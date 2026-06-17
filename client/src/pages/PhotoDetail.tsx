import { Link, useParams } from "react-router-dom";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { samplePhotos } from "../utils/sampleData";

export default function PhotoDetail() {
  const { photoId } = useParams();
  const photo = samplePhotos.find((item) => item.id === photoId) ?? samplePhotos[0];

  return (
    <section className="space-y-5">
      <Link className="focus-ring rounded-lg text-sm font-semibold text-pine" to="/gallery">
        Back to gallery
      </Link>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img className="max-h-[70vh] w-full object-cover" src={photo.imageUrl} alt={photo.title} />
        <div className="p-5">
          <h1 className="text-2xl font-semibold text-ink">{photo.title}</h1>
          <p className="mt-2 text-slate-600">{photo.description}</p>
        </div>
      </div>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Related</h2>
        <PhotoGrid photos={samplePhotos.filter((item) => item.id !== photo.id)} />
      </section>
    </section>
  );
}
