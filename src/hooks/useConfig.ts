import { useConfigStore } from "@/stores/configStore";
import type { AppConfig } from "@/lib/constants";

export function useConfig() {
  const config = useConfigStore((s) => s.config);
  const setConfig = useConfigStore((s) => s.setConfig);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const resetConfig = useConfigStore((s) => s.resetConfig);

  const updateField = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig({ [key]: value });
  };

  return {
    config,
    setConfig,
    loadConfig,
    resetConfig,
    updateField,
  };
}
