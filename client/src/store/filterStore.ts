import { create } from "zustand";

interface FilterStore {
  query: string;
  tag: string;
  setQuery: (query: string) => void;
  setTag: (tag: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  query: "",
  tag: "",
  setQuery: (query) => set({ query }),
  setTag: (tag) => set({ tag }),
  clearFilters: () => set({ query: "", tag: "" })
}));
