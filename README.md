<div align="center">

```
 __        ___      _____           _     
 \ \      / / \    |_   _|__   ___ | |___ 
  \ \ /\ / / _ \     | |/ _ \ / _ \| / __|
   \ V  V / ___ \    | | (_) | (_) | \__ \
    \_/\_/_/   \_\   |_|\___/ \___/|_|___/
```

### 基于 Tauri 2 + Vue 3 构建的桌面开发者工具箱

**[English](./README-EN.md)** • **简体中文**

[安装](#-安装) • [快速开始](#-快速开始) • [功能特性](#-功能特性) • [架构](#-架构) • [主题](#-主题) • [文档](#-文档) • [贡献指南](#-贡献指南)

---

![version](https://img.shields.io/badge/version-1.0-blue)
![tauri](https://img.shields.io/badge/tauri-2.0-orange)
![vue](https://img.shields.io/badge/vue-3.4-green)
![rust](https://img.shields.io/badge/rust-1.75+-red)
![license](https://img.shields.io/badge/license-Apache2.0-blue)
![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
[![GitCode Stars](https://img.shields.io/badge/GitCode-⭐%20Star-orange)](https://gitcode.com/white_chuan/WATools)
[![AtomGitStars](https://atomgit.com/white_chuan/WATools/star/badge.svg)](https://atomgit.com/white_chuan/WATools)
[![GitHub Stars](https://img.shields.io/github/stars/whitechuan/WATools?style=social)](https://github.com/whitechuan/WATools)

> 💖 如果这个项目对你有帮助，请点击右上角 **⭐ Star** 支持一下，这是我持续维护和更新的最大动力！

---

</div>

**WATools** 是一款运行在桌面的开发者工具集合，采用新拟态（Neumorphism）UI 设计风格，支持多主题切换。所有数据处理均在本地完成，你的敏感信息不会离开你的电脑。

## 📦 安装

### 环境要求

| 工具 | 版本 |
|------|---------|
| [Node.js](https://nodejs.org/) | >= 18 |
| [pnpm](https://pnpm.io/) | >= 8 |
| [Rust](https://www.rust-lang.org/tools/install) | >= 1.75 |

### 克隆与安装

```bash
git clone https://gitcode.com/white_chuan/WATools.git
cd WATools
pnpm install
```

## 🚀 快速开始

```bash
# 开发模式
pnpm tauri dev

# 构建安装包
pnpm tauri build
```

开发模式下前端运行在 `http://localhost:5173`，按 `F12` 可打开 DevTools。

## ✨ 功能特性

| 工具 | 描述 |
|------|------|
| 🕐 时间转换 | 时间戳与日期格式互转，支持多时区 |
| 📋 JSON 格式化 | JSON 格式化、压缩与语法校验 |
| 🔑 JWT 解析 | JWT Token 解码与结构分析 |
| #️⃣ Hash 计算器 | 支持 MD5、SHA-1、SHA-256、SHA-512 |
| 🔗 URL 编解码 | URL 特殊字符编码与解码 |
| 📝 文本 Diff | 两段文本的差异对比与高亮 |
| 🆔 UUID 生成器 | 快速生成 UUID v4 / v7 |
| 🎨 颜色转换 | HEX、RGB、HSL 格式互转 |
| 🎯 正则测试器 | 实时匹配正则表达式 |
| 🔤 Base64 编解码 | Base64 编码与解码 |
| ⏲️ Cron 解析器 | 解析 Cron 表达式，展示执行计划 |
| 🌐 HTTP 请求器 | 发送 HTTP 请求并查看响应 |
| 🔡 Base32 编解码 | Base32 编码与解码 |
| 🏷️ HTML 实体编解码 | HTML 特殊字符与实体互转 |
| 🔢 ASCII 转换 | ASCII 码与文本互转，附 Hex 对照 |
| 📖 Markdown 预览 | 实时编辑预览 Markdown，导出 HTML |
| 📊 文本统计/处理 | 字数统计 + 大小写转换 + 去重/排序/去空行 |
| 🧮 进制转换 | 二/八/十/十六进制互转 |
| **安全/加密** | |
| 🔐 Hex 编解码 | 文本与十六进制字符串互转 |
| 🔏 HMAC 计算 | 计算 HMAC-SHA256 / HMAC-SHA512 |
| 🔒 对称加密 | AES-256-GCM / ChaCha20-Poly1305 加密解密 |
| 🛡️ RSA 加密 | RSA 密钥生成、公钥加密/私钥解密、数字签名 |
| 🎲 密码生成器 | 随机密码生成 + zxcvbn 强度检测 |
| **备忘录** | |
| 🗄️ 密码库 | 本地加密密码管理器（Argon2id + AES-256-GCM） |

### 核心特性

- 🎨 **新拟态 UI**：自研 `neu` 组件库，统一的视觉风格
- 🌈 **多主题支持**：6 套精心设计的主题，一键切换
- 🔒 **数据安全**：所有计算本地完成，数据不出你的电脑
- 💾 **本地存储**：基于 SQLite，历史记录持久化
- ⚡ **高性能**：Rust 原生后端，体积小、启动快

## 🏗️ 架构

```
┌─────────────────────────────────────┐
│           前端 (Vue 3)               │
│   Vite · TypeScript · Pinia · Router │
│          新拟态 UI 组件库             │
├─────────────────────────────────────┤
│           Tauri IPC Bridge          │
├─────────────────────────────────────┤
│           后端 (Rust)                │
│   Tauri Commands · tauri-plugin-sql  │
│   chrono · jsonwebtoken · reqwest    │
│   sha2 · regex · uuid · similar      │
│   aes-gcm · rsa · argon2 · hmac     │
└─────────────────────────────────────┘
```

### 前端技术栈

- [Vue 3](https://vuejs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vitejs.dev/) · [Pinia](https://pinia.vuejs.org/) · [Vue Router](https://router.vuejs.org/)

### 后端技术栈（Rust）

- [Tauri 2](https://tauri.app/) · [chrono](https://crates.io/crates/chrono) · [jsonwebtoken](https://crates.io/crates/jsonwebtoken) · [reqwest](https://crates.io/crates/reqwest) · [sha2](https://crates.io/crates/sha2) · [regex](https://crates.io/crates/regex) · [uuid](https://crates.io/crates/uuid) · [cron](https://crates.io/crates/cron) · [similar](https://crates.io/crates/similar) · [aes-gcm](https://crates.io/crates/aes-gcm) · [chacha20poly1305](https://crates.io/crates/chacha20poly1305) · [hmac](https://crates.io/crates/hmac) · [rsa](https://crates.io/crates/rsa) · [argon2](https://crates.io/crates/argon2) · [zeroize](https://crates.io/crates/zeroize)

## 📁 项目结构

```
WATools/
├── src/                          # 前端源码
│   ├── components/
│   │   ├── common/               # 通用组件
│   │   ├── layout/               # 布局组件
│   │   └── neu/                  # 新拟态 UI 组件库
│   ├── composables/              # 组合式函数
│   ├── router/                   # 路由配置
│   ├── stores/                   # Pinia 状态管理
│   ├── styles/themes/            # 多主题样式文件
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   └── views/tools/              # 工具页面视图（24 个工具）
├── src-tauri/                    # Rust 后端
│   └── src/commands/             # Tauri 命令
├── doc/                          # 文档（25 篇文章）
└── public/                       # 静态资源
```

## 🎨 主题

| 主题 | 色调 | 文件 |
|------|------|--------|
| 🌸 樱花 | 粉色 | `cherry-blossom.css` |
| 💜 薰衣草之梦 | 紫色 | `lavender-dream.css` |
| 🌿 薄荷清新 | 绿色 | `mint-fresh.css` |
| 🌊 海风 | 蓝色 | `ocean-breeze.css` |
| 🌙 星空 | 深色 | `starry-night.css` |
| 🌅 日落余晖 | 橙色 | `sunset-glow.css` |

## 📖 文档

项目文档位于 `doc/` 目录，包含引流文章和使用指南：

| 文档 | 描述 |
|------|------|
| [安装上手指南](./doc/07-WATools安装与快速上手指南.md) | 从零开始运行 WATools |
| [JSON 格式化指南](./doc/08-JSON格式化工具完全指南.md) | JSON 工具详细教程 |
| [时间转换指南](./doc/09-时间转换工具完全指南.md) | 时间转换完整教程 |
| [JWT 解析指南](./doc/10-JWT解析工具使用指南.md) | JWT 解析使用教程 |
| [主题配置指南](./doc/11-主题切换与个性化配置.md) | 个性化设置详解 |
| [高效技巧合集](./doc/12-WATools高效使用技巧合集.md) | 20 条提效技巧 |
| [长期项目规划](./doc/13-WATools长期项目规划.md) | 项目三阶段演进路线图 |
| [Base32 编解码指南](./doc/14-Base32编解码工具使用指南.md) | Base32 编解码使用教程 |
| [HTML 实体编解码指南](./doc/15-HTML实体编解码工具使用指南.md) | HTML 实体编解码教程 |
| [ASCII 转换指南](./doc/16-ASCII转换工具使用指南.md) | ASCII 码转换使用教程 |
| [Markdown 预览指南](./doc/17-Markdown预览工具使用指南.md) | Markdown 预览与导出教程 |
| [文本统计处理指南](./doc/18-文本统计处理工具使用指南.md) | 文本统计与处理教程 |
| [进制转换指南](./doc/19-进制转换工具使用指南.md) | 进制转换使用教程 |
| [Hex 编解码指南](./doc/20-Hex编解码工具使用指南.md) | Hex 编解码使用教程 |
| [HMAC 计算指南](./doc/21-HMAC计算工具使用指南.md) | HMAC 计算使用教程 |
| [对称加密指南](./doc/22-对称加密工具使用指南.md) | 对称加密使用教程 |
| [RSA 加密指南](./doc/23-RSA加密工具使用指南.md) | RSA 加密使用教程 |
| [密码生成器指南](./doc/24-密码生成器使用指南.md) | 密码生成器使用教程 |
| [密码库指南](./doc/25-密码库工具使用指南.md) | 密码库使用教程 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

```bash
# Fork 项目后
git clone https://gitcode.com/white_chuan/WATools.git
cd WATools
pnpm install
pnpm tauri dev
```

添加新工具只需 4 步：

1. `src-tauri/src/commands/xxx.rs` — 编写 Rust 命令
2. `src-tauri/src/lib.rs` — 注册命令
3. `src/composables/useXxx.ts` — 封装前端调用
4. `src/views/tools/XxxView.vue` — 构建 UI

## 📄 许可证

本项目基于 [Apache License 2.0](./LICENSE) 开源。

---

<div align="center">

**如果 WATools 对你有帮助，请 ⭐ Star 支持！**

[🔗 GitCode](https://gitcode.com/white_chuan/WATools) | [🔗 GitHub](https://github.com/whitechuan/WATools)

</div>
