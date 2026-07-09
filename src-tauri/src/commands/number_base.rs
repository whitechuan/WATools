#[tauri::command]
pub fn number_base_convert(input: String, from_base: u32, to_base: u32) -> Result<String, String> {
    // 解析输入（支持大数，使用 u128）
    let value = u128::from_str_radix(input.trim(), from_base)
        .map_err(|e| format!("解析失败: {}", e))?;

    // 转换为目标进制
    match to_base {
        2 => Ok(format!("{:b}", value)),
        8 => Ok(format!("{:o}", value)),
        10 => Ok(format!("{}", value)),
        16 => Ok(format!("{:X}", value)),
        _ => Err(format!("不支持的进制: {}", to_base)),
    }
}
