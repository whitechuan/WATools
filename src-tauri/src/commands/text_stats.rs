use serde::Serialize;

#[derive(Serialize)]
pub struct TextStatsResult {
    pub characters: usize,
    pub characters_no_space: usize,
    pub words: usize,
    pub lines: usize,
    pub paragraphs: usize,
    pub bytes: usize,
}

#[tauri::command]
pub fn text_statistics(input: String) -> Result<TextStatsResult, String> {
    let characters = input.chars().count();
    let characters_no_space = input.chars().filter(|c| !c.is_whitespace()).count();
    let words = input.split_whitespace().count();
    let lines = if input.is_empty() { 0 } else { input.lines().count() };
    let bytes = input.len();

    // 统计段落数：非空行组成的连续段
    let mut paragraphs = 0;
    let mut in_paragraph = false;
    for line in input.lines() {
        if line.trim().is_empty() {
            in_paragraph = false;
        } else if !in_paragraph {
            paragraphs += 1;
            in_paragraph = true;
        }
    }

    Ok(TextStatsResult {
        characters,
        characters_no_space,
        words,
        lines,
        paragraphs,
        bytes,
    })
}

#[tauri::command]
pub fn text_process(input: &str, operation: &str) -> Result<String, String> {
    match operation {
        "uppercase" => Ok(input.to_uppercase()),
        "lowercase" => Ok(input.to_lowercase()),
        "capitalize" => {
            // 每个单词首字母大写
            Ok(input.split_whitespace()
                .map(|w| {
                    let mut chars = w.chars();
                    match chars.next() {
                        Some(c) => c.to_uppercase().to_string() + chars.as_str(),
                        None => String::new(),
                    }
                })
                .collect::<Vec<_>>()
                .join(" "))
        },
        "dedup_lines" => {
            // 去重（保留顺序）
            let mut seen = std::collections::HashSet::new();
            let result: Vec<&str> = input.lines()
                .filter(|line| seen.insert(*line))
                .collect();
            Ok(result.join("\n"))
        },
        "sort_lines" => {
            // 排序
            let mut lines: Vec<&str> = input.lines().collect();
            lines.sort();
            Ok(lines.join("\n"))
        },
        "remove_empty_lines" => {
            // 去空行
            let result: Vec<&str> = input.lines()
                .filter(|line| !line.trim().is_empty())
                .collect();
            Ok(result.join("\n"))
        },
        "trim_lines" => {
            // 每行去首尾空白
            let result: Vec<&str> = input.lines()
                .map(|line| line.trim())
                .collect();
            Ok(result.join("\n"))
        },
        _ => Err(format!("Unknown operation: {}", operation)),
    }
}
