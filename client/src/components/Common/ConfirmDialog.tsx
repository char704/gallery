interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="focus-ring rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={[
              "focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
              isDangerous ? "bg-red-600 hover:bg-red-700" : "bg-pine hover:bg-teal-800"
            ].join(" ")}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Working..." : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
