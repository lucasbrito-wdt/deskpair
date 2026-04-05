use rcgen::{CertificateParams, KeyPair};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TlsCertInfo {
    pub cert_path: String,
    pub key_path: String,
    pub fingerprint: String,
}

#[tauri::command]
pub fn generate_tls_cert(output_dir: String) -> Result<TlsCertInfo, String> {
    let dir = Path::new(&output_dir);
    std::fs::create_dir_all(dir)
        .map_err(|e| format!("Failed to create output directory: {}", e))?;

    let mut params = CertificateParams::new(vec!["touchvnc-gnome".to_string()])
        .map_err(|e| format!("Failed to create cert params: {}", e))?;
    params
        .distinguished_name
        .push(rcgen::DnType::CommonName, "Deskpair Self-Signed");
    params
        .distinguished_name
        .push(rcgen::DnType::OrganizationName, "Deskpair");

    let key_pair = KeyPair::generate().map_err(|e| format!("Failed to generate key pair: {}", e))?;
    let cert = params
        .self_signed(&key_pair)
        .map_err(|e| format!("Failed to generate certificate: {}", e))?;

    let cert_pem = cert.pem();
    let key_pem = key_pair.serialize_pem();

    let cert_path = dir.join("cert.pem");
    let key_path = dir.join("key.pem");

    std::fs::write(&cert_path, &cert_pem)
        .map_err(|e| format!("Failed to write certificate: {}", e))?;
    std::fs::write(&key_path, &key_pem)
        .map_err(|e| format!("Failed to write key: {}", e))?;

    // Compute SHA-256 fingerprint from the DER-encoded certificate
    let der_bytes = cert.der();
    let fingerprint = sha256_fingerprint(der_bytes);

    Ok(TlsCertInfo {
        cert_path: cert_path.to_string_lossy().to_string(),
        key_path: key_path.to_string_lossy().to_string(),
        fingerprint,
    })
}

fn sha256_fingerprint(data: &[u8]) -> String {
    // Simple SHA-256 using the system's openssl or a manual approach.
    // Since we don't have a sha2 crate, use a command fallback or
    // compute a basic hex digest of the DER for display purposes.
    use std::process::Command;

    let output = Command::new("openssl")
        .args(["dgst", "-sha256", "-hex"])
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .and_then(|mut child| {
            use std::io::Write;
            if let Some(ref mut stdin) = child.stdin {
                let _ = stdin.write_all(data);
            }
            child.wait_with_output()
        });

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            // openssl outputs: "(stdin)= <hex>"
            text.trim()
                .rsplit("= ")
                .next()
                .unwrap_or("unknown")
                .to_uppercase()
        }
        Err(_) => "Could not compute fingerprint".into(),
    }
}

#[tauri::command]
pub fn generate_rsa_key(output_path: String) -> Result<(), String> {
    let key_pair =
        KeyPair::generate().map_err(|e| format!("Failed to generate RSA key: {}", e))?;

    let pem = key_pair.serialize_pem();

    if let Some(parent) = Path::new(&output_path).parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    std::fs::write(&output_path, pem)
        .map_err(|e| format!("Failed to write RSA key: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn check_certs_exist(cert_path: String, key_path: String) -> bool {
    Path::new(&cert_path).exists() && Path::new(&key_path).exists()
}
