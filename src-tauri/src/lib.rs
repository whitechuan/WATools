pub mod commands;

use tauri::{
    tray::{TrayIconBuilder, MouseButton, MouseButtonState, TrayIconEvent},
    menu::{Menu, MenuItem},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // 获取主窗口引用
            let window = app.get_webview_window("main").unwrap();
            let win = window.clone();

            // 关闭窗口时最小化到托盘
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = win.hide();
                }
            });

            // 创建托盘菜单
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

            // 构建系统托盘
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(move |app, event| {
                    let window = app.get_webview_window("main").unwrap();
                    match event.id.as_ref() {
                        "show" => {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                        "hide" => {
                            let _ = window.hide();
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(move |tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
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
            commands::html_entity::html_entity_encode,
            commands::html_entity::html_entity_decode,
            commands::base32_codec::base32_encode,
            commands::base32_codec::base32_decode,
            commands::text_stats::text_statistics,
            commands::text_stats::text_process,
            commands::ascii_convert::ascii_to_text,
            commands::ascii_convert::text_to_ascii,
            commands::ascii_convert::text_to_hex_ascii,
            commands::markdown_preview::markdown_to_html,
            commands::number_base::number_base_convert,
            commands::hex_codec::hex_encode,
            commands::hex_codec::hex_decode,
            commands::hmac_calculator::calculate_hmac,
            commands::symmetric_crypto::aes_gcm_encrypt,
            commands::symmetric_crypto::aes_gcm_decrypt,
            commands::symmetric_crypto::chacha20_encrypt,
            commands::symmetric_crypto::chacha20_decrypt,
            commands::asymmetric_crypto::rsa_generate_keypair,
            commands::asymmetric_crypto::rsa_encrypt,
            commands::asymmetric_crypto::rsa_decrypt,
            commands::asymmetric_crypto::rsa_sign,
            commands::asymmetric_crypto::rsa_verify,
            commands::password_generator::check_password_strength,
            commands::password_generator::generate_password,
            commands::password_vault::vault_set_master_password,
            commands::password_vault::vault_verify_master_password,
            commands::password_vault::vault_encrypt_password,
            commands::password_vault::vault_decrypt_password,
            commands::password_vault::vault_check_strength,
            commands::password_vault::vault_change_master_password,
            commands::password_vault::vault_generate_recovery_code,
            commands::password_vault::vault_verify_recovery_code,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
