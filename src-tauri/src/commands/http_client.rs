use reqwest::blocking::{Client, RequestBuilder};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde::{Deserialize, Serialize};
use std::time::Instant;

#[derive(Deserialize)]
pub struct HttpHeader {
    pub key: String,
    pub value: String,
}

#[derive(Serialize)]
pub struct HttpResponseHeader {
    pub key: String,
    pub value: String,
}

#[derive(Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<HttpResponseHeader>,
    pub body: String,
    pub elapsed_ms: u64,
    pub size_bytes: usize,
}

#[tauri::command]
pub fn send_http_request(
    url: String,
    method: String,
    headers: Vec<HttpHeader>,
    body: String,
) -> Result<HttpResponse, String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("创建客户端失败: {}", e))?;

    let mut header_map = HeaderMap::new();
    for h in &headers {
        if !h.key.is_empty() {
            let name = HeaderName::from_bytes(h.key.as_bytes())
                .map_err(|e| format!("无效的 Header 名称 '{}': {}", h.key, e))?;
            let value = HeaderValue::from_str(&h.value)
                .map_err(|e| format!("无效的 Header 值 '{}': {}", h.value, e))?;
            header_map.insert(name, value);
        }
    }

    let request: RequestBuilder = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        "HEAD" => client.head(&url),
        _ => return Err(format!("不支持的 HTTP 方法: {}", method)),
    };

    let request = request.headers(header_map);
    let request = if !body.is_empty() && method.to_uppercase() != "GET" {
        request.body(body)
    } else {
        request
    };

    let start = Instant::now();
    let response = request.send().map_err(|e| format!("请求失败: {}", e))?;
    let elapsed_ms = start.elapsed().as_millis() as u64;

    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();
    
    let resp_headers: Vec<HttpResponseHeader> = response.headers()
        .iter()
        .map(|(k, v)| HttpResponseHeader {
            key: k.to_string(),
            value: v.to_str().unwrap_or("").to_string(),
        })
        .collect();

    let body_text = response.text().map_err(|e| format!("读取响应体失败: {}", e))?;
    let size_bytes = body_text.len();

    Ok(HttpResponse {
        status,
        status_text,
        headers: resp_headers,
        body: body_text,
        elapsed_ms,
        size_bytes,
    })
}
