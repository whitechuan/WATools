use base64::{Engine as _, engine::general_purpose};
use serde::Serialize;

#[derive(Serialize)]
pub struct Base64Result {
    pub output: String,
    pub size_before: usize,
    pub size_after: usize,
}

#[tauri::command]
pub fn base64_encode(input: String) -> Result<Base64Result, String> {
    let size_before = input.len();
    let output = general_purpose::STANDARD.encode(input.as_bytes());
    let size_after = output.len();
    Ok(Base64Result { output, size_before, size_after })
}

#[tauri::command]
pub fn base64_decode(input: String) -> Result<Base64Result, String> {
    let size_before = input.len();
    let decoded = general_purpose::STANDARD.decode(input.trim())
        .map_err(|e| format!("Base64 解码失败: {}", e))?;
    let output = String::from_utf8(decoded)
        .map_err(|e| format!("UTF-8 解码失败: {}", e))?;
    let size_after = output.len();
    Ok(Base64Result { output, size_before, size_after })
}
