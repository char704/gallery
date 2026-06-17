interface UserStatsProps {
  photos: number;
  albums: number;
  likes: number;
}

export function UserStats({ photos, albums, likes }: UserStatsProps) {
  const stats = [
    { label: "Photos", value: photos },
    { label: "Albums", value: albums },
    { label: "Likes", value: likes }
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4">
          <dt className="text-sm text-slate-500">{stat.label}</dt>
          <dd className="mt-1 text-2xl font-semibold text-ink">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
