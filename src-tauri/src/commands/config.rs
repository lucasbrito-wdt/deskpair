use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub address: String,
    pub port: u16,
    pub width: u32,
    pub height: u32,
    pub mode: String,
    pub enable_auth: bool,
    pub username: String,
    pub password: String,
    pub tls_enabled: bool,
    pub tls_cert_path: String,
    pub tls_key_path: String,
    pub rsa_key_path: String,
    pub autostart: bool,
    pub minimize_to_tray: bool,
    pub binary_path: String,
    #[serde(default)]
    pub onboarding_complete: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            address: "0.0.0.0".into(),
            port: 5900,
            width: 1920,
            height: 1080,
            mode: "virtual".into(),
            enable_auth: false,
            username: String::new(),
            password: String::new(),
            tls_enabled: false,
            tls_cert_path: String::new(),
            tls_key_path: String::new(),
            rsa_key_path: String::new(),
            autostart: false,
            minimize_to_tray: true,
            binary_path: String::new(),
            onboarding_complete: false,
        }
    }
}

fn config_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    PathBuf::from(home)
        .join(".config")
        .join("touchvnc-gnome")
}

fn config_path() -> PathBuf {
    config_dir().join("config.toml")
}

#[tauri::command]
pub fn load_config() -> AppConfig {
    let path = config_path();
    match std::fs::read_to_string(&path) {
        Ok(content) => toml::from_str(&content).unwrap_or_default(),
        Err(_) => AppConfig::default(),
    }
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<(), String> {
    let dir = config_dir();
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;

    let content =
        toml::to_string_pretty(&config).map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(config_path(), content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_default_config() -> AppConfig {
    AppConfig::default()
}

/// Returns true if onboarding wizard should be shown.
/// Shows wizard if: config file doesn't exist OR onboarding_complete is false.
#[tauri::command]
pub fn needs_onboarding() -> bool {
    let path = config_path();
    match std::fs::read_to_string(&path) {
        Ok(content) => {
            let config: AppConfig = toml::from_str(&content).unwrap_or_default();
            !config.onboarding_complete
        }
        Err(_) => true, // No config file = first run
    }
}

#[tauri::command]
pub fn complete_onboarding() -> Result<(), String> {
    let mut config = load_config();
    config.onboarding_complete = true;
    save_config(config)
}
