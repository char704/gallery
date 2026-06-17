export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-pine" />
    </div>
  );
}
