# Contributing to Deskpair

Thanks for your interest in contributing! This document explains how to get
involved.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```sh
   git clone https://github.com/YOUR_USERNAME/deskpair.git
   cd deskpair
   ```
3. Install dependencies:
   ```sh
   # Frontend
   npm install

   # System libs (Ubuntu/Debian)
   sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
   ```
4. Run in development mode:
   ```sh
   npm run tauri dev
   ```

## Project Structure

```
src/                  React frontend (TypeScript)
src-tauri/src/        Rust backend (Tauri commands)
bin/                  Bundled touchvnc-gnome binary + libs
flatpak/              Flatpak packaging files
docs/                 GitHub Pages site
```

## Development Workflow

1. Create a branch from `main`:
   ```sh
   git checkout -b feat/my-feature
   ```
2. Make your changes
3. Test locally with `npm run tauri dev`
4. Commit with a descriptive message:
   ```sh
   git commit -m "feat: add resolution presets for Samsung tablets"
   ```
5. Push and open a Pull Request

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `docs:` | Documentation only |
| `style:` | Formatting, missing semicolons, etc. |
| `test:` | Adding or updating tests |
| `chore:` | Build process, CI, dependencies |

## Frontend (React + TypeScript)

- Components are in `src/components/` organized by feature
- State management uses Zustand (`src/stores/`)
- Tauri IPC wrappers are in `src/lib/tauri.ts`
- Styling uses Tailwind CSS v4 with custom theme in `src/styles/globals.css`

### Code Style

- TypeScript strict mode
- Functional components with hooks
- Named exports (no default exports for components)
- `cn()` utility for conditional classnames

## Backend (Rust + Tauri)

- Commands are in `src-tauri/src/commands/` organized by domain
- App state is in `src-tauri/src/state.rs`
- System tray logic is in `src-tauri/src/tray.rs`

### Code Style

- All commands use `#[tauri::command]` attribute
- Return `Result<T, String>` for error handling
- Use `tauri::State<AppState>` for shared state

## Updating the Bundled Binary

The `bin/` directory contains the pre-built `touchvnc-gnome` binary and its
shared libraries. To update:

```sh
# Build touchvnc-gnome
cd /path/to/touchvnc-gnome
meson setup build && ninja -C build

# Copy to deskpair
cp build/touchvnc-gnome /path/to/deskpair/bin/
cp build/subprojects/aml/libaml.so.1.0.0 /path/to/deskpair/bin/libaml.so.1
cp build/subprojects/neatvnc/libneatvnc.so.0.0.0 /path/to/deskpair/bin/libneatvnc.so.0
```

## Reporting Bugs

Use the [Bug Report](https://github.com/lucasbrito-wdt/deskpair/issues/new?template=bug_report.yml) issue template. Include:

- OS and desktop environment
- Wayland or X11
- Steps to reproduce
- Expected vs actual behavior
- Logs from the Logs page

## Requesting Features

Use the [Feature Request](https://github.com/lucasbrito-wdt/deskpair/issues/new?template=feature_request.yml) issue template.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
Be respectful and constructive.

## License

By contributing, you agree that your contributions will be licensed under the
[ISC License](LICENSE).
