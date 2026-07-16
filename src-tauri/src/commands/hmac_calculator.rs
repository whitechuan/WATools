use hmac::{Hmac, Mac};
use sha2::{Sha256, Sha512};
use tauri::command;

type HmacSha256 = Hmac<Sha256>;
type HmacSha512 = Hmac<Sha512>;

#[derive(serde::Serialize)]
pub struct HmacResult {
    pub hmac_sha256: String,
    pub hmac_sha512: String,
}

#[command]
pub fn calculate_hmac(data: String, key: String) -> Result<HmacResult, String> {
    let mut mac256 = HmacSha256::new_from_slice(key.as_bytes())
        .map_err(|e| format!("HMAC-SHA256 初始化失败: {}", e))?;
    mac256.update(data.as_bytes());
    let result256 = mac256.finalize();
    let hmac_sha256 = hex::encode(result256.into_bytes());

    let mut mac512 = HmacSha512::new_from_slice(key.as_bytes())
        .map_err(|e| format!("HMAC-SHA512 初始化失败: {}", e))?;
    mac512.update(data.as_bytes());
    let result512 = mac512.finalize();
    let hmac_sha512 = hex::encode(result512.into_bytes());

    Ok(HmacResult { hmac_sha256, hmac_sha512 })
}
