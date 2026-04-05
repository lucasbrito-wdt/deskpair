use crate::state::{AppState, ServerProcess};
use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tauri::{AppHandle, Emitter, State};

use crate::state::ServerState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub address: String,
    pub port: u16,
    pub width: u32,
    pub height: u32,
    pub mode: String,
    pub binary_path: String,
    #[serde(default)]
    pub extra_args: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatus {
    pub running: bool,
    pub pid: Option<u32>,
    pub uptime_secs: Option<u64>,
}

/// Returns (binary_path, lib_dir) — lib_dir is set when the binary is bundled
/// with its shared libraries so we can set LD_LIBRARY_PATH.
fn find_binary(configured_path: &str) -> Result<(String, Option<String>), String> {
    if !configured_path.is_empty() {
        let path = std::path::Path::new(configured_path);
        if path.exists() {
            return Ok((configured_path.to_string(), None));
        }
    }

    // System-installed (libs are in system paths, no LD_LIBRARY_PATH needed)
    for candidate in &[
        "/usr/local/bin/touchvnc-gnome",
        "/usr/bin/touchvnc-gnome",
    ] {
        if std::path::Path::new(candidate).exists() {
            return Ok((candidate.to_string(), None));
        }
    }

    // Bundled: look for bin/ directory relative to the GUI binary
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            // Tauri .deb resources: /usr/lib/<ProductName>/bin/
            // exe is at /usr/bin/deskpair, resources at /usr/lib/Deskpair/bin/
            let deb_res = dir.join("../lib/Deskpair/bin/touchvnc-gnome");
            if deb_res.exists() {
                let bin = deb_res.canonicalize().unwrap().to_string_lossy().into_owned();
                let lib = deb_res.parent().unwrap().canonicalize().unwrap().to_string_lossy().into_owned();
                return Ok((bin, Some(lib)));
            }
            // AppImage: resources next to binary
            let appimage_res = dir.join("../resources/bin/touchvnc-gnome");
            if appimage_res.exists() {
                let bin = appimage_res.canonicalize().unwrap().to_string_lossy().into_owned();
                let lib = appimage_res.parent().unwrap().canonicalize().unwrap().to_string_lossy().into_owned();
                return Ok((bin, Some(lib)));
            }
            // dev layout: project root has bin/
            for depth in &["../../../..", "../../.."] {
                let dev_bin = dir.join(depth).join("bin/touchvnc-gnome");
                if dev_bin.exists() {
                    let bin = dev_bin.canonicalize().unwrap().to_string_lossy().into_owned();
                    let lib = dev_bin.parent().unwrap().canonicalize().unwrap().to_string_lossy().into_owned();
                    return Ok((bin, Some(lib)));
                }
            }
        }
    }

    // Check working directory bin/
    let cwd_bin = std::path::Path::new("bin/touchvnc-gnome");
    if cwd_bin.exists() {
        let bin = cwd_bin.canonicalize().unwrap().to_string_lossy().into_owned();
        let lib = cwd_bin.parent().unwrap().canonicalize().unwrap().to_string_lossy().into_owned();
        return Ok((bin, Some(lib)));
    }

    Err("touchvnc-gnome binary not found. Please set the binary path in Settings > Advanced.".into())
}

fn build_args(config: &ServerConfig) -> Vec<String> {
    let mut args = vec![
        "--address".to_string(),
        config.address.clone(),
        "--port".to_string(),
        config.port.to_string(),
        "--width".to_string(),
        config.width.to_string(),
        "--height".to_string(),
        config.height.to_string(),
    ];

    // touchvnc-gnome uses --mirror and --test as flags;
    // "virtual" is the default mode (no flag needed)
    match config.mode.as_str() {
        "mirror" => args.push("--mirror".to_string()),
        "test" => args.push("--test".to_string()),
        _ => {} // "virtual" is default, no flag
    }

    args.extend(config.extra_args.clone());
    args
}

