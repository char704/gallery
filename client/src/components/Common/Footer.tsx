import { APP_NAME } from "../../utils/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
        <span>{APP_NAME}</span>
        <span>Personal gallery platform</span>
      </div>
    </footer>
  );
}
