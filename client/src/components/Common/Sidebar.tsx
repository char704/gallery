import { FolderOpen, Home, Images, Telescope } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Telescope },
  { to: "/gallery", label: "My Gallery", icon: Images },
  { to: "/albums", label: "Albums", icon: FolderOpen }
] as const;

const navLinkClass = (isActive: boolean) =>
  [
    "focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition duration-300 motion-reduce:transition-none",
    isActive ? "bg-surface text-pine-dark shadow-sm" : "text-ink-muted hover:bg-surface/70 hover:text-ink"
  ].join(" ");

function isActiveSection(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/";
  }

  if (to === "/gallery") {
    return pathname === "/gallery" || pathname === "/my/photos";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Sidebar() {
  const { pathname } = useLocation();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <aside
      id="section-navigation"
      className={[
        "w-full shrink-0 lg:block lg:w-56",
        isSidebarOpen ? "block" : "hidden"
      ].join(" ")}
      aria-label="Section navigation"
    >
      <nav className="space-y-1 rounded-lg border border-vellum bg-surface/70 p-2 backdrop-blur-md lg:sticky lg:top-24">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = isActiveSection(pathname, to);

          return (
            <Link
              key={to}
              className={navLinkClass(isActive)}
              to={to}
              onClick={() => setSidebarOpen(false)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
