import { Save } from "lucide-react";

export function EditProfile() {
  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Display name</span>
        <input className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" defaultValue="Avery Stone" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Bio</span>
        <textarea className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2" defaultValue="Photographer" />
      </label>
      <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-pine px-4 py-2 font-semibold text-white" type="button">
        <Save size={18} />
        Save profile
      </button>
    </form>
  );
}
