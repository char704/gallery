import { Camera, Menu, Search, Upload } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { APP_NAME } from "../../utils/constants";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "focus-ring rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-pine text-white" : "text-slate-700 hover:bg-white"
  ].join(" ");

export function Header() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleLogout() {
    clearSession();
    navigate("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
          <Link className="focus-ring flex items-center gap-2 rounded-lg" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
              <Camera size={20} />
            </span>
            <span className="text-lg font-semibold">{APP_NAME}</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <NavLink className={navLinkClass} to="/explore">
            Explore
          </NavLink>
          <NavLink className={navLinkClass} to="/gallery">
            Gallery
          </NavLink>
          <NavLink className={navLinkClass} to="/albums">
            Albums
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            to="/search"
            aria-label="Search"
          >
            <Search size={18} />
          </Link>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            to="/upload"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Upload</span>
          </Link>
          {isAuthenticated ? (
            <button
              className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              to="/login"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
