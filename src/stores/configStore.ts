import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppConfig } from "@/lib/constants";
import { DEFAULT_CONFIG } from "@/lib/constants";

interface ConfigState {
  config: AppConfig;
  setConfig: (patch: Partial<AppConfig>) => void;
  loadConfig: (full: AppConfig) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: { ...DEFAULT_CONFIG },

      setConfig: (patch) =>
        set((state) => ({
          config: { ...state.config, ...patch },
        })),

      loadConfig: (full) => set({ config: full }),

      resetConfig: () => set({ config: { ...DEFAULT_CONFIG } }),
    }),
    {
      name: "touchvnc-config",
    },
  ),
);
