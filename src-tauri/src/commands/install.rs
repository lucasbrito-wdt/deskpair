use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub session_type: String,
    pub gpu: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepStatus {
    pub name: String,
    pub installed: bool,
    pub package_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildProgress {
    pub stage: String,
    pub percent: f64,
    pub message: String,
}

fn read_os_release() -> String {
    let content = std::fs::read_to_string("/etc/os-release").unwrap_or_default();
    let mut name = String::from("Unknown");
    let mut version = String::new();

    for line in content.lines() {
        if let Some(val) = line.strip_prefix("NAME=") {
            name = val.trim_matches('"').to_string();
        }
        if let Some(val) = line.strip_prefix("VERSION_ID=") {
            version = val.trim_matches('"').to_string();
        }
    }

    if version.is_empty() {
        name
    } else {
        format!("{} {}", name, version)
    }
}

fn detect_session_type() -> String {
    std::env::var("XDG_SESSION_TYPE").unwrap_or_else(|_| "unknown".into())
}

fn detect_gpu() -> String {
    Command::new("lspci")
        .output()
        .ok()
        .and_then(|out| {
            let text = String::from_utf8_lossy(&out.stdout);
            let gpu_lines: Vec<&str> = text
                .lines()
                .filter(|l| {
                    let lower = l.to_lowercase();
                    lower.contains("vga") || lower.contains("3d") || lower.contains("display")
                })
                .collect();
            if gpu_lines.is_empty() {
                None
            } else {
                // Extract just the device name part after the colon
                Some(
                    gpu_lines
                        .iter()
                        .filter_map(|l| l.split(": ").nth(1))
                        .collect::<Vec<_>>()
                        .join("; "),
                )
            }
        })
        .unwrap_or_else(|| "Could not detect GPU".into())
}

#[tauri::command]
pub fn check_system_info() -> SystemInfo {
    SystemInfo {
        os: read_os_release(),
        session_type: detect_session_type(),
        gpu: detect_gpu(),
    }
}

struct DepDefinition {
    pkg_config_name: &'static str,
    display_name: &'static str,
    apt_name: &'static str,
    dnf_name: &'static str,
    pacman_name: &'static str,
}

const DEPS: &[DepDefinition] = &[
    DepDefinition {
        pkg_config_name: "libpipewire-0.3",
        display_name: "PipeWire",
        apt_name: "libpipewire-0.3-dev",
        dnf_name: "pipewire-devel",
        pacman_name: "pipewire",
    },
    DepDefinition {
        pkg_config_name: "libspa-0.2",
        display_name: "SPA (PipeWire)",
        apt_name: "libspa-0.2-dev",
        dnf_name: "pipewire-devel",
        pacman_name: "pipewire",
    },
    DepDefinition {
        pkg_config_name: "glib-2.0",
        display_name: "GLib 2.0",
        apt_name: "libglib2.0-dev",
        dnf_name: "glib2-devel",
        pacman_name: "glib2",
    },
    DepDefinition {
        pkg_config_name: "gio-2.0",
        display_name: "GIO 2.0",
        apt_name: "libglib2.0-dev",
        dnf_name: "glib2-devel",
        pacman_name: "glib2",
    },
    DepDefinition {
        pkg_config_name: "pixman-1",
        display_name: "Pixman",
        apt_name: "libpixman-1-dev",
        dnf_name: "pixman-devel",
        pacman_name: "pixman",
    },
    DepDefinition {
        pkg_config_name: "libdrm",
        display_name: "libdrm",
        apt_name: "libdrm-dev",
        dnf_name: "libdrm-devel",
        pacman_name: "libdrm",
    },
    DepDefinition {
        pkg_config_name: "xkbcommon",
        display_name: "xkbcommon",
        apt_name: "libxkbcommon-dev",
        dnf_name: "libxkbcommon-devel",
        pacman_name: "libxkbcommon",
    },
];

struct ToolDep {
    binary: &'static str,
    display_name: &'static str,
    apt_name: &'static str,
    dnf_name: &'static str,
    pacman_name: &'static str,
}

const TOOL_DEPS: &[ToolDep] = &[
    ToolDep {
        binary: "meson",
        display_name: "Meson",
        apt_name: "meson",
        dnf_name: "meson",
        pacman_name: "meson",
    },
    ToolDep {
        binary: "ninja",
        display_name: "Ninja",
        apt_name: "ninja-build",
        dnf_name: "ninja-build",
        pacman_name: "ninja",
    },
];

fn check_pkg_config(name: &str) -> bool {
    Command::new("pkg-config")
        .args(["--exists", name])
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn check_which(name: &str) -> bool {
    Command::new("which")
        .arg(name)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn detect_package_manager() -> &'static str {
    if check_which("apt") {
        "apt"
    } else if check_which("dnf") {
        "dnf"
    } else if check_which("pacman") {
        "pacman"
    } else {
        "unknown"
    }
}

#[tauri::command]
pub fn check_dependencies() -> Vec<DepStatus> {
    let pm = detect_package_manager();
    let mut results = Vec::new();

    for dep in DEPS {
        let pkg_name = match pm {
            "apt" => dep.apt_name,
            "dnf" => dep.dnf_name,
            "pacman" => dep.pacman_name,
            _ => dep.apt_name,
        };
        results.push(DepStatus {
            name: dep.display_name.to_string(),
            installed: check_pkg_config(dep.pkg_config_name),
            package_name: pkg_name.to_string(),
        });
    }

    for tool in TOOL_DEPS {
        let pkg_name = match pm {
            "apt" => tool.apt_name,
            "dnf" => tool.dnf_name,
            "pacman" => tool.pacman_name,
            _ => tool.apt_name,
        };
        results.push(DepStatus {
            name: tool.display_name.to_string(),
            installed: check_which(tool.binary),
            package_name: pkg_name.to_string(),
        });
    }

    results
}

#[tauri::command]
pub fn install_dependencies() -> Result<(), String> {
    let pm = detect_package_manager();
    if pm == "unknown" {
        return Err("Could not detect package manager (apt/dnf/pacman).".into());
    }

    let missing: Vec<String> = check_dependencies()
        .into_iter()
        .filter(|d| !d.installed)
        .map(|d| d.package_name)
        .collect();

    if missing.is_empty() {
        return Ok(());
    }

    let mut packages = missing;
    packages.sort();
    packages.dedup();

    let (cmd, install_args) = match pm {
        "apt" => ("apt", vec!["install", "-y"]),
        "dnf" => ("dnf", vec!["install", "-y"]),
        "pacman" => ("pacman", vec!["-S", "--noconfirm"]),
        _ => return Err(format!("Unsupported package manager: {}", pm)),
    };

    let mut args = vec![cmd];
    args.extend(install_args);
    let pkg_refs: Vec<&str> = packages.iter().map(|s| s.as_str()).collect();
    args.extend(pkg_refs);

    let output = Command::new("pkexec")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to run pkexec: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Installation failed: {}", stderr));
    }

    Ok(())
}

#[tauri::command]
pub fn build_project(app: AppHandle, source_path: String) -> Result<(), String> {
    let source = std::path::Path::new(&source_path);
    if !source.exists() {
        return Err(format!(
            "Source directory not found: {}. Clone the repository first.",
            source_path
        ));
    }

    let build_dir = source.join("build");

    // meson setup (skip if build dir already exists with build.ninja)
    if !build_dir.join("build.ninja").exists() {
        let _ = app.emit(
            "build-progress",
            BuildProgress {
                stage: "meson".into(),
                percent: 10.0,
                message: "Running meson setup...".into(),
            },
        );

        let meson = Command::new("meson")
            .args(["setup", "build"])
            .current_dir(source)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| format!("Failed to run meson: {}", e))?;

        for line in String::from_utf8_lossy(&meson.stdout).lines() {
            let _ = app.emit(
                "build-progress",
                BuildProgress {
                    stage: "meson".into(),
                    percent: 20.0,
                    message: line.to_string(),
                },
            );
        }

        if !meson.status.success() {
            let stderr = String::from_utf8_lossy(&meson.stderr);
            return Err(format!("meson setup failed: {}", stderr));
        }
    } else {
        let _ = app.emit(
            "build-progress",
            BuildProgress {
                stage: "meson".into(),
                percent: 25.0,
                message: "Build directory exists, skipping meson setup.".into(),
            },
        );
    }

    // ninja build
    let _ = app.emit(
        "build-progress",
        BuildProgress {
            stage: "ninja".into(),
            percent: 30.0,
            message: "Running ninja build...".into(),
        },
    );

    let mut ninja = Command::new("ninja")
        .args(["-C", build_dir.to_str().unwrap_or("build")])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to run ninja: {}", e))?;

    if let Some(stdout) = ninja.stdout.take() {
        let app_clone = app.clone();
        let reader = BufReader::new(stdout);
        let lines: Vec<String> = reader.lines().map_while(Result::ok).collect();
        let total = lines.len().max(1);
        for (i, line) in lines.iter().enumerate() {
            let pct = 30.0 + (60.0 * (i as f64 / total as f64));
            let _ = app_clone.emit(
                "build-progress",
                BuildProgress {
                    stage: "ninja".into(),
                    percent: pct,
                    message: line.clone(),
                },
            );
        }
    }

    let status = ninja
        .wait()
        .map_err(|e| format!("ninja failed: {}", e))?;

    if !status.success() {
        return Err("ninja build failed. Check build output for details.".into());
    }

    let _ = app.emit(
        "build-progress",
        BuildProgress {
            stage: "done".into(),
            percent: 100.0,
            message: "Build completed successfully!".into(),
        },
    );

    Ok(())
}

/// Check if the touchvnc-gnome binary exists and is runnable.
#[tauri::command]
pub fn check_installation() -> bool {
    // System-installed
    for candidate in &["/usr/local/bin/touchvnc-gnome", "/usr/bin/touchvnc-gnome"] {
        if std::path::Path::new(candidate).exists() {
            return true;
        }
    }

    // Bundled: check relative to GUI binary
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            // Tauri resources: ../resources/bin/
            if dir.join("../resources/bin/touchvnc-gnome").exists() {
                return true;
            }
            // Dev layout: project root bin/
            for depth in &["../../../..", "../../.."] {
                if dir.join(depth).join("bin/touchvnc-gnome").exists() {
                    return true;
                }
            }
        }
    }

    // Working directory bin/
    std::path::Path::new("bin/touchvnc-gnome").exists()
}
