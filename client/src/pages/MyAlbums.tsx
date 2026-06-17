import { AlbumCard } from "../components/Album/AlbumCard";
import { AlbumForm } from "../components/Album/AlbumForm";
import { sampleAlbums } from "../utils/sampleData";

interface MyAlbumsProps {
  showCreateForm?: boolean;
}

export default function MyAlbums({ showCreateForm = false }: MyAlbumsProps) {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">Albums</h1>
      {showCreateForm ? <AlbumForm /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sampleAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}
