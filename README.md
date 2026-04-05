<div align="center">
  <img src="src-tauri/icons/deskpair.svg" width="128" height="128" alt="Deskpair icon">
  <h1>Deskpair</h1>
  <p><strong>Turn any device into a second monitor for GNOME Linux.</strong></p>
  <p>
    <a href="#install">Install</a> &bull;
    <a href="#features">Features</a> &bull;
    <a href="#how-it-works">How It Works</a> &bull;
    <a href="#building-from-source">Build</a> &bull;
    <a href="#contributing">Contributing</a>
  </p>
  <p>
    <img alt="License" src="https://img.shields.io/badge/license-ISC-blue">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Linux-green">
    <img alt="Tauri" src="https://img.shields.io/badge/Tauri-v2-orange">
  </p>
</div>

---

Deskpair is a desktop app that makes it easy to set up, configure, and control
[touchvnc-gnome](https://github.com/lucasbrito-wdt/touchvnc-gnome) -- a VNC
server that creates a virtual second display on GNOME Linux desktops.

Connect from a tablet, phone, or laptop using any VNC client. The virtual
display appears as a real monitor in GNOME Settings -- drag windows to it,
extend your workspace, and interact with full touch, mouse, and keyboard
support.

## Features

### Installation Wizard

On first launch, Deskpair guides you through a step-by-step setup:

1. **System Check** -- detects your OS, session type (Wayland/X11), and GPU
2. **Dependencies** -- checks and installs required packages (PipeWire, GLib, Meson, etc.)
3. **Build** -- compiles touchvnc-gnome from source with a live progress view
4. **Configure** -- sets resolution, port, and mode, then shows a QR code to connect

### Dashboard

- **Start/Stop/Restart** the VNC server with one click
- **Connection info** -- your IP, port, and a QR code for quick mobile access
- **Stats** -- uptime, resolution, mode, and port at a glance
- **Client list** -- see who is connected

### Settings

| Section | What you can configure |
|---------|----------------------|
| **Display** | Resolution (presets + custom), mode (Virtual / Mirror / Test) |
| **Network** | Listen address, port |
| **Security** | Auth (username/password), TLS certificate generation, RSA-AES keys |
| **Input** | Toggle touch, mouse, keyboard independently |
| **System** | Autostart on login, minimize to tray, auto-start server |
| **Advanced** | Binary path, extra CLI args, log level |

### System Tray

Deskpair lives in your system tray with a status indicator:
- Green = server running
- Red = server stopped
- Menu: Show / Start-Stop / Quit

### Real-time Logs

A built-in terminal-style log viewer with search, filter, auto-scroll, and
export.

### TLS & Authentication

Generate self-signed TLS certificates and RSA keys directly from the app.
Protect your VNC connection without touching the command line.

## How It Works

```
Deskpair (Tauri)                touchvnc-gnome (C binary)
    |                                   |
    |-- spawn child process ----------->|
    |   (with args from config)         |
    |                                   |
    |<-- stdout/stderr (log stream) ----|
    |                                   |
    |-- SIGTERM ----------------------->| (graceful stop)
```

Deskpair is a **separate app** that controls `touchvnc-gnome` as a child
process. It does not modify or patch the VNC server -- it just makes it
easy to use.

Under the hood, touchvnc-gnome:
- **Wayland**: creates a virtual monitor via Mutter RemoteDesktop + ScreenCast D-Bus APIs
- **X11**: activates a disconnected xrandr output and captures via the ScreenCast portal
- **Capture**: uses PipeWire for low-latency, zero-copy frame delivery
- **Input**: injects touch/mouse/keyboard via RemoteDesktop D-Bus (Wayland) or uinput (X11)

## Install

### Flatpak (recommended)

```sh
flatpak install https://lucasbrito-wdt.github.io/deskpair/dev.deskpair.app.flatpakref
```

### Debian / Ubuntu (.deb)

Download the latest `.deb` from [Releases](https://github.com/lucasbrito-wdt/deskpair/releases):

```sh
sudo dpkg -i Deskpair_0.1.0_amd64.deb
```

### AppImage

Download the `.AppImage` from [Releases](https://github.com/lucasbrito-wdt/deskpair/releases):

```sh
chmod +x Deskpair_0.1.0_amd64.AppImage
./Deskpair_0.1.0_amd64.AppImage
```

## Building from Source

### Prerequisites

- **Rust** 1.77+ and Cargo
- **Node.js** 20+ and npm/pnpm
- **System libraries** (Ubuntu/Debian):
  ```sh
  sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev \
    librsvg2-dev patchelf libssl-dev
  ```

### Build

```sh
git clone https://github.com/lucasbrito-wdt/deskpair.git
cd deskpair

# Install frontend dependencies
pnpm install

# Development mode (hot reload)
pnpm tauri dev

# Production build (.deb + .AppImage)
pnpm tauri build
```

Bundles are output to `src-tauri/target/release/bundle/`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | [Tauri v2](https://v2.tauri.app/) (Rust) |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| UI components | Custom (shadcn-inspired), Framer Motion |
| State management | Zustand |
| Icons | Lucide React |
| QR Code | qrcode.react |
| VNC server | [touchvnc-gnome](https://github.com/lucasbrito-wdt/touchvnc-gnome) (C) |

## Recommended VNC Clients

| Platform | Client |
|----------|--------|
| **Android** | [bVNC](https://play.google.com/store/apps/details?id=com.iiordanov.freebVNC) (free, multi-touch) or [AVNC](https://github.com/gujjwal00/avnc) |
| **iOS** | [RealVNC Viewer](https://apps.apple.com/app/vnc-viewer-remote-desktop/id352019548) |
| **Linux** | [Remmina](https://remmina.org/) or [TigerVNC](https://tigervnc.org/) |
| **Windows/macOS** | [TigerVNC](https://tigervnc.org/) |

## Project Structure

```
deskpair/
  src-tauri/                 # Rust backend (Tauri)
    src/commands/            #   server, install, config, network, tls, system
    src/                     #   lib, main, state, tray
    capabilities/            #   Tauri v2 permissions
  src/                       # React frontend
    components/              #   layout, wizard, dashboard, settings
    pages/                   #   Dashboard, Wizard, Settings, Logs, About
    stores/                  #   serverStore, configStore (Zustand)
    hooks/                   #   useServer, useConfig, useNetwork
    lib/                     #   Tauri IPC wrappers, constants
    styles/                  #   Tailwind CSS v4 theme
  flatpak/                   # Flatpak packaging files
```

## Contributing

Contributions are welcome! Please open an issue first to discuss what you
would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## License

ISC License. See [LICENSE](LICENSE) for the full text.

## Credits

- **[touchvnc-gnome](https://github.com/lucasbrito-wdt/touchvnc-gnome)** -- the VNC server this app controls
- **[neatvnc](https://github.com/any1/neatvnc)** -- VNC server library by Andri Yngvason
- **[Tauri](https://tauri.app/)** -- desktop app framework
- **[PipeWire](https://pipewire.org/)** -- multimedia framework for screen capture
