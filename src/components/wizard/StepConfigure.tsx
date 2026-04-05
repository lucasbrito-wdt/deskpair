import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import { RESOLUTION_PRESETS, MODE_OPTIONS, ADDRESS_PRESETS } from "@/lib/constants";

interface StepConfigureProps {
  onReady: (ready: boolean) => void;
}

export function StepConfigure({ onReady }: StepConfigureProps) {
  const { config, updateField } = useConfig();

  useEffect(() => {
    onReady(config.port > 0 && config.width > 0 && config.height > 0);
  }, [onReady, config.port, config.width, config.height]);

  const isCustomResolution = !RESOLUTION_PRESETS.some(
    (p) => p.width === config.width && p.height === config.height && p.width !== 0,
  );

  function handlePresetChange(value: string) {
    const preset = RESOLUTION_PRESETS.find((p) => p.label === value);
    if (preset && preset.width > 0) {
      updateField("width", preset.width);
      updateField("height", preset.height);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-surface-100">Configuration</h2>
        <p className="mt-1 text-sm text-surface-400">
          Set up your VNC server preferences.
        </p>
      </div>

      {/* Resolution */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-surface-400 mb-2">
          Resolution
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTION_PRESETS.filter((p) => p.width > 0).map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetChange(preset.label)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-xs font-medium",
                "border transition-all",
                config.width === preset.width && config.height === preset.height
                  ? "border-accent-500/50 bg-accent-500/10 text-accent-400"
                  : "border-surface-700/40 bg-surface-800/40 text-surface-400 hover:border-surface-600/50",
              )}
            >
              <span className="block font-semibold">{preset.label}</span>
              <span className="block text-[10px] opacity-70 font-mono mt-0.5">
                {preset.width}x{preset.height}
              </span>
            </button>
          ))}
        </div>

        {/* Custom resolution fields */}
        {isCustomResolution && (
          <div className="flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] text-surface-500 uppercase tracking-wider">Width</span>
              <input
                type="number"
                value={config.width}
                onChange={(e) => updateField("width", Number(e.target.value))}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-mono",
                  "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                  "focus:outline-none focus:border-accent-500/50",
                )}
              />
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] text-surface-500 uppercase tracking-wider">Height</span>
              <input
                type="number"
                value={config.height}
                onChange={(e) => updateField("height", Number(e.target.value))}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-mono",
                  "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                  "focus:outline-none focus:border-accent-500/50",
                )}
              />
            </label>
          </div>
        )}
      </fieldset>

      {/* Mode */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-medium uppercase tracking-wider text-surface-400 mb-2">
          Display Mode
        </legend>
        <div className="flex flex-col gap-2">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateField("mode", opt.value)}
              className={cn(
                "flex flex-col rounded-lg px-4 py-3 text-left",
                "border transition-all",
                config.mode === opt.value
                  ? "border-accent-500/50 bg-accent-500/10"
                  : "border-surface-700/40 bg-surface-800/30 hover:border-surface-600/50",
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  config.mode === opt.value ? "text-accent-400" : "text-surface-200",
                )}
              >
                {opt.label}
              </span>
              <span className="text-xs text-surface-500 mt-0.5">{opt.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Port & Address */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-surface-400">Port</span>
          <input
            type="number"
            value={config.port}
            onChange={(e) => updateField("port", Number(e.target.value))}
            min={1}
            max={65535}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-mono",
              "bg-surface-800/60 border border-surface-700/40 text-surface-200",
              "focus:outline-none focus:border-accent-500/50",
            )}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-surface-400">Address</span>
          <select
            value={ADDRESS_PRESETS.find((a) => a.value === config.address) ? config.address : "custom"}
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
        </label>
      </div>
    </div>
  );
}
