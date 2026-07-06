use percent_encoding::{utf8_percent_encode, percent_decode_str, NON_ALPHANUMERIC};
use serde::Serialize;
use url::Url;

#[derive(Serialize)]
pub struct UrlEncodeResult {
    pub encoded: String,
}

#[derive(Serialize)]
pub struct UrlDecodeResult {
    pub decoded: String,
}

#[derive(Serialize)]
pub struct QueryParam {
    pub key: String,
    pub value: String,
}

#[derive(Serialize)]
pub struct UrlParseResult {
    pub scheme: String,
    pub host: String,
    pub port: String,
    pub path: String,
    pub query: String,
    pub fragment: String,
    pub query_params: Vec<QueryParam>,
}

#[tauri::command]
pub fn url_encode(input: String) -> Result<UrlEncodeResult, String> {
    let encoded = utf8_percent_encode(&input, NON_ALPHANUMERIC).to_string();
    Ok(UrlEncodeResult { encoded })
}

#[tauri::command]
pub fn url_decode(input: String) -> Result<UrlDecodeResult, String> {
    let decoded = percent_decode_str(&input)
        .decode_utf8()
        .map_err(|e| format!("URL 解码失败: {}", e))?
        .to_string();
    Ok(UrlDecodeResult { decoded })
}

#[tauri::command]
pub fn url_parse(input: String) -> Result<UrlParseResult, String> {
    let url = Url::parse(&input).map_err(|e| format!("URL 解析失败: {}", e))?;
    let query_params: Vec<QueryParam> = url.query_pairs()
        .map(|(k, v)| QueryParam { key: k.to_string(), value: v.to_string() })
        .collect();
    
    Ok(UrlParseResult {
        scheme: url.scheme().to_string(),
        host: url.host_str().unwrap_or("").to_string(),
        port: url.port().map(|p| p.to_string()).unwrap_or_default(),
        path: url.path().to_string(),
        query: url.query().unwrap_or("").to_string(),
        fragment: url.fragment().unwrap_or("").to_string(),
        query_params,
    })
}
