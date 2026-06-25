import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Search photos, tags, or creators</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lagoon-dark" size={18} />
      <input
        type="search"
        className="focus-ring w-full rounded-lg border border-vellum bg-surface py-3 pl-10 pr-3 text-ink placeholder:text-ink-muted"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search photos, tags, or creators"
      />
    </label>
  );
}
