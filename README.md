<div align="center">

```
 __        ___      _____           _     
 \ \      / / \    |_   _|__   ___ | |___ 
  \ \ /\ / / _ \     | |/ _ \ / _ \| / __|
   \ V  V / ___ \    | | (_) | (_) | \__ \
    \_/\_/_/   \_\   |_|\___/ \___/|_|___/
```

### 基于 Tauri 2 + Vue 3 构建的桌面开发者工具箱

**[English](#english)** • **简体中文**

[安装](#-安装) • [快速开始](#-快速开始) • [功能](#-功能特性) • [架构](#-架构) • [主题](#-主题) • [文档](#-文档) • [贡献](#-贡献指南)

---

![version](https://img.shields.io/badge/version-1.0-blue)
![tauri](https://img.shields.io/badge/tauri-2.0-orange)
![vue](https://img.shields.io/badge/vue-3.4-green)
![rust](https://img.shields.io/badge/rust-1.75+-red)
![license](https://img.shields.io/badge/license-Apache2.0-blue)
![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

> 💖 如果这个项目对你有帮助，请点击右上角 **⭐ Star** 支持一下！
>
> If this project helps you, please **⭐ Star** it to show your support!

---

</div>

**WATools** 是一款运行在桌面的开发者工具集合，采用新拟态（Neumorphism）UI 设计风格，支持多主题切换。所有数据处理均在本地完成，你的敏感信息不会离开你的电脑。

**WATools** is a desktop developer toolbox built with **Tauri 2 + Vue 3**, featuring a Neumorphism UI design with multiple themes. All data processing is done locally — your sensitive data never leaves your machine.

---

## 📦 安装 / Installation

### 环境要求 / Prerequisites

| 工具 / Tool | 版本 / Version |
|------|---------|
| [Node.js](https://nodejs.org/) | >= 18 |
| [pnpm](https://pnpm.io/) | >= 8 |
| [Rust](https://www.rust-lang.org/tools/install) | >= 1.75 |

### 克隆与安装 / Clone & Install

```bash
git clone https://gitcode.com/white_chuan/WATools.git
cd WATools
pnpm install
```

## 🚀 快速开始 / Quick Start

```bash
# 开发模式 / Development
pnpm tauri dev

# 构建安装包 / Build
pnpm tauri build
```

开发模式下前端运行在 `http://localhost:5173`，按 `F12` 可打开 DevTools。

Dev server runs at `http://localhost:5173`. Press `F12` to open DevTools.

## ✨ 功能特性 / Features

| 工具 / Tool | 描述 / Description |
|------|------|
| 🕐 时间转换 Time Converter | 时间戳与日期格式互转，支持多时区 / Timestamp & date format conversion |
| 📋 JSON 格式化 JSON Formatter | JSON 格式化、压缩与语法校验 / Format, minify & validate JSON |
| 🔑 JWT 解析 JWT Parser | JWT Token 解码与结构分析 / Decode & analyze JWT tokens |
| #️⃣ Hash 计算器 Hash Calculator | MD5、SHA-1、SHA-256、SHA-512 / Multi-algorithm hashing |
| 🔗 URL 编解码 URL Codec | URL 特殊字符编码与解码 / URL encoding & decoding |
| 📝 文本 Diff Text Diff | 两段文本的差异对比与高亮 / Side-by-side text comparison |
| 🆔 UUID 生成器 UUID Generator | 快速生成 UUID v4 / v7 / Generate UUID v4 & v7 |
| 🎨 颜色转换 Color Converter | HEX、RGB、HSL 格式互转 / Color format conversion |
| 🎯 正则测试器 Regex Tester | 实时匹配正则表达式 / Real-time regex matching |
| 🔤 Base64 编解码 Base64 Codec | Base64 编码与解码 / Base64 encoding & decoding |
| ⏲️ Cron 解析器 Cron Parser | 解析 Cron 表达式，展示执行计划 / Parse cron expressions |
| 🌐 HTTP 请求器 HTTP Client | 发送 HTTP 请求并查看响应 / Send & inspect HTTP requests |

### 核心特性 / Highlights

- 🎨 **新拟态 UI / Neumorphism UI**：自研 `neu` 组件库，统一的视觉风格 / Custom component library
- 🌈 **多主题 / Multi-Theme**：6 套精心设计的主题，一键切换 / 6 built-in themes
- 🔒 **数据安全 / Data Security**：所有计算本地完成，数据不出你的电脑 / 100% local processing
- 💾 **本地存储 / Local Storage**：基于 SQLite，历史记录持久化 / SQLite-powered history
- ⚡ **高性能 / High Performance**：Rust 原生后端，体积小、启动快 / Tiny footprint, instant launch

## 🏗️ 架构 / Architecture

```
┌─────────────────────────────────────┐
│       前端 Frontend (Vue 3)          │
│  Vite · TypeScript · Pinia · Router │
│        新拟态 UI 组件库               │
├─────────────────────────────────────┤
│          Tauri IPC Bridge            │
│         invoke() / events            │
├─────────────────────────────────────┤
│       后端 Backend (Rust)            │
│  Tauri Commands · tauri-plugin-sql  │
│  chrono · jsonwebtoken · reqwest    │
│  sha2 · regex · uuid · similar      │
└─────────────────────────────────────┘
```

### 前端技术栈 / Frontend Stack

- [Vue 3](https://vuejs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vitejs.dev/) · [Pinia](https://pinia.vuejs.org/) · [Vue Router](https://router.vuejs.org/)

### 后端技术栈 / Backend Stack (Rust)

- [Tauri 2](https://tauri.app/) · [chrono](https://crates.io/crates/chrono) · [jsonwebtoken](https://crates.io/crates/jsonwebtoken) · [reqwest](https://crates.io/crates/reqwest) · [sha2](https://crates.io/crates/sha2) · [regex](https://crates.io/crates/regex) · [uuid](https://crates.io/crates/uuid) · [cron](https://crates.io/crates/cron) · [similar](https://crates.io/crates/similar)

## 📁 项目结构 / Project Structure

```
WATools/
├── src/                          # 前端 Frontend
│   ├── components/
│   │   ├── common/               # 通用组件 Common components
│   │   ├── layout/               # 布局组件 Layout components
│   │   └── neu/                  # 新拟态 UI Neumorphism UI library
│   ├── composables/              # 组合式函数 Composables
│   ├── router/                   # 路由 Router
│   ├── stores/                   # 状态管理 State management
│   ├── styles/themes/            # 多主题 Theme files
│   ├── types/                    # 类型定义 Type definitions
│   ├── utils/                    # 工具函数 Utilities
│   └── views/tools/              # 工具页面 Tool views (12 tools)
├── src-tauri/                    # 后端 Backend (Rust)
│   └── src/commands/             # Tauri 命令 Commands
├── doc/                          # 文档 Documentation (12 articles)
└── public/                       # 静态资源 Static assets
```

## 🎨 主题 / Themes

| 主题 / Theme | 色调 / Tone | 文件 / File |
|------|------|--------|
| 🌸 樱花 Cherry Blossom | 粉色 Pink | `cherry-blossom.css` |
| 💜 薰衣草 Lavender Dream | 紫色 Purple | `lavender-dream.css` |
| 🌿 薄荷 Mint Fresh | 绿色 Green | `mint-fresh.css` |
| 🌊 海风 Ocean Breeze | 蓝色 Blue | `ocean-breeze.css` |
| 🌙 星空 Starry Night | 深色 Dark | `starry-night.css` |
| 🌅 日落 Sunset Glow | 橙色 Orange | `sunset-glow.css` |

## 📖 文档 / Documentation

项目文档位于 `doc/` 目录，包含引流文章和使用指南：

Documentation is available in the `doc/` directory, including guides and tutorials:

| 文档 / Document | 描述 / Description |
|------|------|
| [安装上手指南](./doc/07-WATools安装与快速上手指南.md) | 从零开始运行 WATools / Getting started from scratch |
| [JSON 格式化指南](./doc/08-JSON格式化工具完全指南.md) | JSON 工具详细教程 / JSON formatter tutorial |
| [时间转换指南](./doc/09-时间转换工具完全指南.md) | 时间转换完整教程 / Time converter tutorial |
| [JWT 解析指南](./doc/10-JWT解析工具使用指南.md) | JWT 解析使用教程 / JWT parser tutorial |
| [主题配置指南](./doc/11-主题切换与个性化配置.md) | 个性化设置详解 / Customization guide |
| [高效技巧合集](./doc/12-WATools高效使用技巧合集.md) | 20 条提效技巧 / 20 productivity tips |

## 🤝 贡献指南 / Contributing

欢迎提交 Issue 和 Pull Request！

Issues and Pull Requests are welcome!

```bash
# Fork 项目后 / After forking
git clone https://github.com/YOUR_USERNAME/WATools.git
cd WATools
pnpm install
pnpm tauri dev
```

添加新工具只需 4 步 / Adding a new tool requires only 4 steps：

1. `src-tauri/src/commands/xxx.rs` — 编写 Rust 命令 / Write Rust command
2. `src-tauri/src/lib.rs` — 注册命令 / Register command
3. `src/composables/useXxx.ts` — 封装前端调用 / Create composable
4. `src/views/tools/XxxView.vue` — 构建 UI / Build UI

## 📄 许可证 / License

本项目基于 [Apache License 2.0](./LICENSE) 开源。

This project is open source under the [Apache License 2.0](./LICENSE).

---

<div align="center">

**如果 WATools 对你有帮助，请 ⭐ Star 支持！**

**If WATools helps you, please ⭐ Star to support!**

[🔗 GitCode](https://gitcode.com/white_chuan/WATools)

</div>
