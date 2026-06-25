import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useRegister } from "../../hooks/useAuth";
import { registerSchema } from "../../utils/validators";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const registerUser = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await registerUser.mutateAsync(values);
          navigate("/gallery", { replace: true });
        } catch (error) {
          setError("root", {
            message: error instanceof Error ? error.message : "Registration failed."
          });
        }
      })}
    >
      <label className="block">
        <span className="text-sm font-medium text-ink">Display name</span>
        <input
          className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-vellum bg-white px-3 py-2 text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-vellum/40"
          autoComplete="name"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          disabled={registerUser.isPending}
          {...register("name")}
        />
        {errors.name ? (
          <span id="register-name-error" className="mt-1 flex items-center gap-1 text-sm font-medium text-red-700">
            <AlertCircle size={14} aria-hidden="true" />
            {errors.name.message}
          </span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Email address</span>
        <input
          className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-vellum bg-white px-3 py-2 text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-vellum/40"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          disabled={registerUser.isPending}
          {...register("email")}
        />
        {errors.email ? (
          <span id="register-email-error" className="mt-1 flex items-center gap-1 text-sm font-medium text-red-700">
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
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "register-password-error register-password-help" : "register-password-help"}
            disabled={registerUser.isPending}
            {...register("password")}
          />
          <button
            className="focus-ring absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={registerUser.isPending}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </span>
        <p id="register-password-help" className="mt-1 text-sm text-ink-muted">
          Use at least 8 characters with a letter and a number.
        </p>
        {errors.password ? (
          <span id="register-password-error" className="mt-1 flex items-center gap-1 text-sm font-medium text-red-700">
            <AlertCircle size={14} aria-hidden="true" />
            {errors.password.message}
          </span>
        ) : null}
      </label>
      <button
        className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-ink-muted motion-reduce:transition-none"
        type="submit"
        disabled={registerUser.isPending}
      >
        <UserPlus size={18} aria-hidden="true" />
        {registerUser.isPending ? "Creating..." : "Create account"}
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
