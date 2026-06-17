import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search photos, tags, or creators"
      />
    </label>
  );
}
