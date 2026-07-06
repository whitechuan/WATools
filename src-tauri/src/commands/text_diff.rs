use similar::{ChangeTag, TextDiff as SimTextDiff};
use serde::Serialize;

#[derive(Serialize)]
pub struct DiffLine {
    pub tag: String,
    pub old_index: Option<usize>,
    pub new_index: Option<usize>,
    pub value: String,
}

#[derive(Serialize)]
pub struct DiffStats {
    pub additions: usize,
    pub deletions: usize,
    pub unchanged: usize,
}

#[derive(Serialize)]
pub struct DiffResult {
    pub lines: Vec<DiffLine>,
    pub stats: DiffStats,
}

#[tauri::command]
pub fn compute_diff(old_text: String, new_text: String) -> Result<DiffResult, String> {
    let diff = SimTextDiff::from_lines(&old_text, &new_text);

    let mut lines = Vec::new();
    let mut old_idx: usize = 0;
    let mut new_idx: usize = 0;
    let mut additions = 0;
    let mut deletions = 0;
    let mut unchanged = 0;

    for change in diff.iter_all_changes() {
        let (tag, old_index, new_index) = match change.tag() {
            ChangeTag::Equal => {
                old_idx += 1;
                new_idx += 1;
                unchanged += 1;
                ("equal".to_string(), Some(old_idx), Some(new_idx))
            }
            ChangeTag::Insert => {
                new_idx += 1;
                additions += 1;
                ("insert".to_string(), None, Some(new_idx))
            }
            ChangeTag::Delete => {
                old_idx += 1;
                deletions += 1;
                ("delete".to_string(), Some(old_idx), None)
            }
        };

        lines.push(DiffLine {
            tag,
            old_index,
            new_index,
            value: change.value().to_string(),
        });
    }

    Ok(DiffResult {
        lines,
        stats: DiffStats {
            additions,
            deletions,
            unchanged,
        },
    })
}
