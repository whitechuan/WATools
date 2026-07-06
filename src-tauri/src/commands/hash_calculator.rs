use md5::Md5;
use sha1::Sha1;
use sha2::{Sha256, Sha512, Digest};
use serde::Serialize;

#[derive(Serialize)]
pub struct HashResult {
    pub md5: String,
    pub sha1: String,
    pub sha256: String,
    pub sha512: String,
}

#[tauri::command]
pub fn calculate_hash(input: String) -> Result<HashResult, String> {
    let mut md5_hasher = Md5::new();
    md5_hasher.update(input.as_bytes());
    let md5_hash = hex::encode(md5_hasher.finalize());

    let mut sha1_hasher = Sha1::new();
    sha1_hasher.update(input.as_bytes());
    let sha1_hash = hex::encode(sha1_hasher.finalize());

    let mut sha256_hasher = Sha256::new();
    sha256_hasher.update(input.as_bytes());
    let sha256_hash = hex::encode(sha256_hasher.finalize());

    let mut sha512_hasher = Sha512::new();
    sha512_hasher.update(input.as_bytes());
    let sha512_hash = hex::encode(sha512_hasher.finalize());

    Ok(HashResult {
        md5: md5_hash,
        sha1: sha1_hash,
        sha256: sha256_hash,
        sha512: sha512_hash,
    })
}
