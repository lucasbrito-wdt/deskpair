import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNetwork } from "@/hooks/useNetwork";

export function QRCodeCard() {
  const { qrData } = useNetwork();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl p-5",
        "border border-surface-800/60 bg-surface-900/60",
      )}
    >
      <div className="flex items-center gap-2 self-start text-surface-400">
        <QrCode className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Quick Connect</span>
      </div>

      <div
        className={cn(
          "flex items-center justify-center rounded-xl p-4",
          "bg-white",
        )}
      >
        <QRCodeSVG
          value={qrData}
          size={140}
          bgColor="#ffffff"
          fgColor="#0f0f12"
          level="M"
          includeMargin={false}
        />
      </div>

      <p className="text-[11px] text-surface-500 text-center">
        Scan with a VNC client app
      </p>
    </motion.div>
  );
}
