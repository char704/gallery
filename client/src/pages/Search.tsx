import { useMemo, useState } from "react";
import { SearchBar } from "../components/Search/SearchBar";
import { SearchResults } from "../components/Search/SearchResults";
import { samplePhotos } from "../utils/sampleData";

export default function Search() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return samplePhotos;
    }

    return samplePhotos.filter((photo) => {
      const tags = photo.tags?.map((tag) => tag.name.toLowerCase()).join(" ") ?? "";
      return [photo.title, photo.description ?? "", tags].join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [query]);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">Search</h1>
      <SearchBar value={query} onChange={setQuery} />
      <SearchResults photos={results} />
    </section>
  );
}
