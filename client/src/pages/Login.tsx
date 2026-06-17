import { Link } from "react-router-dom";
import { LoginForm } from "../components/Auth/LoginForm";

export default function Login() {
  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-slate-500">
        New here?{" "}
        <Link className="font-semibold text-pine" to="/register">
          Create an account
        </Link>
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </section>
  );
}
