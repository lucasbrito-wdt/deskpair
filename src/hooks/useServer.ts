import { useEffect, useCallback, useRef } from "react";
import { useServerStore } from "@/stores/serverStore";
import { useConfigStore } from "@/stores/configStore";
import {
  startServer,
  stopServer,
  restartServer,
  getServerStatus,
  getServerLogs,
  onServerLog,
  onServerStatus,
  type ServerConfig,
} from "@/lib/tauri";

function buildServerConfig(config: ReturnType<typeof useConfigStore.getState>["config"]): ServerConfig {
  return {
    address: config.address,
    port: config.port,
    width: config.width,
    height: config.height,
    mode: config.mode,
    binary_path: config.binaryPath,
    extra_args: config.extraArgs ? config.extraArgs.split("\n").filter(Boolean) : [],
  };
}

export function useServer() {
  const store = useServerStore();
  const config = useConfigStore((s) => s.config);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    async function setup() {
      // Load initial state
      try {
        const status = await getServerStatus();
        store.setStatus(status);
      } catch {
        /* backend not ready yet */
      }

      try {
        const logs = await getServerLogs();
        store.setLogs(logs);
      } catch {
        /* ok */
      }

      // Listen for real-time events
      const unLog = await onServerLog((line) => {
        store.addLog(line);
      });
      unlisteners.push(unLog);

      const unStatus = await onServerStatus((status) => {
        store.setStatus(status);
      });
      unlisteners.push(unStatus);
    }

    setup();

    // Poll uptime every second when running
    pollRef.current = setInterval(async () => {
      const { running } = useServerStore.getState();
      if (running) {
        try {
          const status = await getServerStatus();
          useServerStore.getState().setUptimeSecs(status.uptime_secs);
        } catch {
          /* ignore */
        }
      }
    }, 1000);

    return () => {
      unlisteners.forEach((fn) => fn());
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async () => {
    const cfg = buildServerConfig(useConfigStore.getState().config);
    await startServer(cfg);
  }, []);

  const stop = useCallback(async () => {
    await stopServer();
  }, []);

  const restart = useCallback(async () => {
    const cfg = buildServerConfig(useConfigStore.getState().config);
    await restartServer(cfg);
  }, []);

  return {
    running: store.running,
    pid: store.pid,
    uptimeSecs: store.uptimeSecs,
    logs: store.logs,
    clients: store.clients,
    start,
    stop,
    restart,
    clearLogs: store.clearLogs,
    config,
  };
}
