import { useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNetwork } from "@/hooks/useNetwork";
import { completeOnboarding } from "@/lib/tauri";

interface StepCompleteProps {
  onOpenDashboard: () => void;
}

export function StepComplete({ onOpenDashboard }: StepCompleteProps) {
  const { connectionUrl, qrData, displayAddress, port } = useNetwork();

  useEffect(() => {
    completeOnboarding().catch(console.error);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full",
          "bg-green-500/10 ring-2 ring-green-500/20",
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
        >
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-surface-100">All Set!</h2>
        <p className="mt-2 text-sm text-surface-400">
          Deskpair is ready. Connect from any VNC client.
        </p>
      </motion.div>

      {/* Connection info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl p-6 w-full max-w-sm",
          "border border-surface-800/50 bg-surface-900/50",
        )}
      >
        <div className="bg-white rounded-xl p-3">
          <QRCodeSVG
            value={qrData}
            size={120}
            bgColor="#ffffff"
            fgColor="#0f0f12"
            level="M"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-mono font-semibold text-surface-100">
            {displayAddress}:{port}
          </span>
          <code className="text-xs font-mono text-surface-500">
            {connectionUrl}
          </code>
        </div>
      </motion.div>

      {/* Open Dashboard */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenDashboard}
        className={cn(
          "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold",
          "bg-gradient-to-r from-accent-600 to-accent-500 text-white",
          "shadow-lg shadow-accent-500/20",
        )}
      >
        Open Dashboard
        <ExternalLink className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
