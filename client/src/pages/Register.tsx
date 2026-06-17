import { Link } from "react-router-dom";
import { RegisterForm } from "../components/Auth/RegisterForm";

export default function Register() {
  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Create account</h1>
      <p className="mt-2 text-sm text-slate-500">
        Already registered?{" "}
        <Link className="font-semibold text-pine" to="/login">
          Sign in
        </Link>
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </section>
  );
}
