# JWT 解析全解析：从原理到 Rust 实现

> JWT 无处不在——登录认证、API 鉴权、SSO 单点登录。但你真的理解它是怎么工作的吗？本文从原理出发，用 Rust 实现一个 JWT 解析器，并展示在 WATools 中的实际应用。

## JWT 是什么？

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输声明信息。它本质上是一个**经过签名的 JSON 对象的 Base64 编码字符串**。

一个典型的 JWT 长这样：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## JWT 的三段式结构

JWT 由三个部分组成，用 `.` 分隔：

```
Header.Payload.Signature
```

### 1. Header（头部）

包含 Token 类型和签名算法：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload（载荷）

包含声明（Claims），即实际传输的数据：

```json
{
  "userId": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

**标准声明字段：**

| 字段 | 全称 | 说明 |
|------|------|------|
| `iss` | Issuer | 签发者 |
| `sub` | Subject | 主题（通常为用户 ID） |
| `aud` | Audience | 接收方 |
| `exp` | Expiration | 过期时间（Unix 时间戳） |
| `iat` | Issued At | 签发时间 |
| `nbf` | Not Before | 生效时间 |

### 3. Signature（签名）

用于验证消息完整性，防止篡改：

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## 为什么需要本地解析 JWT？

这是最关键的问题——**JWT 中可能包含敏感信息**。

Payload 只是 Base64 编码，**不是加密**！任何人都可以解码查看内容。但问题在于，当你把 JWT 粘贴到在线工具时，Token 本身（包括签名信息）被发送到了第三方。

在生产环境中，一个 JWT 可能包含：
- 用户身份信息
- 权限角色（`role: admin`）
- 内部系统标识

**这些信息不应该离开你的电脑。**

## Rust 实现 JWT 解析

在 WATools 中，JWT 解析由 Rust 后端完成，确保高性能和安全性。

### 核心实现

```rust
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use serde_json::Value;

pub struct JwtParts {
    pub header: Value,
    pub payload: Value,
    pub signature: String,
}

pub fn parse_jwt(token: &str) -> Result<JwtParts, String> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err("无效的 JWT 格式：应包含三段以 . 分隔的内容".into());
    }

    // 解码 Header
    let header_bytes = URL_SAFE_NO_PAD.decode(parts[0])
        .map_err(|e| format!("Header 解码失败: {}", e))?;
    let header: Value = serde_json::from_slice(&header_bytes)
        .map_err(|e| format!("Header JSON 解析失败: {}", e))?;

    // 解码 Payload
    let payload_bytes = URL_SAFE_NO_PAD.decode(parts[1])
        .map_err(|e| format!("Payload 解码失败: {}", e))?;
    let payload: Value = serde_json::from_slice(&payload_bytes)
        .map_err(|e| format!("Payload JSON 解析失败: {}", e))?;

    // Signature 保留原始字符串
    let signature = parts[2].to_string();

    Ok(JwtParts { header, payload, signature })
}
```

### 注册为 Tauri 命令

```rust
#[tauri::command]
pub fn jwt_parse(token: String) -> Result<JwtParts, String> {
    parse_jwt(&token)
}
```

### 前端调用

```typescript
import { invoke } from '@tauri-apps/api/core'

interface JwtParts {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

const result = await invoke<JwtParts>('jwt_parse', { token })
```

## 前端展示设计

WATools 的 JWT 解析页面采用三段式卡片布局：

```
┌─────────────────────────────────────┐
│         📥 输入 Token               │
│  ┌─────────────────────────────────┐│
│  │ 粘贴 JWT Token 到这里...        ││
│  └─────────────────────────────────┘│
│              [解析]                  │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Header  │ │ Payload │ │ Sign  │ │
│  │         │ │         │ │       │ │
│  │ alg:    │ │ sub:    │ │ xxxxx │ │
│  │ HS256   │ │ 12345   │ │       │ │
│  │ typ:JWT │ │ name:   │ │       │ │
│  │         │ │ John    │ │       │ │
│  └─────────┘ └─────────┘ └───────┘ │
└─────────────────────────────────────┘
```

每个字段都会被智能识别和标注——标准字段（如 `exp`、`iat`）自动翻译为可读名称，时间戳字段自动转换为日期格式。

## JWT 常见算法

| 算法 | 全称 | 类型 |
|------|------|------|
| HS256 | HMAC-SHA256 | 对称加密 |
| RS256 | RSA-SHA256 | 非对称加密 |
| ES256 | ECDSA-SHA256 | 椭圆曲线 |
| PS256 | RSA-PSS-SHA256 | 概率签名 |
| none | 无签名 | ⚠️ 不应用于生产 |

> ⚠️ **安全提醒**：`alg: none` 的 JWT 不包含签名验证，任何内容都可以被伪造。如果你的系统接受这种 Token，那是一个严重的安全漏洞。

## 总结

JWT 解析看似简单（Base64 解码 + JSON 解析），但在实际开发中非常重要：

1. **理解结构**：知道 Header、Payload、Signature 各部分的含义
2. **安全意识**：敏感 Token 不要发送到在线工具
3. **本地优先**：用 WATools 这样的本地工具，数据不出你的电脑

想查看完整的 JWT 解析实现源码？来 [GitHub](https://github.com/whitechuan/WATools) / [GitCode](https://gitcode.com/white_chuan/WATools) Star 一下项目，获取全部源码！
