import { motion } from "framer-motion";
import { Clock, MonitorSmartphone, Cpu, Network } from "lucide-react";
import { cn } from "@/lib/cn";
import { useServer } from "@/hooks/useServer";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 + delay }}
      className={cn(
        "flex flex-col gap-2 rounded-xl p-4",
        "border border-surface-800/50 bg-surface-900/50",
      )}
    >
      <div className="flex items-center gap-2 text-surface-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-base font-semibold font-mono text-surface-200 tracking-tight">
        {value}
      </span>
    </motion.div>
  );
}

function formatUptime(secs: number | null): string {
  if (secs === null) return "--";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function StatsCards() {
  const { running, uptimeSecs, config } = useServer();

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={Clock}
        label="Uptime"
        value={running ? formatUptime(uptimeSecs) : "--"}
        delay={0}
      />
      <StatCard
        icon={MonitorSmartphone}
        label="Resolution"
        value={`${config.width}x${config.height}`}
        delay={0.04}
      />
      <StatCard
        icon={Cpu}
        label="Mode"
        value={config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}
        delay={0.08}
      />
      <StatCard
        icon={Network}
        label="Port"
        value={String(config.port)}
        delay={0.12}
      />
    </div>
  );
}
