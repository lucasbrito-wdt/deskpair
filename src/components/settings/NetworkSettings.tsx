import { Network } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import { ADDRESS_PRESETS } from "@/lib/constants";

export function NetworkSettings() {
  const { config, updateField } = useConfig();

  const isCustomAddress = !ADDRESS_PRESETS.some((a) => a.value === config.address);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          Network
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-surface-400">Bind Address</label>
          <select
            value={isCustomAddress ? "custom" : config.address}
            onChange={(e) => {
              if (e.target.value !== "custom") {
                updateField("address", e.target.value);
              }
            }}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm",
              "bg-surface-800/60 border border-surface-700/40 text-surface-200",
              "focus:outline-none focus:border-accent-500/50",
            )}
          >
            {ADDRESS_PRESETS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {isCustomAddress && (
            <input
              type="text"
              value={config.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="e.g., 192.168.1.100"
              className={cn(
                "mt-1 rounded-lg px-3 py-2 text-sm font-mono",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          )}
        </div>

        {/* Port */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-surface-400">Port</label>
          <input
            type="number"
            value={config.port}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 65535) {
                updateField("port", val);
              }
            }}
            min={1}
            max={65535}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-mono",
              "bg-surface-800/60 border border-surface-700/40 text-surface-200",
              "focus:outline-none focus:border-accent-500/50",
            )}
          />
          <span className="text-[10px] text-surface-600">Range: 1-65535</span>
        </div>
      </div>
    </section>
  );
}
