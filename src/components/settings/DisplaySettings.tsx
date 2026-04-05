import { MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import { RESOLUTION_PRESETS, MODE_OPTIONS } from "@/lib/constants";

export function DisplaySettings() {
  const { config, updateField } = useConfig();

  const isCustom = !RESOLUTION_PRESETS.some(
    (p) => p.width === config.width && p.height === config.height && p.width > 0,
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <MonitorSmartphone className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          Display
        </h3>
      </div>

      {/* Resolution presets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-surface-400">Resolution</label>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (preset.width > 0) {
                  updateField("width", preset.width);
                  updateField("height", preset.height);
                }
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium border transition-all",
                (preset.width > 0 && config.width === preset.width && config.height === preset.height) ||
                  (preset.width === 0 && isCustom)
                  ? "border-accent-500/50 bg-accent-500/10 text-accent-400"
                  : "border-surface-700/40 bg-surface-800/40 text-surface-400 hover:border-surface-600",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {isCustom && (
          <div className="flex gap-3 mt-1">
            <input
              type="number"
              value={config.width}
              onChange={(e) => updateField("width", Number(e.target.value))}
              placeholder="Width"
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-mono",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
            <span className="self-center text-surface-600">x</span>
            <input
              type="number"
              value={config.height}
              onChange={(e) => updateField("height", Number(e.target.value))}
              placeholder="Height"
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-mono",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </div>
        )}
      </div>

      {/* Mode selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-surface-400">Mode</label>
        <div className="flex flex-col gap-1.5">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateField("mode", opt.value)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-left border transition-all",
                config.mode === opt.value
                  ? "border-accent-500/40 bg-accent-500/8 text-accent-400"
                  : "border-surface-700/30 bg-surface-800/20 text-surface-400 hover:border-surface-600/40",
              )}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2",
                  config.mode === opt.value
                    ? "border-accent-500 bg-accent-500"
                    : "border-surface-600 bg-transparent",
                )}
              />
              <div>
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="ml-2 text-xs text-surface-500">{opt.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
