use aes_gcm::{Aes256Gcm, KeyInit, aead::Aead};
use aes_gcm::aead::generic_array::GenericArray;
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, PasswordHash, rand_core::OsRng};
use rand::RngCore;
use zeroize::Zeroize;
use tauri::command;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

#[derive(serde::Serialize)]
pub struct VaultEncryptResult {
    pub ciphertext: String,
    pub nonce: String,
}

#[derive(serde::Serialize)]
pub struct PasswordStrengthResult {
    pub score: u8,
    pub crack_time: String,
    pub feedback: Vec<String>,
}

#[derive(serde::Deserialize)]
pub struct ReencryptEntry {
    pub id: i64,
    pub ciphertext: String,
    pub nonce: String,
}

#[derive(serde::Serialize)]
pub struct ReencryptedEntry {
    pub id: i64,
    pub ciphertext: String,
    pub nonce: String,
}

#[derive(serde::Serialize)]
pub struct ChangePasswordResult {
    pub new_hash: String,
    pub reencrypted: Vec<ReencryptedEntry>,
}

#[derive(serde::Serialize)]
pub struct RecoveryCodeResult {
    pub code: String,
    pub code_hash: String,
}

/// 设置主密码 - 使用 Argon2id 生成哈希
#[command]
pub fn vault_set_master_password(password: String) -> Result<String, String> {
    if password.len() < 8 {
        return Err("主密码至少需要8个字符".to_string());
    }

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2.hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("密码哈希失败: {}", e))?;

    Ok(hash.to_string())
}

/// 验证主密码
#[command]
pub fn vault_verify_master_password(password: String, hash: String) -> Result<bool, String> {
    let parsed_hash = PasswordHash::new(&hash)
        .map_err(|e| format!("哈希解析失败: {}", e))?;

    let argon2 = Argon2::default();
    Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
}

/// 加密密码
#[command]
pub fn vault_encrypt_password(plaintext: String, master_password: String) -> Result<VaultEncryptResult, String> {
    if plaintext.is_empty() {
        return Err("密码不能为空".to_string());
    }
    if master_password.is_empty() {
        return Err("主密码不能为空".to_string());
    }

    // 使用 Argon2 从主密码派生 AES 密钥
    let mut key = derive_encryption_key(&master_password)?;

    let cipher_key = GenericArray::from_slice(&key);
    let cipher = Aes256Gcm::new(cipher_key);

    // 随机生成 12 字节 nonce
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = GenericArray::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("加密失败: {}", e))?;

    // 清零密钥
    key.zeroize();

    Ok(VaultEncryptResult {
        ciphertext: BASE64.encode(&ciphertext),
        nonce: BASE64.encode(&nonce_bytes),
    })
}

/// 解密密码
#[command]
pub fn vault_decrypt_password(ciphertext: String, nonce: String, master_password: String) -> Result<String, String> {
    if ciphertext.is_empty() || nonce.is_empty() {
        return Err("密文和Nonce不能为空".to_string());
    }
    if master_password.is_empty() {
        return Err("主密码不能为空".to_string());
    }

    let mut key = derive_encryption_key(&master_password)?;

    let cipher_key = GenericArray::from_slice(&key);
    let cipher = Aes256Gcm::new(cipher_key);

    let nonce_bytes = BASE64.decode(&nonce)
        .map_err(|e| format!("Nonce解码失败: {}", e))?;
    let nonce_arr = GenericArray::from_slice(&nonce_bytes);

    let ciphertext_bytes = BASE64.decode(&ciphertext)
        .map_err(|e| format!("密文解码失败: {}", e))?;

    let plaintext = cipher.decrypt(nonce_arr, ciphertext_bytes.as_ref())
        .map_err(|_| "解密失败: 主密码错误或数据被篡改".to_string())?;

    // 清零密钥
    key.zeroize();

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8转换失败: {}", e))
}

/// 检测密码强度（复用 zxcvbn）
#[command]
pub fn vault_check_strength(password: String) -> Result<PasswordStrengthResult, String> {
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
        estimate.crack_times().offline_slow_hashing_1e4_per_second()
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

    Ok(PasswordStrengthResult { score, crack_time, feedback })
}

