use base32::Alphabet;

#[tauri::command]
pub fn base32_encode(input: String) -> Result<String, String> {
    let output = base32::encode(Alphabet::Rfc4648 { padding: true }, input.as_bytes());
    Ok(output)
}

#[tauri::command]
pub fn base32_decode(input: String) -> Result<String, String> {
    let decoded = base32::decode(Alphabet::Rfc4648 { padding: true }, input.trim())
        .ok_or_else(|| "Base32 解码失败: 无效的 Base32 字符串".to_string())?;
    let output = String::from_utf8(decoded)
        .map_err(|e| format!("UTF-8 解码失败: {}", e))?;
    Ok(output)
}
