use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct UuidResult {
    pub values: Vec<String>,
    pub version: String,
}

#[tauri::command]
pub fn generate_uuid(version: String, count: usize) -> Result<UuidResult, String> {
    let count = count.min(100); // 限制最大数量
    let values: Vec<String> = match version.as_str() {
        "v4" => (0..count).map(|_| Uuid::new_v4().to_string()).collect(),
        "v7" => (0..count).map(|_| Uuid::now_v7().to_string()).collect(),
        _ => return Err(format!("不支持的 UUID 版本: {}", version)),
    };
    Ok(UuidResult { values, version })
}
