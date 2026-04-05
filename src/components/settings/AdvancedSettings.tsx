import { Wrench } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import { LOG_LEVELS } from "@/lib/constants";

export function AdvancedSettings() {
  const { config, updateField } = useConfig();

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          Advanced
        </h3>
      </div>

      {/* Binary path */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">Binary Path</span>
        <input
          type="text"
          value={config.binaryPath}
          onChange={(e) => updateField("binaryPath", e.target.value)}
          placeholder="Auto-detect (leave empty)"
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-mono",
            "bg-surface-800/60 border border-surface-700/40 text-surface-200",
            "placeholder:text-surface-600",
            "focus:outline-none focus:border-accent-500/50",
          )}
        />
        <span className="text-[10px] text-surface-600">
          Leave empty to auto-detect from PATH
        </span>
      </label>

      {/* Extra arguments */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">Extra CLI Arguments</span>
        <textarea
          value={config.extraArgs}
          onChange={(e) => updateField("extraArgs", e.target.value)}
          placeholder="One argument per line"
          rows={3}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-mono resize-none",
            "bg-surface-800/60 border border-surface-700/40 text-surface-200",
            "placeholder:text-surface-600",
            "focus:outline-none focus:border-accent-500/50",
          )}
        />
      </label>

      {/* Log level */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">Log Level</span>
        <select
          value={config.logLevel}
          onChange={(e) => updateField("logLevel", e.target.value)}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm",
            "bg-surface-800/60 border border-surface-700/40 text-surface-200",
            "focus:outline-none focus:border-accent-500/50",
          )}
        >
          {LOG_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
      </label>
    </section>
  );
}
