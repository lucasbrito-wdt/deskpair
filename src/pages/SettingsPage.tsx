import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { DisplaySettings } from "@/components/settings/DisplaySettings";
import { NetworkSettings } from "@/components/settings/NetworkSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { InputSettings } from "@/components/settings/InputSettings";
import { AdvancedSettings } from "@/components/settings/AdvancedSettings";
import { SystemSettings } from "@/components/settings/SystemSettings";
import { useServerStore } from "@/stores/serverStore";
import { useServer } from "@/hooks/useServer";

export function SettingsPage() {
  const running = useServerStore((s) => s.running);
  const { restart } = useServer();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // Config is already persisted via zustand persist middleware
    // Simulate a brief save confirmation
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);
  }

  async function handleApplyRestart() {
    setSaving(true);
    try {
      await restart();
    } catch (err) {
      console.error("Restart failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-8 max-w-2xl"
        >
          <DisplaySettings />
          <NetworkSettings />
          <SecuritySettings />
          <InputSettings />
          <SystemSettings />
          <AdvancedSettings />
        </motion.div>
      </div>

      {/* Save bar */}
      <div
        className={cn(
          "flex items-center justify-end gap-3 px-6 py-4",
          "border-t border-surface-800/40 bg-surface-950/80",
        )}
      >
        {running && (
          <button
            onClick={handleApplyRestart}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
              "border border-amber-500/30 bg-amber-500/10 text-amber-400",
              "hover:bg-amber-500/15 disabled:opacity-50",
            )}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
            Apply & Restart
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold",
            "bg-gradient-to-r from-accent-600 to-accent-500 text-white",
            "shadow-lg shadow-accent-500/15",
            "disabled:opacity-50",
          )}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}
