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

fn find_binary(configured_path: &str) -> Result<String, String> {
    if !configured_path.is_empty() {
        let path = std::path::Path::new(configured_path);
        if path.exists() {
            return Ok(configured_path.to_string());
        }
    }

    let candidates = [
        "/mnt/dev/wdt/touchvnc-gnome/build/touchvnc-gnome",
        "/usr/local/bin/touchvnc-gnome",
        "/usr/bin/touchvnc-gnome",
    ];

    for candidate in &candidates {
        if std::path::Path::new(candidate).exists() {
            return Ok(candidate.to_string());
        }
    }

    // Try relative to the GUI binary's parent directory
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            // dev layout: touchvnc-gnome-gui/src-tauri/target/debug/ -> ../../touchvnc-gnome/build/
            let dev_path = dir.join("../../../../touchvnc-gnome/build/touchvnc-gnome");
            if dev_path.exists() {
                return Ok(dev_path.canonicalize().unwrap().to_string_lossy().into());
            }
            // sibling directory layout
            let sibling = dir.join("../../../touchvnc-gnome/build/touchvnc-gnome");
            if sibling.exists() {
                return Ok(sibling.canonicalize().unwrap().to_string_lossy().into());
            }
        }
    }

    // Last resort: check working directory relative paths
    for rel in &["../touchvnc-gnome/build/touchvnc-gnome", "./build/touchvnc-gnome"] {
        let p = std::path::Path::new(rel);
        if p.exists() {
            return Ok(p.canonicalize().unwrap_or(p.to_path_buf()).to_string_lossy().into());
        }
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

    let binary = find_binary(&config.binary_path)?;
    let args = build_args(&config);

    let mut child = Command::new(&binary)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
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
