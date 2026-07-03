use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct JsonFormatResult {
    pub formatted: String,
    pub stats: JsonStats,
}

#[derive(Serialize)]
pub struct JsonStats {
    pub lines: u32,
    pub keys: u32,
    pub max_depth: u32,
    pub size_bytes: u32,
}

#[derive(Serialize)]
pub struct JsonValidationResult {
    pub valid: bool,
    pub error_message: Option<String>,
    pub error_position: Option<u32>,
    pub suggestions: Vec<String>,
}

#[tauri::command]
pub fn format_json(input: String, indent: u32) -> Result<JsonFormatResult, String> {
    let value: Value = serde_json::from_str(&input)
        .map_err(|e| format!("JSON 解析失败: {}", e))?;

    let formatted = if indent == 0 {
        serde_json::to_string(&value)
            .map_err(|e| format!("JSON 序列化失败: {}", e))?
    } else {
        let indent_str = " ".repeat(indent as usize);
        let formatter = serde_json::ser::PrettyFormatter::with_indent(indent_str.as_bytes());
        let mut buf = Vec::new();
        let mut ser = serde_json::Serializer::with_formatter(&mut buf, formatter);
        use serde::Serialize;
        value.serialize(&mut ser)
            .map_err(|e| format!("JSON 序列化失败: {}", e))?;
        String::from_utf8(buf)
            .map_err(|e| format!("UTF-8 转换失败: {}", e))?
    };

    let lines = formatted.lines().count() as u32;
    let keys = count_keys(&value);
    let max_depth = calculate_depth(&value);
    let size_bytes = formatted.len() as u32;

    Ok(JsonFormatResult {
        formatted,
        stats: JsonStats {
            lines,
            keys,
            max_depth,
            size_bytes,
        },
    })
}

#[tauri::command]
pub fn validate_json(input: String) -> JsonValidationResult {
    match serde_json::from_str::<Value>(&input) {
        Ok(_) => JsonValidationResult {
            valid: true,
            error_message: None,
            error_position: None,
            suggestions: vec![],
        },
        Err(e) => {
            let error_msg = e.to_string();
            let error_position = Some(e.column() as u32);
            let suggestions = generate_suggestions(&error_msg);

            JsonValidationResult {
                valid: false,
                error_message: Some(error_msg),
                error_position,
                suggestions,
            }
        }
    }
}

#[tauri::command]
pub fn minify_json(input: String) -> Result<String, String> {
    let value: Value = serde_json::from_str(&input)
        .map_err(|e| format!("JSON 解析失败: {}", e))?;
    serde_json::to_string(&value)
        .map_err(|e| format!("JSON 序列化失败: {}", e))
}

fn calculate_depth(value: &Value) -> u32 {
    match value {
        Value::Array(arr) => {
            if arr.is_empty() {
                1
            } else {
                1 + arr.iter().map(calculate_depth).max().unwrap_or(0)
            }
        }
        Value::Object(obj) => {
            if obj.is_empty() {
                1
            } else {
                1 + obj.values().map(calculate_depth).max().unwrap_or(0)
            }
        }
        _ => 1,
    }
}

fn count_keys(value: &Value) -> u32 {
    match value {
        Value::Object(obj) => {
            let own_keys = obj.len() as u32;
            let nested_keys: u32 = obj.values().map(count_keys).sum();
            own_keys + nested_keys
        }
        Value::Array(arr) => {
            arr.iter().map(count_keys).sum()
        }
        _ => 0,
    }
}

fn generate_suggestions(error_msg: &str) -> Vec<String> {
    let mut suggestions = Vec::new();
    let msg = error_msg.to_lowercase();

    if msg.contains("key must be a string") || msg.contains("expected `\"`") {
        suggestions.push("键名必须用双引号包裹，例如 \"key\": \"value\"".to_string());
    }
    if msg.contains("trailing comma") || msg.contains("expected value") {
        suggestions.push("可能存在多余的逗号，请检查最后一个元素后是否有逗号".to_string());
    }
    if msg.contains("eof") || msg.contains("unexpected end") {
        suggestions.push("JSON 未正确闭合，请检查括号或引号是否匹配".to_string());
    }
    if msg.contains("expected `,` or `}`") || msg.contains("expected `,` or `]`") {
        suggestions.push("缺少逗号分隔符，或者括号未正确闭合".to_string());
    }
    if msg.contains("invalid number") {
        suggestions.push("数字格式无效，请检查是否有前导零或非法字符".to_string());
    }
    if msg.contains("control character") || msg.contains("invalid escape") {
        suggestions.push("字符串中包含无效的控制字符或转义序列".to_string());
    }

    if suggestions.is_empty() {
        suggestions.push("请检查 JSON 语法是否正确，确保所有括号、引号正确匹配".to_string());
    }

    suggestions
}
