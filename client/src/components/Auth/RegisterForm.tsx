import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useRegister } from "../../hooks/useAuth";
import { registerSchema } from "../../utils/validators";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const registerUser = useRegister();
  const navigate = useNavigate();
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
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input
          className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          autoComplete="name"
          {...register("name")}
        />
        {errors.name ? <span className="text-sm text-red-600">{errors.name.message}</span> : null}
      </label>
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
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password ? (
          <span className="text-sm text-red-600">{errors.password.message}</span>
        ) : null}
      </label>
      <button
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white hover:bg-teal-800"
        type="submit"
        disabled={registerUser.isPending}
      >
        <UserPlus size={18} />
        {registerUser.isPending ? "Creating..." : "Create account"}
      </button>
      {errors.root ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p> : null}
    </form>
  );
}
