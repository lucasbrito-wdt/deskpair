mod commands;
mod state;
mod tray;

use std::sync::{Arc, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state: state::AppState = Arc::new(Mutex::new(state::ServerState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .manage(app_state)
        .setup(|app| {
            if let Err(e) = tray::setup_tray(app.handle()) {
                log::warn!("System tray not available: {e}. Running without tray.");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // server
            commands::server::start_server,
            commands::server::stop_server,
            commands::server::restart_server,
            commands::server::get_server_status,
            commands::server::get_server_logs,
            // install
            commands::install::check_system_info,
            commands::install::check_dependencies,
            commands::install::install_dependencies,
            commands::install::check_installation,
            // config
            commands::config::load_config,
            commands::config::save_config,
            commands::config::get_default_config,
            commands::config::needs_onboarding,
            commands::config::complete_onboarding,
            // network
            commands::network::get_local_ip,
            commands::network::get_connection_url,
            // tls
            commands::tls::generate_tls_cert,
            commands::tls::generate_rsa_key,
            commands::tls::check_certs_exist,
            // system
            commands::system::setup_autostart,
            commands::system::check_permissions,
            commands::system::list_gpus,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