/// 重设主密码：验证旧密码，生成新哈希，重新加密所有密码
#[command]
pub fn vault_change_master_password(
    old_password: String,
    new_password: String,
    old_hash: String,
    encrypted_entries: Vec<ReencryptEntry>,
) -> Result<ChangePasswordResult, String> {
    // 1. 验证旧密码
    let parsed_hash = PasswordHash::new(&old_hash)
        .map_err(|e| format!("哈希解析失败: {}", e))?;
    let argon2 = Argon2::default();
    if argon2.verify_password(old_password.as_bytes(), &parsed_hash).is_err() {
        return Err("当前主密码验证失败".to_string());
    }

    // 2. 验证新密码强度
    if new_password.len() < 8 {
        return Err("新密码至少需要8个字符".to_string());
    }

    // 3. 为新密码生成哈希
    let salt = SaltString::generate(&mut OsRng);
    let new_hash = argon2.hash_password(new_password.as_bytes(), &salt)
        .map_err(|e| format!("新密码哈希失败: {}", e))?
        .to_string();

    // 4. 逐条解密（旧密码）再加密（新密码）
    let mut old_key = derive_encryption_key(&old_password)?;
    let mut new_key = derive_encryption_key(&new_password)?;

    let old_cipher_key = GenericArray::from_slice(&old_key);
    let old_cipher = Aes256Gcm::new(old_cipher_key);

    let new_cipher_key = GenericArray::from_slice(&new_key);
    let new_cipher = Aes256Gcm::new(new_cipher_key);

    let mut reencrypted = Vec::new();
    for entry in encrypted_entries {
        // 解密
        let nonce_bytes = BASE64.decode(&entry.nonce)
            .map_err(|e| format!("Nonce解码失败(id={}): {}", entry.id, e))?;
        let nonce_arr = GenericArray::from_slice(&nonce_bytes);
        let ciphertext_bytes = BASE64.decode(&entry.ciphertext)
            .map_err(|e| format!("密文解码失败(id={}): {}", entry.id, e))?;
        let plaintext = old_cipher.decrypt(nonce_arr, ciphertext_bytes.as_ref())
            .map_err(|_| format!("解密失败(id={}): 旧主密码错误或数据被篡改", entry.id))?;

        // 重新加密
        let mut new_nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut new_nonce_bytes);
        let new_nonce = GenericArray::from_slice(&new_nonce_bytes);
        let new_ciphertext = new_cipher.encrypt(new_nonce, plaintext.as_ref())
            .map_err(|e| format!("重新加密失败(id={}): {}", entry.id, e))?;

        reencrypted.push(ReencryptedEntry {
            id: entry.id,
            ciphertext: BASE64.encode(&new_ciphertext),
            nonce: BASE64.encode(&new_nonce_bytes),
        });
    }

    // 清零密钥
    old_key.zeroize();
    new_key.zeroize();

    Ok(ChangePasswordResult { new_hash, reencrypted })
}

/// 生成恢复码（16位大写字母+数字，格式 XXXX-XXXX-XXXX-XXXX）
#[command]
pub fn vault_generate_recovery_code() -> Result<RecoveryCodeResult, String> {
    let charset: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mut rng = rand::thread_rng();
    let mut code_chars = Vec::with_capacity(16);

    for _ in 0..16 {
        let mut byte = [0u8; 1];
        rng.fill_bytes(&mut byte);
        let idx = (byte[0] as usize) % charset.len();
        code_chars.push(charset[idx] as char);
    }

    // 格式化为 XXXX-XXXX-XXXX-XXXX
    let code = format!(
        "{}-{}-{}-{}",
        code_chars[0..4].iter().collect::<String>(),
        code_chars[4..8].iter().collect::<String>(),
        code_chars[8..12].iter().collect::<String>(),
        code_chars[12..16].iter().collect::<String>(),
    );

    // 生成哈希（用于存储验证）
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let code_hash = argon2.hash_password(code.replace('-', "").as_bytes(), &salt)
        .map_err(|e| format!("恢复码哈希失败: {}", e))?
        .to_string();

    Ok(RecoveryCodeResult { code, code_hash })
}

/// 验证恢复码
#[command]
pub fn vault_verify_recovery_code(code: String, code_hash: String) -> Result<bool, String> {
    let clean_code = code.replace('-', "").to_uppercase();
    let parsed_hash = PasswordHash::new(&code_hash)
        .map_err(|e| format!("恢复码哈希解析失败: {}", e))?;
    let argon2 = Argon2::default();
    Ok(argon2.verify_password(clean_code.as_bytes(), &parsed_hash).is_ok())
}

/// 内部辅助函数：从主密码派生32字节 AES 密钥
fn derive_encryption_key(master_password: &str) -> Result<[u8; 32], String> {
    // 使用固定 salt（基于应用标识），确保同一主密码总是产生相同密钥
    let salt = b"WATools-Vault-v1"; // 16 字节固定 salt
    let mut key = [0u8; 32];

    Argon2::default()
        .hash_password_into(master_password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("密钥派生失败: {}", e))?;

    Ok(key)
}
