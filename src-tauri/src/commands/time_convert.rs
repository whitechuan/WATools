use serde::Serialize;
use chrono::{DateTime, Utc, Local, NaiveDateTime, TimeZone};

#[derive(Serialize, Clone)]
pub struct TimeConversionResult {
    pub unix_seconds: i64,
    pub unix_millis: i64,
    pub iso8601: String,
    pub rfc2822: String,
    pub local_time: String,
    pub utc_time: String,
    pub relative: String,
}

#[tauri::command]
pub fn convert_time(input: String, from_format: String) -> Result<TimeConversionResult, String> {
    let dt = parse_input(&input, &from_format)?;
    Ok(to_all_formats(dt))
}

#[tauri::command]
pub fn get_current_time() -> TimeConversionResult {
    to_all_formats(Utc::now())
}

fn relative_time(dt: DateTime<Utc>) -> String {
    let now = Utc::now();
    let duration = now.signed_duration_since(dt);

    let seconds = duration.num_seconds();
    let is_future = seconds < 0;
    let abs_seconds = seconds.unsigned_abs();

    if abs_seconds < 60 {
        return "刚刚".to_string();
    }

    let (value, unit) = if abs_seconds < 3600 {
        (abs_seconds / 60, "分钟")
    } else if abs_seconds < 86400 {
        (abs_seconds / 3600, "小时")
    } else if abs_seconds < 2592000 {
        (abs_seconds / 86400, "天")
    } else if abs_seconds < 31536000 {
        (abs_seconds / 2592000, "个月")
    } else {
        (abs_seconds / 31536000, "年")
    };

    if is_future {
        format!("{}{}后", value, unit)
    } else {
        format!("{}{}前", value, unit)
    }
}

fn parse_input(input: &str, from_format: &str) -> Result<DateTime<Utc>, String> {
    match from_format {
        "unix_seconds" => {
            let secs: i64 = input.trim().parse()
                .map_err(|_| "无法解析为 Unix 秒时间戳".to_string())?;
            DateTime::from_timestamp(secs, 0)
                .ok_or_else(|| "无效的 Unix 时间戳".to_string())
        }
        "unix_millis" => {
            let millis: i64 = input.trim().parse()
                .map_err(|_| "无法解析为 Unix 毫秒时间戳".to_string())?;
            DateTime::from_timestamp_millis(millis)
                .ok_or_else(|| "无效的 Unix 毫秒时间戳".to_string())
        }
        "iso8601" => {
            DateTime::parse_from_rfc3339(input.trim())
                .map(|dt| dt.with_timezone(&Utc))
                .map_err(|e| format!("无法解析 ISO 8601 格式: {}", e))
        }
        "rfc2822" => {
            DateTime::parse_from_rfc2822(input.trim())
                .map(|dt| dt.with_timezone(&Utc))
                .map_err(|e| format!("无法解析 RFC 2822 格式: {}", e))
        }
        "local" => {
            let naive = NaiveDateTime::parse_from_str(input.trim(), "%Y-%m-%d %H:%M:%S")
                .map_err(|e| format!("无法解析本地时间格式 (YYYY-MM-DD HH:MM:SS): {}", e))?;
            Local.from_local_datetime(&naive)
                .single()
                .map(|dt| dt.with_timezone(&Utc))
                .ok_or_else(|| "本地时间转换失败（可能存在歧义）".to_string())
        }
        "auto" | _ => {
            auto_parse(input.trim())
        }
    }
}

fn auto_parse(input: &str) -> Result<DateTime<Utc>, String> {
    // 尝试解析为数字（Unix 时间戳）
    if let Ok(num) = input.parse::<i64>() {
        // 判断是秒还是毫秒：大于 1e12 认为是毫秒
        if num > 1_000_000_000_000 {
            if let Some(dt) = DateTime::from_timestamp_millis(num) {
                return Ok(dt);
            }
        } else if let Some(dt) = DateTime::from_timestamp(num, 0) {
            return Ok(dt);
        }
    }

    // 尝试 ISO 8601 / RFC 3339
    if let Ok(dt) = DateTime::parse_from_rfc3339(input) {
        return Ok(dt.with_timezone(&Utc));
    }

    // 尝试 RFC 2822
    if let Ok(dt) = DateTime::parse_from_rfc2822(input) {
        return Ok(dt.with_timezone(&Utc));
    }

    // 尝试本地时间格式
    if let Ok(naive) = NaiveDateTime::parse_from_str(input, "%Y-%m-%d %H:%M:%S") {
        if let Some(dt) = Local.from_local_datetime(&naive).single() {
            return Ok(dt.with_timezone(&Utc));
        }
    }

    // 尝试仅日期格式
    if let Ok(naive) = NaiveDateTime::parse_from_str(&format!("{} 00:00:00", input), "%Y-%m-%d %H:%M:%S") {
        if let Some(dt) = Local.from_local_datetime(&naive).single() {
            return Ok(dt.with_timezone(&Utc));
        }
    }

    Err("无法自动识别时间格式，请指定格式类型".to_string())
}

fn to_all_formats(dt: DateTime<Utc>) -> TimeConversionResult {
    let local_dt = dt.with_timezone(&Local);

    TimeConversionResult {
        unix_seconds: dt.timestamp(),
        unix_millis: dt.timestamp_millis(),
        iso8601: dt.to_rfc3339(),
        rfc2822: dt.to_rfc2822(),
        local_time: local_dt.format("%Y-%m-%d %H:%M:%S").to_string(),
        utc_time: dt.format("%Y-%m-%d %H:%M:%S UTC").to_string(),
        relative: relative_time(dt),
    }
}
