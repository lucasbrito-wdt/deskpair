import { useEffect, useState } from "react";
import { useConfigStore } from "@/stores/configStore";
import { getLocalIp } from "@/lib/tauri";

export function useNetwork() {
  const [localIp, setLocalIp] = useState("127.0.0.1");
  const config = useConfigStore((s) => s.config);

  useEffect(() => {
    getLocalIp().then(setLocalIp).catch(() => setLocalIp("127.0.0.1"));
  }, []);

  const displayAddress = config.address === "0.0.0.0" ? localIp : config.address;
  const connectionUrl = `vnc://${displayAddress}:${config.port}`;
  const qrData = connectionUrl;

  return {
    localIp,
    displayAddress,
    connectionUrl,
    qrData,
    port: config.port,
  };
}
