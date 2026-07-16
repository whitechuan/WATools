use aes_gcm::{Aes256Gcm, KeyInit, aead::Aead};
use aes_gcm::aead::generic_array::GenericArray;
use chacha20poly1305::ChaCha20Poly1305;
use sha2::{Sha256, Digest};
use rand::RngCore;
use tauri::command;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

#[derive(serde::Serialize)]
pub struct SymmetricEncryptResult {
    pub ciphertext: String,
    pub nonce: String,
    pub algorithm: String,
}

fn derive_key(password: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result);
    key
}

#[command]
pub fn aes_gcm_encrypt(plaintext: String, password: String) -> Result<SymmetricEncryptResult, String> {
    let key_bytes = derive_key(&password);
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = GenericArray::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("AES-GCM 加密失败: {}", e))?;

    Ok(SymmetricEncryptResult {
        ciphertext: BASE64.encode(&ciphertext),
        nonce: BASE64.encode(&nonce_bytes),
        algorithm: "AES-256-GCM".to_string(),
    })
}

#[command]
pub fn aes_gcm_decrypt(ciphertext: String, nonce: String, password: String) -> Result<String, String> {
    if ciphertext.trim().is_empty() {
        return Err("请输入密文".to_string());
    }
    if nonce.trim().is_empty() {
        return Err("请输入Nonce".to_string());
    }
    if password.trim().is_empty() {
        return Err("请输入密码".to_string());
    }

    let key_bytes = derive_key(&password);
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    let nonce_bytes = BASE64.decode(&nonce).map_err(|e| format!("Nonce Base64解码失败: {}", e))?;
    let nonce = GenericArray::from_slice(&nonce_bytes);

    let ciphertext_bytes = BASE64.decode(&ciphertext).map_err(|e| format!("密文Base64解码失败: {}", e))?;

    let plaintext = cipher.decrypt(nonce, ciphertext_bytes.as_ref())
        .map_err(|_| "AES-GCM 解密失败: 密码错误或数据被篡改".to_string())?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8转换失败: {}", e))
}

#[command]
pub fn chacha20_encrypt(plaintext: String, password: String) -> Result<SymmetricEncryptResult, String> {
    use chacha20poly1305::aead::Aead as ChaChaAead;

    let key_bytes = derive_key(&password);
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = ChaCha20Poly1305::new(key);

    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = GenericArray::from_slice(&nonce_bytes);

    let ciphertext = ChaChaAead::encrypt(&cipher, nonce, plaintext.as_bytes())
        .map_err(|e| format!("ChaCha20 加密失败: {}", e))?;

    Ok(SymmetricEncryptResult {
        ciphertext: BASE64.encode(&ciphertext),
        nonce: BASE64.encode(&nonce_bytes),
        algorithm: "ChaCha20-Poly1305".to_string(),
    })
}

#[command]
pub fn chacha20_decrypt(ciphertext: String, nonce: String, password: String) -> Result<String, String> {
    if ciphertext.trim().is_empty() {
        return Err("请输入密文".to_string());
    }
    if nonce.trim().is_empty() {
        return Err("请输入Nonce".to_string());
    }
    if password.trim().is_empty() {
        return Err("请输入密码".to_string());
    }

    use chacha20poly1305::aead::Aead as ChaChaAead;

    let key_bytes = derive_key(&password);
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = ChaCha20Poly1305::new(key);

    let nonce_bytes = BASE64.decode(&nonce).map_err(|e| format!("Nonce Base64解码失败: {}", e))?;
    let nonce = GenericArray::from_slice(&nonce_bytes);

    let ciphertext_bytes = BASE64.decode(&ciphertext).map_err(|e| format!("密文Base64解码失败: {}", e))?;

    let plaintext = ChaChaAead::decrypt(&cipher, nonce, ciphertext_bytes.as_ref())
        .map_err(|_| "ChaCha20 解密失败: 密码错误或数据被篡改".to_string())?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8转换失败: {}", e))
}
