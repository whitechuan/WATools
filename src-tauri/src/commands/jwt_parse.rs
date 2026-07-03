use serde::Serialize;
use serde_json::Value;
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use chrono::{DateTime, Utc};

#[derive(Serialize)]
pub struct JwtDecodeResult {
    pub header: Value,
    pub payload: Value,
    pub signature: String,
    pub is_expired: bool,
    pub expires_at: Option<String>,
    pub issued_at: Option<String>,
}

#[derive(Serialize)]
pub struct JwtVerifyResult {
    pub valid: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub fn decode_jwt(token: String) -> Result<JwtDecodeResult, String> {
    let parts: Vec<&str> = token.trim().split('.').collect();
    if parts.len() != 3 {
        return Err("无效的 JWT 格式：JWT 应包含三个由 '.' 分隔的部分".to_string());
    }

    // 解码 header
    let header_bytes = URL_SAFE_NO_PAD.decode(parts[0])
        .map_err(|e| format!("Header Base64 解码失败: {}", e))?;
    let header: Value = serde_json::from_slice(&header_bytes)
        .map_err(|e| format!("Header JSON 解析失败: {}", e))?;

    // 解码 payload
    let payload_bytes = URL_SAFE_NO_PAD.decode(parts[1])
        .map_err(|e| format!("Payload Base64 解码失败: {}", e))?;
    let payload: Value = serde_json::from_slice(&payload_bytes)
        .map_err(|e| format!("Payload JSON 解析失败: {}", e))?;

    // 签名保持 base64 原始形式
    let signature = parts[2].to_string();

    // 检查过期时间
    let is_expired = if let Some(exp) = payload.get("exp").and_then(|v| v.as_i64()) {
        let now = Utc::now().timestamp();
        now > exp
    } else {
        false
    };

    // 提取 exp 时间
    let expires_at = payload.get("exp")
        .and_then(|v| v.as_i64())
        .and_then(|ts| DateTime::from_timestamp(ts, 0))
        .map(|dt: DateTime<Utc>| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string());

    // 提取 iat 时间
    let issued_at = payload.get("iat")
        .and_then(|v| v.as_i64())
        .and_then(|ts| DateTime::from_timestamp(ts, 0))
        .map(|dt: DateTime<Utc>| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string());

    Ok(JwtDecodeResult {
        header,
        payload,
        signature,
        is_expired,
        expires_at,
        issued_at,
    })
}

#[tauri::command]
pub fn verify_jwt_signature(token: String, secret: String, algorithm: String) -> Result<JwtVerifyResult, String> {
    let alg = match algorithm.to_uppercase().as_str() {
        "HS256" => Algorithm::HS256,
        "HS384" => Algorithm::HS384,
        "HS512" => Algorithm::HS512,
        _ => return Err(format!("不支持的算法: {}，目前仅支持 HS256、HS384、HS512", algorithm)),
    };

    let key = DecodingKey::from_secret(secret.as_bytes());
    let mut validation = Validation::new(alg);
    // 不验证 exp 等 claim，仅验证签名
    validation.validate_exp = false;
    validation.validate_aud = false;
    validation.required_spec_claims.clear();

    match decode::<Value>(&token, &key, &validation) {
        Ok(_) => Ok(JwtVerifyResult {
            valid: true,
            error: None,
        }),
        Err(e) => Ok(JwtVerifyResult {
            valid: false,
            error: Some(format!("签名验证失败: {}", e)),
        }),
    }
}
