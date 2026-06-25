import { APP_NAME } from "../../utils/constants";

export function Footer() {
  return (
    <footer className="border-t border-vellum/80 bg-surface/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="font-display text-base font-bold text-ink">{APP_NAME}</span>
        <span>Browse, organize, and share photos with clear privacy controls.</span>
      </div>
    </footer>
  );
}
