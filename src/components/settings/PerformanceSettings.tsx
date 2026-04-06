import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import { GPU_MODES } from "@/lib/constants";
import { listGpus, type GpuInfo } from "@/lib/tauri";

export function PerformanceSettings() {
  const { config, updateField } = useConfig();
  const [detectedGpus, setDetectedGpus] = useState<GpuInfo[]>([]);
  const [gpuScanDone, setGpuScanDone] = useState(false);

  useEffect(() => {
    listGpus().then((gpus) => {
      setDetectedGpus(gpus);
      setGpuScanDone(true);
    });
  }, []);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          Performance
        </h3>
      </div>

      {/* GPU mode */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">GPU Acceleration</span>
        <div className="grid grid-cols-3 gap-2">
          {GPU_MODES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateField("gpuMode", opt.value)}
              className={cn(
                "flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left text-xs",
                "border transition-colors",
                config.gpuMode === opt.value
                  ? "border-accent-500/50 bg-accent-500/10 text-accent-300"
                  : "border-surface-700/40 bg-surface-800/60 text-surface-400 hover:border-surface-600/50",
              )}
            >
              <span className="font-medium text-[11px] uppercase tracking-wide">
                {opt.label}
              </span>
              <span className="text-[10px] opacity-70">{opt.description}</span>
            </button>
          ))}
        </div>
        <span className="text-[10px] text-surface-600">
          GPU path uses DmaBuf (zero-copy). Detected:{" "}
          {!gpuScanDone
            ? "scanning…"
            : detectedGpus.length > 0
            ? detectedGpus.map((g) => g.name).join(", ")
            : "none detected"}
        </span>
      </div>

      {/* DRM device */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">DRM Device</span>

        {detectedGpus.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => updateField("drmDevice", "auto")}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-xs border transition-colors",
                config.drmDevice === "auto"
                  ? "border-accent-500/50 bg-accent-500/10 text-accent-300"
                  : "border-surface-700/40 bg-surface-800/60 text-surface-400 hover:border-surface-600/50",
              )}
            >
              <span className="font-medium">Auto (recommended)</span>
              <span className="opacity-60">NVIDIA &gt; AMD &gt; Intel</span>
            </button>
            {detectedGpus.map((gpu) => (
              <button
                key={gpu.path}
                onClick={() => updateField("drmDevice", gpu.path)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs border transition-colors",
                  config.drmDevice === gpu.path
                    ? "border-accent-500/50 bg-accent-500/10 text-accent-300"
                    : "border-surface-700/40 bg-surface-800/60 text-surface-400 hover:border-surface-600/50",
                )}
              >
                <span className="font-medium font-mono">
                  {gpu.name}
                  {gpu.is_preferred && (
                    <span className="ml-1.5 text-[10px] text-green-400 font-normal">preferred</span>
                  )}
                </span>
                <span className="opacity-60 font-mono">{gpu.path}</span>
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          value={config.drmDevice}
          onChange={(e) => updateField("drmDevice", e.target.value)}
          placeholder="auto"
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-mono",
            "bg-surface-800/60 border border-surface-700/40 text-surface-200",
            "placeholder:text-surface-600",
            "focus:outline-none focus:border-accent-500/50",
          )}
        />
        <span className="text-[10px] text-surface-600">
          <code>auto</code> scans for the best GPU (NVIDIA &gt; AMD &gt; Intel).
          Override with a path like <code>/dev/dri/renderD128</code> if needed.
        </span>
      </div>

      {/* FPS */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">Framerate</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-surface-500">Target FPS</span>
            <input
              type="number"
              min={1}
              max={config.fpsMax}
              value={config.fpsDefault}
              onChange={(e) =>
                updateField("fpsDefault", Math.max(1, Number(e.target.value)))
              }
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-surface-500">Max FPS</span>
            <input
              type="number"
              min={config.fpsDefault}
              max={360}
              value={config.fpsMax}
              onChange={(e) =>
                updateField("fpsMax", Math.max(config.fpsDefault, Number(e.target.value)))
              }
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
        </div>
        <span className="text-[10px] text-surface-600">
          Negotiated with PipeWire. Actual FPS depends on the compositor refresh rate.
        </span>
      </div>

      {/* PipeWire buffers */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-surface-400">PipeWire Buffers</span>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-surface-500">Default</span>
            <input
              type="number"
              min={2}
              max={config.pwBuffersMax}
              value={config.pwBuffers}
              onChange={(e) =>
                updateField("pwBuffers", Math.max(2, Number(e.target.value)))
              }
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-surface-500">Min</span>
            <input
              type="number"
              min={2}
              max={config.pwBuffers}
              value={config.pwBuffersMin}
              onChange={(e) =>
                updateField("pwBuffersMin", Math.max(2, Number(e.target.value)))
              }
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-surface-500">Max</span>
            <input
              type="number"
              min={config.pwBuffers}
              max={64}
              value={config.pwBuffersMax}
              onChange={(e) =>
                updateField("pwBuffersMax", Math.max(config.pwBuffers, Number(e.target.value)))
              }
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
        </div>
        <span className="text-[10px] text-surface-600">
          Lower = less latency. Default of 2 gives minimum lag; increase if frames drop.
        </span>
      </div>
    </section>
  );
}
