pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::time_convert::convert_time,
            commands::time_convert::get_current_time,
            commands::json_format::format_json,
            commands::json_format::validate_json,
            commands::json_format::minify_json,
            commands::jwt_parse::decode_jwt,
            commands::jwt_parse::verify_jwt_signature,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
