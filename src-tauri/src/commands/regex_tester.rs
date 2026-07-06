use regex::Regex;
use serde::Serialize;

#[derive(Serialize)]
pub struct RegexGroup {
    pub name: Option<String>,
    pub value: String,
}

#[derive(Serialize)]
pub struct RegexMatch {
    pub text: String,
    pub start: usize,
    pub end: usize,
    pub groups: Vec<RegexGroup>,
}

#[derive(Serialize)]
pub struct RegexResult {
    pub is_valid: bool,
    pub matches: Vec<RegexMatch>,
    pub match_count: usize,
    pub error: Option<String>,
}

#[tauri::command]
pub fn test_regex(pattern: String, text: String, flags: String) -> Result<RegexResult, String> {
    // 构建带 flags 的正则
    let pattern_with_flags = if flags.is_empty() {
        pattern.clone()
    } else {
        format!("(?{}){}", flags, pattern)
    };

    let re = match Regex::new(&pattern_with_flags) {
        Ok(r) => r,
        Err(e) => {
            return Ok(RegexResult {
                is_valid: false,
                matches: vec![],
                match_count: 0,
                error: Some(format!("正则表达式无效: {}", e)),
            });
        }
    };

    let mut matches = Vec::new();
    for cap in re.captures_iter(&text) {
        let m = cap.get(0).unwrap();
        let mut groups = Vec::new();
        for (i, group) in cap.iter().enumerate() {
            if i == 0 {
                continue;
            } // 跳过完整匹配
            if let Some(g) = group {
                groups.push(RegexGroup {
                    name: re.capture_names().nth(i).flatten().map(|s| s.to_string()),
                    value: g.as_str().to_string(),
                });
            }
        }
        matches.push(RegexMatch {
            text: m.as_str().to_string(),
            start: m.start(),
            end: m.end(),
            groups,
        });
    }

    let match_count = matches.len();
    Ok(RegexResult {
        is_valid: true,
        matches,
        match_count,
        error: None,
    })
}
