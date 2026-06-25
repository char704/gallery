import { Link } from "react-router-dom";
import { RegisterForm } from "../components/Auth/RegisterForm";

export default function Register() {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-8 py-4 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,440px)] md:items-start md:py-10">
      <div className="space-y-5 md:pt-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-lagoon-dark">Start your gallery</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">Create a FrameHub account</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted md:text-base">
            Set up a personal place for photos, albums, comments, and sharing controls that stay easy to understand.
          </p>
        </div>
        <div className="border-l-2 border-lagoon pl-4 text-sm leading-6 text-ink-muted">
          New accounts open directly into your gallery so you can upload, organize, and choose privacy for each photo.
        </div>
      </div>

      <div className="border border-vellum bg-surface p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-ink">Account details</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Already registered?{" "}
            <Link className="focus-ring rounded-sm font-semibold text-lagoon-dark hover:text-pine" to="/login">
              Sign in
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}
