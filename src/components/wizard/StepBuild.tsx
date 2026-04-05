import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Hammer, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { buildProject, onBuildProgress, type BuildProgress } from "@/lib/tauri";

interface StepBuildProps {
  onReady: (ready: boolean) => void;
}

export function StepBuild({ onReady }: StepBuildProps) {
  const [status, setStatus] = useState<"idle" | "building" | "done" | "error">("idle");
  const [progress, setProgress] = useState<BuildProgress | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    onBuildProgress((p) => {
      setProgress(p);
      setLines((prev) => [...prev, `[${p.stage}] ${p.message}`]);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  async function handleBuild() {
    setStatus("building");
    setLines([]);
    setProgress(null);
    try {
      await buildProject();
      setStatus("done");
      onReady(true);
    } catch (err) {
      setStatus("error");
      setLines((prev) => [...prev, `ERROR: ${err}`]);
      onReady(false);
    }
  }

  const percent = progress?.percent ?? 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-xl font-semibold text-surface-100">Build Server</h2>
        <p className="mt-1 text-sm text-surface-400">
          Compile touchvnc-gnome from source.
        </p>
      </div>

      {/* Progress bar */}
      {status !== "idle" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-surface-400">
            <span>{progress?.stage ?? "Preparing..."}</span>
            <span className="font-mono">{Math.round(percent)}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-800/60 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                status === "error"
                  ? "bg-red-500"
                  : status === "done"
                    ? "bg-green-500"
                    : "bg-accent-500",
              )}
              initial={{ width: "0%" }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Terminal output */}
      <div
        ref={termRef}
        className={cn(
          "flex-1 min-h-[200px] max-h-[340px] overflow-y-auto rounded-xl p-4",
          "bg-surface-950 border border-surface-800/40",
          "font-mono text-xs leading-relaxed",
        )}
      >
        {lines.length === 0 ? (
          <span className="text-surface-600">Build output will appear here...</span>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap",
                line.startsWith("ERROR") ? "text-red-400" : "text-surface-400",
              )}
            >
              {line}
            </div>
          ))
        )}
      </div>

      {/* Build button / status */}
      {status === "idle" && (
        <button
          onClick={handleBuild}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold",
            "bg-gradient-to-r from-accent-600 to-accent-500 text-white",
            "shadow-lg shadow-accent-500/15",
          )}
        >
          <Hammer className="h-4 w-4" />
          Start Build
        </button>
      )}
      {status === "building" && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-surface-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Building...
        </div>
      )}
      {status === "done" && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Build complete!
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <XCircle className="h-4 w-4" />
            Build failed
          </div>
          <button
            onClick={handleBuild}
            className="text-xs text-accent-400 hover:underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
