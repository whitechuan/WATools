#[tauri::command]
pub fn html_entity_encode(input: String) -> Result<String, String> {
    Ok(html_escape::encode_safe(&input).into_owned())
}

#[tauri::command]
pub fn html_entity_decode(input: String) -> Result<String, String> {
    Ok(html_escape::decode_html_entities(&input).into_owned())
}
