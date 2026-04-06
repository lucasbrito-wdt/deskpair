import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { AppConfig } from "@/lib/constants";

// --- Types matching Rust structs ---

export interface ServerConfig {
  address: string;
  port: number;
  width: number;
  height: number;
  mode: string;
  binary_path: string;
  extra_args: string[];
}

export interface ServerStatus {
  running: boolean;
  pid: number | null;
  uptime_secs: number | null;
}

export interface SystemInfo {
  os: string;
  session_type: string;
  gpu: string;
}

export interface GpuInfo {
  name: string;
  path: string;
  vendor_id: string;
  is_preferred: boolean;
}

export interface DependencyStatus {
  name: string;
  installed: boolean;
  package_name: string;
}

// --- Server Commands ---

export async function startServer(config: ServerConfig): Promise<void> {
  await invoke("start_server", { config });
}

export async function stopServer(): Promise<void> {
  await invoke("stop_server");
}

export async function restartServer(config: ServerConfig): Promise<void> {
  await invoke("restart_server", { config });
}

export async function getServerStatus(): Promise<ServerStatus> {
  return await invoke<ServerStatus>("get_server_status");
}

export async function getServerLogs(): Promise<string[]> {
  return await invoke<string[]>("get_server_logs");
}

// --- Installation / Wizard Commands ---

export async function checkInstallation(): Promise<boolean> {
  try {
    return await invoke<boolean>("check_installation");
  } catch {
    return false;
  }
}

export async function needsOnboarding(): Promise<boolean> {
  try {
    return await invoke<boolean>("needs_onboarding");
  } catch {
    return true; // If we can't check, show onboarding
  }
}

export async function completeOnboarding(): Promise<void> {
  await invoke("complete_onboarding");
}

export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    return await invoke<SystemInfo>("check_system_info");
  } catch {
    return { os: "Unknown", session_type: "Unknown", gpu: "Unknown" };
  }
}

export async function listGpus(): Promise<GpuInfo[]> {
  try {
    return await invoke<GpuInfo[]>("list_gpus");
  } catch (err) {
    console.error("list_gpus failed:", err);
    return [];
  }
}

export async function checkDependencies(): Promise<DependencyStatus[]> {
  try {
    return await invoke<DependencyStatus[]>("check_dependencies");
  } catch {
    return [];
  }
}

export async function installDependencies(): Promise<void> {
  await invoke("install_dependencies");
}

export async function getLocalIp(): Promise<string> {
  try {
    return await invoke<string>("get_local_ip");
  } catch {
    return "127.0.0.1";
  }
}

// --- TLS / Security ---

export async function generateTlsCerts(): Promise<{ cert: string; key: string }> {
  return await invoke("generate_tls_cert");
}

export async function generateRsaKey(): Promise<string> {
  return await invoke("generate_rsa_key");
}

// --- Config ---

/** Load saved config from config.toml and map snake_case → camelCase. */
export async function loadConfig(): Promise<AppConfig | null> {
  try {
    const raw = await invoke<Record<string, unknown>>("load_config");
    return {
      address:        raw.address as string,
      port:           raw.port as number,
      width:          raw.width as number,
      height:         raw.height as number,
      mode:           raw.mode as string,
      enableAuth:     raw.enable_auth as boolean,
      username:       raw.username as string,
      password:       raw.password as string,
      tlsEnabled:     raw.tls_enabled as boolean,
      autostart:      raw.autostart as boolean,
      minimizeToTray: raw.minimize_to_tray as boolean,
      autoStartServer: false,
      binaryPath:     raw.binary_path as string,
      extraArgs:      "",
      logLevel:       "info",
      enableTouch:    true,
      enableMouse:    true,
      enableKeyboard: true,
      gpuMode:        (raw.gpu_mode as string) ?? "auto",
      drmDevice:      (raw.drm_device as string) ?? "auto",
      fpsDefault:     (raw.fps_default as number) ?? 144,
      fpsMax:         (raw.fps_max as number) ?? 240,
      pwBuffers:      (raw.pw_buffers as number) ?? 2,
      pwBuffersMin:   (raw.pw_buffers_min as number) ?? 2,
      pwBuffersMax:   (raw.pw_buffers_max as number) ?? 4,
    };
  } catch {
    return null;
  }
}

/** Persist config to disk (writes config.toml + config.ini for the backend). */
export async function saveConfig(config: AppConfig): Promise<void> {
  await invoke("save_config", {
    config: {
      address:          config.address,
      port:             config.port,
      width:            config.width,
      height:           config.height,
      mode:             config.mode,
      enable_auth:      config.enableAuth,
      username:         config.username,
      password:         config.password,
      tls_enabled:      config.tlsEnabled,
      tls_cert_path:    "",
      tls_key_path:     "",
      rsa_key_path:     "",
      autostart:        config.autostart,
      minimize_to_tray: config.minimizeToTray,
      binary_path:      config.binaryPath,
      onboarding_complete: true,
      gpu_mode:         config.gpuMode,
      drm_device:       config.drmDevice,
      fps_default:      config.fpsDefault,
      fps_max:          config.fpsMax,
      pw_buffers:       config.pwBuffers,
      pw_buffers_min:   config.pwBuffersMin,
      pw_buffers_max:   config.pwBuffersMax,
    },
  });
}

// --- Event Listeners ---

export function onServerLog(callback: (line: string) => void): Promise<UnlistenFn> {
  return listen<string>("server-log", (event) => {
    callback(event.payload);
  });
}

export function onServerStatus(callback: (status: ServerStatus) => void): Promise<UnlistenFn> {
  return listen<ServerStatus>("server-status", (event) => {
    callback(event.payload);
  });
}

