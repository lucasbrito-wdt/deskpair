import { create } from "zustand";

export interface ConnectedClient {
  id: string;
  address: string;
  connectedAt: number;
}

interface ServerState {
  running: boolean;
  pid: number | null;
  uptimeSecs: number | null;
  logs: string[];
  clients: ConnectedClient[];

  setRunning: (running: boolean) => void;
  setPid: (pid: number | null) => void;
  setUptimeSecs: (secs: number | null) => void;
  addLog: (line: string) => void;
  setLogs: (logs: string[]) => void;
  clearLogs: () => void;
  setClients: (clients: ConnectedClient[]) => void;
  setStatus: (status: { running: boolean; pid: number | null; uptime_secs: number | null }) => void;
}

const MAX_LOG_LINES = 5000;

export const useServerStore = create<ServerState>((set) => ({
  running: false,
  pid: null,
  uptimeSecs: null,
  logs: [],
  clients: [],

  setRunning: (running) => set({ running }),
  setPid: (pid) => set({ pid }),
  setUptimeSecs: (secs) => set({ uptimeSecs: secs }),

  addLog: (line) =>
    set((state) => {
      const next = [...state.logs, line];
      if (next.length > MAX_LOG_LINES) {
        return { logs: next.slice(next.length - MAX_LOG_LINES) };
      }
      return { logs: next };
    }),

  setLogs: (logs) => set({ logs }),
  clearLogs: () => set({ logs: [] }),
  setClients: (clients) => set({ clients }),

  setStatus: (status) =>
    set({
      running: status.running,
      pid: status.pid,
      uptimeSecs: status.uptime_secs,
    }),
}));
