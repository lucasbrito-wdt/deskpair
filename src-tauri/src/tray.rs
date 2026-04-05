use tauri::AppHandle;

pub fn setup_tray(_app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Tray icon disabled for now — libappindicator3 is not available
    // in the Flatpak GNOME runtime, causing a panic on load.
    // TODO: re-enable when Tauri supports StatusNotifierItem natively
    // or when the Flatpak runtime includes the library.
    log::info!("System tray is disabled in this build.");
    Ok(())
}
