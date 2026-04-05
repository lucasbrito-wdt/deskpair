import { motion } from "framer-motion";
import { Monitor, ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/cn";

export function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 max-w-sm text-center"
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            "bg-accent-500/10 text-accent-400",
            "ring-1 ring-accent-500/20",
          )}
        >
          <Monitor className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-surface-100">Deskpair GNOME</h2>
          <p className="mt-1 text-sm text-surface-400">
            VNC server with multi-touch support for GNOME/Wayland.
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl px-5 py-3 text-xs font-mono text-surface-400",
            "border border-surface-800/50 bg-surface-900/50",
          )}
        >
          Version 0.1.0
        </div>

        <div className="flex items-center gap-4 text-surface-500">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs hover:text-surface-300 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>

        <p className="flex items-center gap-1 text-[11px] text-surface-600">
          Made with <Heart className="h-3 w-3 text-red-400/60" /> for the Linux community
        </p>
      </motion.div>
    </div>
  );
}
