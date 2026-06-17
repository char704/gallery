import { useParams } from "react-router-dom";
import { AlbumPhotos } from "../components/Album/AlbumPhotos";
import { sampleAlbums, samplePhotos } from "../utils/sampleData";

export default function AlbumDetail() {
  const { albumId } = useParams();
  const album = sampleAlbums.find((item) => item.id === albumId) ?? sampleAlbums[0];

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">{album.name}</h1>
      <p className="mt-2 text-slate-600">{album.description}</p>
      <div className="mt-5">
        <AlbumPhotos photos={samplePhotos} />
      </div>
    </section>
  );
}
