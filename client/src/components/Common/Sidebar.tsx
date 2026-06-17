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
    "focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-white text-pine shadow-sm" : "text-slate-600 hover:bg-white"
  ].join(" ");

export function Sidebar() {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);

  return (
    <aside
      className={[
        "w-56 shrink-0 lg:block",
        isSidebarOpen ? "block" : "hidden"
      ].join(" ")}
      aria-label="Section navigation"
    >
      <nav className="sticky top-6 space-y-1">
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
