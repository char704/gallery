import { Camera, Menu, Search, Upload } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { APP_NAME } from "../../utils/constants";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "focus-ring inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-semibold transition duration-300 motion-reduce:transition-none",
    isActive ? "bg-pine-light text-pine-dark" : "text-ink-soft hover:bg-surface hover:text-pine-dark"
  ].join(" ");

export function Header() {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isHomeRoute = pathname === "/";

  function handleLogout() {
    clearSession();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-vellum/80 bg-surface/85 backdrop-blur-xl">
      <a
        className="focus-ring sr-only left-4 top-4 z-50 rounded-lg bg-surface px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {isHomeRoute ? null : (
            <button
              className="focus-ring rounded-lg border border-vellum bg-white/70 p-2 text-ink-soft transition hover:bg-surface hover:text-ink motion-reduce:transition-none lg:hidden"
              type="button"
              onClick={toggleSidebar}
              aria-label="Toggle section navigation"
              aria-controls="section-navigation"
              aria-expanded={isSidebarOpen}
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          )}
          <Link className="focus-ring flex items-center gap-2 rounded-lg" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
              <Camera size={20} aria-hidden="true" />
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
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink
            className={({ isActive }) =>
              [
                "focus-ring inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-vellum bg-white/60 p-2 transition motion-reduce:transition-none",
                isActive ? "text-pine-dark" : "text-ink-soft hover:bg-surface hover:text-pine-dark"
              ].join(" ")
            }
            to="/search"
            aria-label="Search"
          >
            <Search size={18} aria-hidden="true" />
          </NavLink>
          <Link
            className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-pine px-2 py-2 text-sm font-semibold text-white transition hover:bg-pine-dark motion-reduce:transition-none sm:px-3"
            to="/upload"
            aria-label="Upload photos"
          >
            <Upload size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Upload</span>
          </Link>
          {isAuthenticated ? (
            <button
              className="focus-ring inline-flex min-h-10 items-center rounded-lg border border-vellum bg-white/60 px-2 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface hover:text-ink motion-reduce:transition-none sm:px-3"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              className="focus-ring inline-flex min-h-10 items-center rounded-lg border border-vellum bg-white/60 px-2 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface hover:text-ink motion-reduce:transition-none sm:px-3"
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
