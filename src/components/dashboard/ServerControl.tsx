import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, RotateCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useServer } from "@/hooks/useServer";

function formatUptime(secs: number | null): string {
  if (secs === null) return "0s";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ServerControl() {
  const { running, uptimeSecs, start, stop, restart } = useServer();
  const [loading, setLoading] = useState<"start" | "stop" | "restart" | null>(null);

  async function handleAction(action: "start" | "stop" | "restart") {
    setLoading(action);
    try {
      if (action === "start") await start();
      else if (action === "stop") await stop();
      else await restart();
    } catch (err) {
      console.error(`Failed to ${action} server:`, err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "border border-surface-800/60",
        "bg-surface-900/60",
      )}
    >
      {/* Background glow based on status */}
      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-between gap-6">
        {/* Left: Status + Uptime */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {running && (
                <span className="absolute inset-0 animate-ping rounded-full bg-green-400/50" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-3 w-3 rounded-full",
                  running ? "bg-green-400" : "bg-red-400",
                )}
              />
            </span>
            <span className="text-lg font-semibold text-surface-100">
              Server {running ? "Running" : "Stopped"}
            </span>
          </div>
          {running && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pl-6 text-sm font-mono text-surface-400"
            >
              Uptime: {formatUptime(uptimeSecs)}
            </motion.p>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {running ? (
            <>
              <button
                onClick={() => handleAction("restart")}
                disabled={loading !== null}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-4",
                  "border border-surface-700/60 bg-surface-800/80",
                  "text-sm font-medium text-surface-300",
                  "transition-all hover:bg-surface-700/60 hover:text-surface-100",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {loading === "restart" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4" />
                )}
                Restart
              </button>
              <button
                onClick={() => handleAction("stop")}
                disabled={loading !== null}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-5",
                  "bg-red-500/15 border border-red-500/25",
                  "text-sm font-semibold text-red-400",
                  "transition-all hover:bg-red-500/25 hover:text-red-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {loading === "stop" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Stop
              </button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction("start")}
              disabled={loading !== null}
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-xl px-7",
                "bg-gradient-to-r from-accent-600 to-accent-500",
                "text-sm font-semibold text-white",
                "shadow-lg shadow-accent-500/20",
                "transition-all hover:shadow-accent-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading === "start" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              Start Server
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
