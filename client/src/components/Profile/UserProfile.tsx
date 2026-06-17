import type { User } from "../../types";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-pine text-xl font-semibold text-white">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.bio ?? "Photographer"}</p>
        </div>
      </div>
    </section>
  );
}
