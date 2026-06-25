import { Link } from "react-router-dom";
import { LoginForm } from "../components/Auth/LoginForm";

export default function Login() {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-8 py-4 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,440px)] md:items-start md:py-10">
      <div className="space-y-5 md:pt-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-lagoon-dark">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">Sign in to FrameHub</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted md:text-base">
            Return to your albums, private photos, comments, and upload workspace with the same calm gallery experience.
          </p>
        </div>
        <div className="border-l-2 border-lagoon pl-4 text-sm leading-6 text-ink-muted">
          Your session keeps protected photos private while public galleries remain easy to browse and share.
        </div>
      </div>

      <div className="border border-vellum bg-surface p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-ink">Account access</h2>
          <p className="mt-2 text-sm text-ink-muted">
            New here?{" "}
            <Link className="focus-ring rounded-sm font-semibold text-lagoon-dark hover:text-pine" to="/register">
              Create an account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
