use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub path: String,
    pub vendor_id: String,
    pub is_preferred: bool,
}

#[tauri::command]
pub fn list_gpus() -> Vec<GpuInfo> {
    let mut gpus: Vec<(i32, GpuInfo)> = Vec::new();

    for n in 128..160u32 {
        let render_path = format!("/dev/dri/renderD{}", n);
        if !std::path::Path::new(&render_path).exists() {
            break;
        }

        let vendor_path = format!("/sys/class/drm/renderD{}/device/vendor", n);
        let vendor_hex = match std::fs::read_to_string(&vendor_path) {
            Ok(s) => s.trim().to_string(),
            Err(_) => continue,
        };

        let vendor_id = u32::from_str_radix(vendor_hex.trim_start_matches("0x"), 16)
            .unwrap_or(0);

        let (name, priority) = match vendor_id {
            0x10de => ("NVIDIA".to_string(), 3),
            0x1002 => ("AMD".to_string(), 2),
            0x8086 => ("Intel".to_string(), 1),
            _ => (format!("GPU (vendor {:04x})", vendor_id), 0),
        };

        gpus.push((priority, GpuInfo {
            name,
            path: render_path,
            vendor_id: format!("{:#06x}", vendor_id),
            is_preferred: false,
        }));
    }

    if gpus.is_empty() {
        return vec![];
    }

    // Mark the highest-priority GPU as preferred
    let max_priority = gpus.iter().map(|(p, _)| *p).max().unwrap_or(0);
    gpus.iter_mut().for_each(|(p, g)| {
        g.is_preferred = *p == max_priority;
    });

    gpus.into_iter().map(|(_, g)| g).collect()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionStatus {
    pub input_group: bool,
    pub uinput_accessible: bool,
}

fn autostart_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    PathBuf::from(home).join(".config").join("autostart")
}

fn desktop_file_path() -> PathBuf {
    autostart_dir().join("touchvnc-gnome-gui.desktop")
}

const DESKTOP_ENTRY: &str = r#"[Desktop Entry]
Type=Application
Name=Deskpair
Comment=Deskpair Control Panel
Exec=touchvnc-gnome-gui
Icon=touchvnc
Terminal=false
Categories=Utility;RemoteAccess;
X-GNOME-Autostart-enabled=true
"#;

#[tauri::command]
pub fn setup_autostart(enable: bool) -> Result<(), String> {
    let path = desktop_file_path();

    if enable {
        let dir = autostart_dir();
        std::fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create autostart directory: {}", e))?;

        std::fs::write(&path, DESKTOP_ENTRY)
            .map_err(|e| format!("Failed to write .desktop file: {}", e))?;
    } else if path.exists() {
        std::fs::remove_file(&path)
            .map_err(|e| format!("Failed to remove .desktop file: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn check_permissions() -> PermissionStatus {
    let input_group = check_user_in_input_group();
    let uinput_accessible = check_uinput_access();

    PermissionStatus {
        input_group,
        uinput_accessible,
    }
}

fn check_user_in_input_group() -> bool {
    Command::new("groups")
        .output()
        .map(|out| {
            let groups = String::from_utf8_lossy(&out.stdout);
            groups.split_whitespace().any(|g| g == "input")
        })
        .unwrap_or(false)
}

fn check_uinput_access() -> bool {
    use std::os::unix::fs::MetadataExt;

    let meta = match std::fs::metadata("/dev/uinput") {
        Ok(m) => m,
        Err(_) => return false,
    };

    // Check if the file is readable/writable
    let mode = meta.mode();
    let uid = unsafe { libc::getuid() };
    let gid = unsafe { libc::getgid() };

    // Owner match
    if meta.uid() == uid && (mode & 0o600) == 0o600 {
        return true;
    }

    // Group match
    if meta.gid() == gid && (mode & 0o060) == 0o060 {
        return true;
    }

    // Other
    if (mode & 0o006) == 0o006 {
        return true;
    }

    // Try a direct open test as the most reliable check
    std::fs::OpenOptions::new()
        .write(true)
        .open("/dev/uinput")
        .is_ok()
}
