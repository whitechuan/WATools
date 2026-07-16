use rsa::{RsaPrivateKey, RsaPublicKey, Pkcs1v15Encrypt};
use rsa::pkcs8::{EncodePrivateKey, DecodePrivateKey, LineEnding};
use rsa::pkcs8::spki::{EncodePublicKey, DecodePublicKey};
use sha2::Sha256;
use rand::rngs::OsRng;
use tauri::command;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

#[derive(serde::Serialize)]
pub struct RsaKeyPairResult {
    pub public_key_pem: String,
    pub private_key_pem: String,
    pub key_size: u32,
}

#[command]
pub fn rsa_generate_keypair(bits: u32) -> Result<RsaKeyPairResult, String> {
    let bits_usize = bits as usize;
    let private_key = RsaPrivateKey::new(&mut OsRng, bits_usize)
        .map_err(|e| format!("RSA密钥生成失败: {}", e))?;
    let public_key = RsaPublicKey::from(&private_key);

    let private_pem = private_key.to_pkcs8_pem(LineEnding::LF)
        .map_err(|e| format!("私钥PEM编码失败: {}", e))?;
    let public_pem = public_key.to_public_key_pem(LineEnding::LF)
        .map_err(|e| format!("公钥PEM编码失败: {}", e))?;

    Ok(RsaKeyPairResult {
        public_key_pem: public_pem,
        private_key_pem: private_pem.to_string(),
        key_size: bits,
    })
}

#[command]
pub fn rsa_encrypt(plaintext: String, public_key_pem: String) -> Result<String, String> {
    let public_key = RsaPublicKey::from_public_key_pem(&public_key_pem)
        .map_err(|e| format!("公钥解析失败: {}", e))?;
    let encrypted = public_key.encrypt(&mut OsRng, Pkcs1v15Encrypt, plaintext.as_bytes())
        .map_err(|e| format!("RSA加密失败: {}", e))?;
    Ok(BASE64.encode(&encrypted))
}

#[command]
pub fn rsa_decrypt(ciphertext: String, private_key_pem: String) -> Result<String, String> {
    let private_key = RsaPrivateKey::from_pkcs8_pem(&private_key_pem)
        .map_err(|e| format!("私钥解析失败: {}", e))?;
    let ciphertext_bytes = BASE64.decode(&ciphertext)
        .map_err(|e| format!("Base64解码失败: {}", e))?;
    let decrypted = private_key.decrypt(Pkcs1v15Encrypt, &ciphertext_bytes)
        .map_err(|e| format!("RSA解密失败: {}", e))?;
    String::from_utf8(decrypted).map_err(|e| format!("UTF-8转换失败: {}", e))
}

#[command]
pub fn rsa_sign(message: String, private_key_pem: String) -> Result<String, String> {
    use rsa::pkcs1v15::SigningKey;
    use rsa::signature::{Signer, SignatureEncoding};

    let private_key = RsaPrivateKey::from_pkcs8_pem(&private_key_pem)
        .map_err(|e| format!("私钥解析失败: {}", e))?;
    let signing_key = SigningKey::<Sha256>::new(private_key);
    let signature = signing_key.sign(message.as_bytes());
    Ok(BASE64.encode(&signature.to_vec()))
}

#[command]
pub fn rsa_verify(message: String, signature: String, public_key_pem: String) -> Result<bool, String> {
    use rsa::pkcs1v15::{VerifyingKey, Signature};
    use rsa::signature::Verifier;

    let public_key = RsaPublicKey::from_public_key_pem(&public_key_pem)
        .map_err(|e| format!("公钥解析失败: {}", e))?;
    let verifying_key = VerifyingKey::<Sha256>::new(public_key);
    let sig_bytes = BASE64.decode(&signature)
        .map_err(|e| format!("签名Base64解码失败: {}", e))?;
    let sig = Signature::try_from(sig_bytes.as_slice())
        .map_err(|e| format!("签名格式错误: {}", e))?;

    match verifying_key.verify(message.as_bytes(), &sig) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}
