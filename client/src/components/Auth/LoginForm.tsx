import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
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
        <span className="text-sm font-medium text-ink">Email address</span>
        <input
          className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-vellum bg-white px-3 py-2 text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-vellum/40"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          disabled={login.isPending}
          {...register("email")}
        />
        {errors.email ? (
          <span id="login-email-error" className="mt-1 flex items-center gap-1 text-sm font-medium text-red-700">
            <AlertCircle size={14} aria-hidden="true" />
            {errors.email.message}
          </span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Password</span>
        <span className="relative mt-1 block">
          <input
            className="focus-ring min-h-11 w-full rounded-lg border border-vellum bg-white px-3 py-2 pr-12 text-ink disabled:cursor-not-allowed disabled:bg-vellum/40"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            disabled={login.isPending}
            {...register("password")}
          />
          <button
            className="focus-ring absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={login.isPending}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </span>
        {errors.password ? (
          <span id="login-password-error" className="mt-1 flex items-center gap-1 text-sm font-medium text-red-700">
            <AlertCircle size={14} aria-hidden="true" />
            {errors.password.message}
          </span>
        ) : null}
      </label>
      <button
        className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-ink-muted motion-reduce:transition-none"
        type="submit"
        disabled={login.isPending}
      >
        <LogIn size={18} aria-hidden="true" />
        {login.isPending ? "Signing in..." : "Sign in"}
      </button>
      {errors.root ? (
        <div className="flex gap-2 border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800" role="alert">
          <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <p>{errors.root.message}</p>
        </div>
      ) : null}
    </form>
  );
}