fn spawn_log_reader(
    app: AppHandle,
    state_arc: Arc<Mutex<ServerState>>,
    child: &mut std::process::Child,
) {
    if let Some(stdout) = child.stdout.take() {
        let app_clone = app.clone();
        let state_clone = Arc::clone(&state_arc);
        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines().map_while(Result::ok) {
                let _ = app_clone.emit("server-log", &line);
                if let Ok(mut s) = state_clone.lock() {
                    s.push_log(line);
                }
            }
        });
    }

    if let Some(stderr) = child.stderr.take() {
        let app_clone = app.clone();
        let state_clone = Arc::clone(&state_arc);
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines().map_while(Result::ok) {
                let tagged = format!("[stderr] {}", line);
                let _ = app_clone.emit("server-log", &tagged);
                if let Ok(mut s) = state_clone.lock() {
                    s.push_log(tagged);
                }
            }
        });
    }
}

#[tauri::command]
pub fn start_server(
    app: AppHandle,
    state: State<'_, AppState>,
    config: ServerConfig,
) -> Result<(), String> {
    {
        let guard = state.lock().map_err(|e| e.to_string())?;
        if guard.is_running() {
            return Err("Server is already running.".into());
        }
    }

    let (binary, lib_dir) = find_binary(&config.binary_path)?;
    let args = build_args(&config);

    let mut cmd = Command::new(&binary);
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    // Set LD_LIBRARY_PATH so bundled .so files are found
    if let Some(ref ld_path) = lib_dir {
        cmd.env("LD_LIBRARY_PATH", ld_path);
    }

    let mut child = cmd.spawn()
        .map_err(|e| format!("Failed to start server: {}", e))?;

    // Clone the Arc for the log reader threads
    let state_arc: Arc<Mutex<ServerState>> = Arc::clone(&state);
    spawn_log_reader(app.clone(), state_arc, &mut child);

    let pid = child.id();
    {
        let mut guard = state.lock().map_err(|e| e.to_string())?;
        guard.process = Some(ServerProcess {
            child,
            start_time: Instant::now(),
        });
    }

    let status = ServerStatus {
        running: true,
        pid: Some(pid),
        uptime_secs: Some(0),
    };
    let _ = app.emit("server-status", &status);

    Ok(())
}

#[tauri::command]
pub fn stop_server(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = state.lock().map_err(|e| e.to_string())?;

    let process = guard.process.as_mut().ok_or("Server is not running.")?;

    // Send SIGTERM on Unix
    #[cfg(unix)]
    unsafe {
        libc::kill(process.child.id() as i32, libc::SIGTERM);
    }

    #[cfg(not(unix))]
    {
        let _ = process.child.kill();
    }

    match process.child.wait() {
        Ok(_) => {}
        Err(e) => {
            log::warn!("Error waiting for server process: {}", e);
        }
    }

    guard.process = None;

    let status = ServerStatus {
        running: false,
        pid: None,
        uptime_secs: None,
    };
    let _ = app.emit("server-status", &status);

    Ok(())
}

#[tauri::command]
pub fn restart_server(
    app: AppHandle,
    state: State<'_, AppState>,
    config: ServerConfig,
) -> Result<(), String> {
    let _ = stop_server(app.clone(), State::clone(&state));
    start_server(app, state, config)
}

#[tauri::command]
pub fn get_server_status(state: State<'_, AppState>) -> ServerStatus {
    let guard = match state.lock() {
        Ok(g) => g,
        Err(_) => {
            return ServerStatus {
                running: false,
                pid: None,
                uptime_secs: None,
            }
        }
    };

    ServerStatus {
        running: guard.is_running(),
        pid: guard.pid(),
        uptime_secs: guard.uptime_secs(),
    }
}

#[tauri::command]
pub fn get_server_logs(state: State<'_, AppState>) -> Vec<String> {
    match state.lock() {
        Ok(guard) => guard.log_lines.clone(),
        Err(_) => vec![],
    }
}
