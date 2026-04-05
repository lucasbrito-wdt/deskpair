import { Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";

export function SystemSettings() {
  const { config, updateField } = useConfig();

  const toggles = [
    {
      key: "autostart" as const,
      label: "Start on Login",
      description: "Launch Deskpair when you log in",
    },
    {
      key: "autoStartServer" as const,
      label: "Auto-start Server",
      description: "Start the VNC server when the app opens",
    },
    {
      key: "minimizeToTray" as const,
      label: "Minimize to Tray",
      description: "Keep running in the system tray when closed",
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          System
        </h3>
      </div>

      <div className="flex flex-col divide-y divide-surface-800/30">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm text-surface-200">{t.label}</span>
              <p className="text-xs text-surface-500 mt-0.5">{t.description}</p>
            </div>
            <button
              onClick={() => updateField(t.key, !config[t.key])}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                config[t.key] ? "bg-accent-500" : "bg-surface-700",
              )}
              role="switch"
              aria-checked={config[t.key] as boolean}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  config[t.key] ? "translate-x-5.5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
