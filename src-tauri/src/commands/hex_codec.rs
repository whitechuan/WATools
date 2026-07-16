use tauri::command;

#[command]
pub fn hex_encode(input: String) -> Result<String, String> {
    Ok(hex::encode(input.as_bytes()))
}

#[command]
pub fn hex_decode(input: String) -> Result<String, String> {
    let bytes = hex::decode(input.trim()).map_err(|e| format!("Hex解码失败: {}", e))?;
    String::from_utf8(bytes).map_err(|e| format!("UTF-8转换失败: {}", e))
}
