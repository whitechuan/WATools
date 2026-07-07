# JWT 解析工具使用指南

> 登录认证、API 鉴权、SSO 单点登录——JWT 无处不在。本文教你用 WATools 安全、高效地解析 JWT Token。

## 界面总览

JWT 解析工具采用**双栏布局**，左侧输入 Token，右侧展示解析结果。

<!-- 📸 截图占位：JWT 解析工具完整界面截图 -->
![JWT 解析工具界面](images/screenshot-jwt-parser.png)

## 使用步骤

### 1. 粘贴 Token

在左侧输入框中粘贴 JWT Token。Token 通常形如：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwi...
```

### 2. 点击解析

点击 **「解析」** 按钮，右侧立即展示解码结果。

### 3. 查看结果

结果区域通过 **Tab 切换** 查看三个部分：

<!-- 📸 截图占位：三个 Tab 切换效果截图 -->
![Tab 切换](images/screenshot-jwt-tabs.png)

#### Header（头部）

显示 Token 的元数据：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

| 字段 | 含义 |
|------|------|
| `alg` | 签名算法（如 HS256、RS256） |
| `typ` | Token 类型，通常为 JWT |

#### Payload（载荷）

显示 Token 携带的声明数据：

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516325422
}
```

> 💡 **智能时间转换**：如果 Payload 中包含时间戳字段（`exp`、`iat`、`nbf`），WATools 会自动将它们转换为可读的日期格式，显示在 Payload 区域下方。

<!-- 📸 截图占位：Payload 时间戳自动转换截图 -->
![时间戳自动转换](images/screenshot-jwt-time-fields.png)

#### Signature（签名）

显示签名部分的原始字符串。签名用于验证 Token 完整性，需要配合密钥才能验证。

## 状态栏信息

顶部状态栏显示 Token 的关键状态：

### Token 有效且未过期

```
Token 有效 │ 未过期 · 2025-07-03 23:59:59
```

### Token 已过期

```
Token 有效 │ 已过期 · 2024-01-01 00:00:00
```

### Token 无过期信息

```
Token 有效 │ 无过期信息
```

### 格式无效

```
⚠️ 无效的 JWT 格式：应包含三段以 . 分隔的内容
```

<!-- 📸 截图占位：状态栏不同状态截图（有效/过期/错误） -->
![状态栏](images/screenshot-jwt-status.png)

## 复制功能

每个 Tab 底部都有一个 **📋 复制** 按钮，一键复制对应的 JSON 内容到剪贴板。

## 安全提醒

**为什么要在本地解析 JWT？**

JWT 的 Payload 是 Base64 编码（不是加密！），其中可能包含：
- 用户身份信息（`userId`、`email`）
- 权限角色（`role: admin`）
- 内部系统标识

**将这些信息粘贴到在线解析工具 = 发送到第三方服务器。**

WATools 在本地完成所有解析，Token 数据不出你的电脑。

## 实际使用场景

### 场景 1：排查登录问题

用户反馈无法登录，拿到他的 Token 粘贴到 WATools，检查 `exp` 字段确认 Token 是否已过期。

### 场景 2：确认用户权限

查看 Payload 中的 `role` 或 `permissions` 字段，确认用户是否拥有所需权限。

### 场景 3：调试 SSO 集成

跨系统单点登录时，检查 Token 的 `iss`（签发者）和 `aud`（接收方）是否匹配。

### 场景 4：验证 Token 算法

检查 Header 中的 `alg` 字段，确认是否使用了预期的签名算法。

> ⚠️ **安全警示**：如果你发现 `alg: none`，这是一个严重的安全漏洞——任何人都可以伪造这种 Token。

## 清空操作

点击 **「清空」** 按钮可以同时清除输入框和解析结果。

## 小结

JWT 解析工具通过三段式 Tab 展示、智能时间戳转换和过期状态检测，让你在排查 Token 问题时一目了然。最重要的是——**全部在本地完成，数据安全有保障**。

---

> 📖 其他工具指南：[JSON 格式化](./08-JSON格式化工具完全指南.md) | [时间转换](./09-时间转换工具完全指南.md) | [主题配置](./11-主题切换与个性化配置.md)
>
> ⭐ 觉得好用？来 [GitHub](https://github.com/whitechuan/WATools) / [GitCode](https://gitcode.com/white_chuan/WATools) 点个 Star 支持一下！
