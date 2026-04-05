import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNetwork } from "@/hooks/useNetwork";

export function ConnectionInfo() {
  const { displayAddress, port, connectionUrl } = useNetwork();
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(connectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-5",
        "border border-surface-800/60 bg-surface-900/60",
      )}
    >
      <div className="flex items-center gap-2 text-surface-400">
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Connection</span>
      </div>

      {/* IP Address */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-surface-500 uppercase tracking-wider">Address</span>
        <span className="text-xl font-mono font-semibold text-surface-100 tracking-tight">
          {displayAddress}
        </span>
      </div>

      {/* Port */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-surface-500 uppercase tracking-wider">Port</span>
        <span className="text-xl font-mono font-semibold text-surface-100">
          {port}
        </span>
      </div>

      {/* Connection URL */}
      <div className="flex items-center gap-2 mt-1">
        <code
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-xs font-mono",
            "bg-surface-800/80 text-surface-300 border border-surface-700/40",
            "truncate",
          )}
        >
          {connectionUrl}
        </code>
        <button
          onClick={copyUrl}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            "border border-surface-700/50 bg-surface-800/60",
            "text-surface-400 transition-all",
            "hover:bg-surface-700/60 hover:text-surface-200",
          )}
          title="Copy connection URL"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}
