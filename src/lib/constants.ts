export const RESOLUTION_PRESETS = [
  { label: "1080p (Full HD)", width: 1920, height: 1080 },
  { label: "720p (HD)", width: 1280, height: 720 },
  { label: "iPad (Retina)", width: 2048, height: 1536 },
  { label: "iPad Mini", width: 1024, height: 768 },
  { label: "Galaxy Tab S9", width: 2560, height: 1600 },
  { label: "Custom", width: 0, height: 0 },
] as const;

export type ResolutionPreset = (typeof RESOLUTION_PRESETS)[number];

export const MODE_OPTIONS = [
  { value: "virtual", label: "Virtual", description: "Creates a virtual display" },
  { value: "mirror", label: "Mirror", description: "Mirrors your current screen" },
  { value: "test", label: "Test", description: "Test pattern output" },
] as const;

export type ModeOption = (typeof MODE_OPTIONS)[number];

export const ADDRESS_PRESETS = [
  { value: "0.0.0.0", label: "All interfaces (0.0.0.0)" },
  { value: "127.0.0.1", label: "Localhost only (127.0.0.1)" },
] as const;

export const LOG_LEVELS = [
  { value: "error", label: "Error" },
  { value: "warn", label: "Warning" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
  { value: "trace", label: "Trace" },
] as const;

export const GPU_MODES = [
  { value: "auto", label: "Auto", description: "Detect best GPU automatically" },
  { value: "on",   label: "Enabled", description: "Force GPU (DmaBuf) path" },
  { value: "off",  label: "Disabled", description: "Always use CPU (memcpy)" },
] as const;

export const DEFAULT_CONFIG = {
  address: "0.0.0.0",
  port: 5900,
  width: 1920,
  height: 1080,
  mode: "virtual",
  enableAuth: false,
  username: "",
  password: "",
  tlsEnabled: false,
  autostart: false,
  minimizeToTray: true,
  autoStartServer: false,
  binaryPath: "",
  extraArgs: "",
  logLevel: "info",
  enableTouch: true,
  enableMouse: true,
  enableKeyboard: true,
  /* Performance / GPU */
  gpuMode: "auto",
  drmDevice: "auto",
  fpsDefault: 144,
  fpsMax: 240,
  pwBuffers: 2,
  pwBuffersMin: 2,
  pwBuffersMax: 4,
} as const;

export type AppConfig = {
  address: string;
  port: number;
  width: number;
  height: number;
  mode: string;
  enableAuth: boolean;
  username: string;
  password: string;
  tlsEnabled: boolean;
  autostart: boolean;
  minimizeToTray: boolean;
  autoStartServer: boolean;
  binaryPath: string;
  extraArgs: string;
  logLevel: string;
  enableTouch: boolean;
  enableMouse: boolean;
  enableKeyboard: boolean;
  /* Performance / GPU */
  gpuMode: string;
  drmDevice: string;
  fpsDefault: number;
  fpsMax: number;
  pwBuffers: number;
  pwBuffersMin: number;
  pwBuffersMax: number;
};
