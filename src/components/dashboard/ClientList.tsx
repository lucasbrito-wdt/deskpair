import { motion } from "framer-motion";
import { Users, Wifi } from "lucide-react";
import { cn } from "@/lib/cn";
import { useServerStore } from "@/stores/serverStore";

export function ClientList() {
  const clients = useServerStore((s) => s.clients);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        "flex flex-col rounded-2xl",
        "border border-surface-800/60 bg-surface-900/60",
      )}
    >
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-800/40">
        <Users className="h-4 w-4 text-surface-400" />
        <span className="text-xs font-medium uppercase tracking-wider text-surface-400">
          Connected Clients
        </span>
        <span
          className={cn(
            "ml-auto text-[10px] font-mono font-semibold rounded-full px-2 py-0.5",
            "bg-surface-800/80 text-surface-500",
          )}
        >
          {clients.length}
        </span>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-surface-500">
          <Wifi className="h-6 w-6 opacity-40" />
          <p className="text-xs">No clients connected</p>
        </div>
      ) : (
        <ul className="divide-y divide-surface-800/30">
          {clients.map((client) => (
            <li key={client.id} className="flex items-center gap-3 px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm font-mono text-surface-200">{client.address}</span>
              <span className="ml-auto text-[10px] text-surface-500">
                {new Date(client.connectedAt).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
