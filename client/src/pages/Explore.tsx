import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import { samplePhotos } from "../utils/sampleData";

export default function Explore() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Explore</h1>
      <p className="mt-2 text-slate-600">Public photos from the FrameHub community.</p>
      <div className="mt-5">
        <PhotoGrid photos={samplePhotos.filter((photo) => photo.visibility === "PUBLIC")} />
      </div>
    </section>
  );
}
