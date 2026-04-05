import { useLocation } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { useServerStore } from "@/stores/serverStore";
import { cn } from "@/lib/cn";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/settings": "Settings",
  "/logs": "Logs",
  "/about": "About",
};

export function Header() {
  const location = useLocation();
  const running = useServerStore((s) => s.running);
  const title = PAGE_TITLES[location.pathname] ?? "Deskpair";

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between",
        "border-b border-surface-800/40 px-6",
        "bg-surface-950/50",
      )}
    >
      <h1 className="text-base font-semibold text-surface-100 tracking-tight">
        {title}
      </h1>
      <StatusBadge variant={running ? "running" : "stopped"} />
    </header>
  );
}
