import { Camera, Menu, Search, Upload } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { APP_NAME } from "../../utils/constants";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "focus-ring rounded-lg px-3 py-2 text-sm font-semibold transition duration-300",
    isActive ? "bg-pine-light text-pine-dark" : "text-ink-soft hover:bg-surface hover:text-pine-dark"
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
    <header className="sticky top-0 z-40 border-b border-vellum/80 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="focus-ring rounded-lg border border-vellum bg-white/50 p-2 text-ink-soft lg:hidden"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
          <Link className="focus-ring flex items-center gap-2 rounded-lg" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
              <Camera size={20} />
            </span>
            <span className="font-display text-2xl font-bold text-ink">{APP_NAME}</span>
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
            className="focus-ring rounded-lg border border-vellum bg-white/40 p-2 text-ink-soft transition hover:bg-surface hover:text-pine-dark"
            to="/search"
            aria-label="Search"
          >
            <Search size={18} />
          </Link>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-pine-dark"
            to="/upload"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Upload</span>
          </Link>
          {isAuthenticated ? (
            <button
              className="focus-ring rounded-lg border border-vellum bg-white/40 px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface hover:text-ink"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              className="focus-ring rounded-lg border border-vellum bg-white/40 px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface hover:text-ink"
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
