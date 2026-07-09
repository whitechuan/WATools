#[tauri::command]
pub fn ascii_to_text(input: String) -> Result<String, String> {
    let mut result = String::new();
    for part in input.split_whitespace() {
        let code: u32 = part
            .parse()
            .map_err(|_| format!("无效的 ASCII 码: {}", part))?;
        let ch = char::from_u32(code)
            .ok_or_else(|| format!("无效的 Unicode 码点: {}", code))?;
        result.push(ch);
    }
    Ok(result)
}

#[tauri::command]
pub fn text_to_ascii(input: String) -> Result<String, String> {
    let result: Vec<String> = input.chars().map(|c| (c as u32).to_string()).collect();
    Ok(result.join(" "))
}

#[tauri::command]
pub fn text_to_hex_ascii(input: String) -> Result<String, String> {
    let result: Vec<String> = input.chars().map(|c| format!("{:02x}", c as u32)).collect();
    Ok(result.join(" "))
}
