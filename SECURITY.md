# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Instead, please report them privately:

1. Go to [Security Advisories](https://github.com/lucasbrito-wdt/deskpair/security/advisories/new)
2. Click **"New draft security advisory"**
3. Fill in the details and submit

Alternatively, send an email to **lucasbrito.wdt@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

## Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment | 48 hours |
| Initial assessment | 5 business days |
| Fix or mitigation | 30 days (critical: 7 days) |

## Scope

The following are in scope:

- **Deskpair GUI** (Tauri app, Rust backend, React frontend)
- **VNC server control** (process spawning, argument injection)
- **TLS certificate generation** (key handling, storage)
- **Authentication** (password storage, config file permissions)
- **IPC** (Tauri commands, event system)
- **Flatpak sandbox** (permission escapes)

The following are out of scope:

- Vulnerabilities in upstream dependencies (report to them directly)
- Issues in `touchvnc-gnome` core (report at [touchvnc-gnome](https://github.com/lucasbrito-wdt/touchvnc-gnome/security))
- Social engineering attacks
- Denial of service on VNC port (inherent to running a network service)

## Known Security Considerations

- **VNC is unencrypted by default.** Users should enable TLS in Settings > Security or use SSH tunneling.
- **The bundled binary runs outside the Flatpak sandbox** when installed via .deb or AppImage. It has full access to uinput and PipeWire.
- **Passwords in config.toml are stored in plaintext.** The config file is created with `0600` permissions but is not encrypted.
- **Self-signed TLS certificates** are generated locally. Users must verify the certificate fingerprint on first connection.

## Disclosure Policy

We follow coordinated disclosure. Once a fix is released:

1. The advisory is published on GitHub
2. A new version is tagged and released
3. The changelog documents the fix

We credit reporters unless they prefer to remain anonymous.
