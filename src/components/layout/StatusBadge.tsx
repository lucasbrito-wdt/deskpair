import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type StatusVariant = "running" | "stopped" | "starting";

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<StatusVariant, { dot: string; text: string; label: string }> = {
  running: {
    dot: "bg-green-400",
    text: "text-green-400",
    label: "Running",
  },
  stopped: {
    dot: "bg-red-400",
    text: "text-red-400",
    label: "Stopped",
  },
  starting: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    label: "Starting...",
  },
};

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "bg-surface-900/80 border border-surface-700/50",
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {variant === "running" && (
          <motion.span
            className={cn("absolute inset-0 rounded-full", style.dot)}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", style.dot)} />
      </span>
      <span className={cn("text-xs font-medium", style.text)}>
        {label ?? style.label}
      </span>
    </div>
  );
}
