use crate::state::AppState;
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItemBuilder::with_id("show", "Show Deskpair").build(app)?;
    let toggle = MenuItemBuilder::with_id("toggle", "Start Server").build(app)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&show, &toggle, &separator, &quit])
        .build()?;

    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Deskpair - Stopped")
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "toggle" => {
                let _ = app.emit("tray-toggle-server", ());
            }
            "quit" => {
                // Stop server before quitting
                let state = app.state::<AppState>();
                if let Ok(mut guard) = state.lock() {
                    if let Some(ref mut process) = guard.process {
                        #[cfg(unix)]
                        unsafe {
                            libc::kill(process.child.id() as i32, libc::SIGTERM);
                        }
                        let _ = process.child.wait();
                    }
                    guard.process = None;
                }
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}
