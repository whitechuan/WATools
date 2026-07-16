use rand::Rng;
use tauri::command;

#[derive(serde::Serialize)]
pub struct PasswordStrengthResult {
    pub score: u8,
    pub crack_time: String,
    pub feedback: Vec<String>,
}

#[command]
pub fn check_password_strength(password: String) -> Result<PasswordStrengthResult, String> {
    let estimate = zxcvbn::zxcvbn(&password, &[]);

    let score: u8 = match estimate.score() {
        zxcvbn::Score::Zero => 0,
        zxcvbn::Score::One => 1,
        zxcvbn::Score::Two => 2,
        zxcvbn::Score::Three => 3,
        zxcvbn::Score::Four => 4,
        _ => 0,
    };

    let crack_time = format!(
        "{}",
        estimate
            .crack_times()
            .offline_slow_hashing_1e4_per_second()
    );

    let mut feedback = Vec::new();
    if let Some(fb) = estimate.feedback() {
        if let Some(warning) = fb.warning() {
            feedback.push(format!("⚠️ {}", warning));
        }
        for suggestion in fb.suggestions() {
            feedback.push(format!("💡 {}", suggestion));
        }
    }

    if feedback.is_empty() {
        feedback.push("✅ 密码强度良好".to_string());
    }

    Ok(PasswordStrengthResult {
        score,
        crack_time,
        feedback,
    })
}

#[command]
pub fn generate_password(
    length: u32,
    uppercase: bool,
    lowercase: bool,
    digits: bool,
    symbols: bool,
) -> Result<String, String> {
    let mut charset = String::new();
    if uppercase {
        charset.push_str("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }
    if lowercase {
        charset.push_str("abcdefghijklmnopqrstuvwxyz");
    }
    if digits {
        charset.push_str("0123456789");
    }
    if symbols {
        charset.push_str("!@#$%^&*()-_=+[]{}|;:,.<>?");
    }

    if charset.is_empty() {
        return Err("请至少选择一种字符类型".to_string());
    }

    let chars: Vec<char> = charset.chars().collect();
    let mut rng = rand::thread_rng();
    let password: String = (0..length)
        .map(|_| chars[rng.gen_range(0..chars.len())])
        .collect();

    Ok(password)
}
