import { FolderOpen, Home, Images, Settings, Telescope } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Telescope },
  { to: "/gallery", label: "My Gallery", icon: Images },
  { to: "/albums", label: "Albums", icon: FolderOpen },
  { to: "/settings", label: "Settings", icon: Settings }
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition duration-300",
    isActive ? "bg-surface text-pine-dark shadow-sm" : "text-ink-muted hover:bg-surface/70 hover:text-ink"
  ].join(" ");

export function Sidebar() {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);

  return (
    <aside
      className={[
        "w-full shrink-0 lg:block lg:w-56",
        isSidebarOpen ? "block" : "hidden"
      ].join(" ")}
      aria-label="Section navigation"
    >
      <nav className="space-y-1 rounded-xl border border-white/40 bg-white/20 p-2 backdrop-blur-md lg:sticky lg:top-24">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} className={navLinkClass} to={to}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
