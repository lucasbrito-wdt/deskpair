import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  ScrollText,
  Info,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusBadge } from "./StatusBadge";
import { useServerStore } from "@/stores/serverStore";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/logs", icon: ScrollText, label: "Logs" },
  { to: "/about", icon: Info, label: "About" },
] as const;

export function Sidebar() {
  const running = useServerStore((s) => s.running);

  return (
    <aside
      className={cn(
        "flex h-full w-56 flex-col",
        "border-r border-surface-800/60",
        "bg-gradient-to-b from-surface-900/70 to-surface-950/90",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-800/40">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            "bg-accent-500/15 text-accent-400",
          )}
        >
          <Monitor className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-surface-100 tracking-tight">
            Deskpair
          </span>
          <span className="text-[10px] text-surface-400 font-mono uppercase tracking-widest">
            GNOME
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-150",
                isActive
                  ? "text-surface-100 bg-surface-800/60"
                  : "text-surface-400 hover:text-surface-300 hover:bg-surface-800/30",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Server status */}
      <div className="border-t border-surface-800/40 px-4 py-4">
        <StatusBadge variant={running ? "running" : "stopped"} />
      </div>
    </aside>
  );
}
