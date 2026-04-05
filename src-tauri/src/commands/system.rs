use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

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
