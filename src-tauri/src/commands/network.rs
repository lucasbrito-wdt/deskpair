use local_ip_address::local_ip;

#[tauri::command]
pub fn get_local_ip() -> Result<String, String> {
    local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| format!("Failed to detect local IP: {}", e))
}

#[tauri::command]
pub fn get_connection_url(port: u16) -> String {
    match local_ip() {
        Ok(ip) => format!("vnc://{}:{}", ip, port),
        Err(_) => format!("vnc://localhost:{}", port),
    }
}
