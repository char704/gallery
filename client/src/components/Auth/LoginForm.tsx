import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useLogin } from "../../hooks/useAuth";
import { loginSchema } from "../../utils/validators";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/gallery";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await login.mutateAsync(values);
          navigate(from, { replace: true });
        } catch (error) {
          setError("root", {
            message: error instanceof Error ? error.message : "Login failed."
          });
        }
      })}
    >
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? <span className="text-sm text-red-600">{errors.email.message}</span> : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <span className="text-sm text-red-600">{errors.password.message}</span>
        ) : null}
      </label>
      <button
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white hover:bg-teal-800"
        type="submit"
        disabled={login.isPending}
      >
        <LogIn size={18} />
        {login.isPending ? "Signing in..." : "Sign in"}
      </button>
      {errors.root ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p> : null}
    </form>
  );
}
