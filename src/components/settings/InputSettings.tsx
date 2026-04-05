import { Hand, Mouse, Keyboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import type { AppConfig } from "@/lib/constants";

interface ToggleRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-surface-500" />
        <div>
          <span className="text-sm text-surface-200">{label}</span>
          <p className="text-xs text-surface-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-accent-500" : "bg-surface-700",
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function InputSettings() {
  const { config, updateField } = useConfig();

  const toggles: Array<{ icon: typeof Hand; label: string; description: string; key: keyof AppConfig }> = [
    { icon: Hand, label: "Touch Input", description: "Forward touch events to clients", key: "enableTouch" },
    { icon: Mouse, label: "Mouse Input", description: "Forward mouse events to clients", key: "enableMouse" },
    { icon: Keyboard, label: "Keyboard Input", description: "Forward keyboard events to clients", key: "enableKeyboard" },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Hand className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          Input
        </h3>
      </div>
      <div className="flex flex-col divide-y divide-surface-800/30">
        {toggles.map((t) => (
          <ToggleRow
            key={t.key}
            icon={t.icon}
            label={t.label}
            description={t.description}
            checked={config[t.key] as boolean}
            onChange={() => updateField(t.key, !config[t.key])}
          />
        ))}
      </div>
    </section>
  );
}
