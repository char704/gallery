import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl border border-vellum bg-surface p-6 text-center sm:p-8" aria-labelledby="not-found-title">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-vellum bg-white text-lagoon-dark">
        <Compass size={24} aria-hidden="true" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-lagoon-dark">404</p>
      <h1 id="not-found-title" className="mt-2 text-3xl font-semibold text-ink">
        Page not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">
        This link may be outdated, private, or moved. You can return to public discovery and keep browsing photos.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-pine px-5 py-3 font-semibold text-white transition hover:bg-pine-dark motion-reduce:transition-none"
          to="/explore"
        >
          Explore photos
        </Link>
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-vellum bg-white px-5 py-3 font-semibold text-ink transition hover:border-lagoon hover:text-lagoon-dark motion-reduce:transition-none"
          to="/"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Home
        </Link>
      </div>
    </section>
  );
}
