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
            commands::hash_calculator::calculate_hash,
            commands::base64_codec::base64_encode,
            commands::base64_codec::base64_decode,
            commands::url_codec::url_encode,
            commands::url_codec::url_decode,
            commands::url_codec::url_parse,
            commands::text_diff::compute_diff,
            commands::uuid_generator::generate_uuid,
            commands::color_converter::convert_color,
            commands::regex_tester::test_regex,
            commands::cron_parser::parse_cron,
            commands::http_client::send_http_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
