import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
      <Link className="focus-ring mt-4 inline-block rounded-lg bg-pine px-4 py-2 font-semibold text-white" to="/">
        Return home
      </Link>
    </section>
  );
}
