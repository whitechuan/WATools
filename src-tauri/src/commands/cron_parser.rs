use cron::Schedule;
use chrono::Local;
use serde::Serialize;
use std::str::FromStr;

#[derive(Serialize)]
pub struct CronResult {
    pub is_valid: bool,
    pub description: String,
    pub next_runs: Vec<String>,
    pub error: Option<String>,
}

#[tauri::command]
pub fn parse_cron(expression: String) -> Result<CronResult, String> {
    // 如果用户输入 5 字段标准 cron，自动补 "0 " 秒字段
    let parts: Vec<&str> = expression.split_whitespace().collect();
    let expr = if parts.len() == 5 {
        format!("0 {}", expression)
    } else {
        expression.clone()
    };

    let schedule = match Schedule::from_str(&expr) {
        Ok(s) => s,
        Err(e) => {
            return Ok(CronResult {
                is_valid: false,
                description: String::new(),
                next_runs: vec![],
                error: Some(format!("Cron 表达式无效: {}", e)),
            });
        }
    };

    // 生成下 10 次执行时间
    let next_runs: Vec<String> = schedule
        .upcoming(Local)
        .take(10)
        .map(|t| t.format("%Y-%m-%d %H:%M:%S").to_string())
        .collect();

    // 简单的描述生成
    let description = generate_description(&expr);

    Ok(CronResult {
        is_valid: true,
        description,
        next_runs,
        error: None,
    })
}

fn generate_description(expr: &str) -> String {
    let parts: Vec<&str> = expr.split_whitespace().collect();
    if parts.len() < 6 {
        return format!("Cron: {}", expr);
    }

    let sec = parts[0];
    let min = parts[1];
    let hour = parts[2];
    let dom = parts[3];
    let month = parts[4];
    let dow = parts[5];

    let mut desc = String::new();

    if sec == "0" && min == "*" && hour == "*" {
        desc.push_str("每分钟");
    } else if sec == "0" && min != "*" && hour == "*" {
        desc.push_str(&format!("每小时第 {} 分", min));
    } else if sec == "0" && hour != "*" && min != "*" {
        desc.push_str(&format!("每天 {}:{}", hour, min));
    } else {
        desc.push_str(&format!("秒:{} 分:{} 时:{}", sec, min, hour));
    }

    if dom != "*" && dom != "?" {
        desc.push_str(&format!(" 日:{}", dom));
    }
    if month != "*" {
        desc.push_str(&format!(" 月:{}", month));
    }
    if dow != "*" && dow != "?" {
        desc.push_str(&format!(" 周:{}", dow));
    }

    desc
}
