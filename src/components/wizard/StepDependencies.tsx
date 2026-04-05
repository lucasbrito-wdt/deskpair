import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Download, Monitor, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  getSystemInfo,
  checkDependencies,
  installDependencies,
  type SystemInfo,
  type DependencyStatus,
} from "@/lib/tauri";

interface StepDependenciesProps {
  onReady: (ready: boolean) => void;
}

export function StepDependencies({ onReady }: StepDependenciesProps) {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [deps, setDeps] = useState<DependencyStatus[]>([]);
  const [checking, setChecking] = useState(true);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    async function check() {
      setChecking(true);
      const [info, depList] = await Promise.all([getSystemInfo(), checkDependencies()]);
      setSysInfo(info);
      setDeps(depList);
      setChecking(false);
      onReady(depList.length === 0 || depList.every((d) => d.installed));
    }
    check();
  }, [onReady]);

  async function handleInstall() {
    setInstalling(true);
    try {
      await installDependencies();
      const depList = await checkDependencies();
      setDeps(depList);
      onReady(depList.every((d) => d.installed));
    } catch (err) {
      console.error("Install failed:", err);
    } finally {
      setInstalling(false);
    }
  }

  const allInstalled = deps.length > 0 && deps.every((d) => d.installed);
  const hasMissing = deps.some((d) => !d.installed);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-surface-100">System Check</h2>
        <p className="mt-1 text-sm text-surface-400">
          Verifying your system meets the requirements.
        </p>
      </div>

      {/* System info */}
      {sysInfo && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Monitor, label: "OS", value: sysInfo.os },
            { icon: Layers, label: "Session", value: sysInfo.session_type },
            { icon: Cpu, label: "GPU", value: sysInfo.gpu },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl p-3.5",
                "border border-surface-800/50 bg-surface-800/30",
              )}
            >
              <div className="flex items-center gap-1.5 text-surface-500">
                <item.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-surface-200 truncate">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dependencies list */}
      <div
        className={cn(
          "rounded-xl border border-surface-800/50 overflow-hidden",
          "divide-y divide-surface-800/30",
        )}
      >
        {checking ? (
          <div className="flex items-center justify-center gap-2 py-10 text-surface-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking dependencies...</span>
          </div>
        ) : deps.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-surface-400">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm">All dependencies are satisfied.</span>
          </div>
        ) : (
          deps.map((dep, i) => (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              {dep.installed ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span className="text-sm font-medium text-surface-200">{dep.name}</span>
              {!dep.installed && dep.package_name && (
                <span className="text-xs font-mono text-surface-500">({dep.package_name})</span>
              )}
              <span
                className={cn(
                  "ml-auto text-[10px] font-medium uppercase tracking-wider",
                  dep.installed ? "text-green-400/70" : "text-red-400/70",
                )}
              >
                {dep.installed ? "Installed" : "Missing"}
              </span>
            </motion.div>
          ))
        )}
      </div>

      {/* Install button */}
      {hasMissing && !allInstalled && (
        <button
          onClick={handleInstall}
          disabled={installing}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold",
            "bg-gradient-to-r from-accent-600 to-accent-500 text-white",
            "shadow-lg shadow-accent-500/15",
            "disabled:opacity-50",
          )}
        >
          {installing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {installing ? "Installing..." : "Install Missing Dependencies"}
        </button>
      )}
    </div>
  );
}
