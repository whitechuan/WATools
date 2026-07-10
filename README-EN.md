<div align="center">

```
 __        ___      _____           _     
 \ \      / / \    |_   _|__   ___ | |___ 
  \ \ /\ / / _ \     | |/ _ \ / _ \| / __|
   \ V  V / ___ \    | | (_) | (_) | \__ \
    \_/\_/_/   \_\   |_|\___/ \___/|_|___/
```

### A Desktop Developer Toolbox Built with Tauri 2 + Vue 3

**English** • **[简体中文](./README.md)**

[Installation](#-installation) • [Quick Start](#-quick-start) • [Features](#-features) • [Architecture](#-architecture) • [Themes](#-themes) • [Documentation](#-documentation) • [Contributing](#-contributing)

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

> 💖 If this project helps you, please **⭐ Star** it to support continuous development!

---

</div>

**WATools** is a desktop developer toolbox built with **Tauri 2 + Vue 3**, featuring a Neumorphism UI design with multiple themes. All data processing is done locally — your sensitive data never leaves your machine.

## 📦 Installation

### Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | >= 18 |
| [pnpm](https://pnpm.io/) | >= 8 |
| [Rust](https://www.rust-lang.org/tools/install) | >= 1.75 |

### Clone & Install

```bash
git clone https://gitcode.com/white_chuan/WATools.git
cd WATools
pnpm install
```

## 🚀 Quick Start

```bash
# Development
pnpm tauri dev

# Build
pnpm tauri build
```

Dev server runs at `http://localhost:5173`. Press `F12` to open DevTools.

## ✨ Features

| Tool | Description |
|------|------|
| 🕐 Time Converter | Timestamp & date format conversion with multi-timezone support |
| 📋 JSON Formatter | Format, minify & validate JSON |
| 🔑 JWT Parser | Decode & analyze JWT tokens |
| #️⃣ Hash Calculator | MD5, SHA-1, SHA-256, SHA-512 |
| 🔗 URL Codec | URL encoding & decoding |
| 📝 Text Diff | Side-by-side text comparison |
| 🆔 UUID Generator | Generate UUID v4 & v7 |
| 🎨 Color Converter | Color format conversion (HEX, RGB, HSL) |
| 🎯 Regex Tester | Real-time regex matching |
| 🔤 Base64 Codec | Base64 encoding & decoding |
| ⏲️ Cron Parser | Parse cron expressions |
| 🌐 HTTP Client | Send & inspect HTTP requests |
| 🔡 Base32 Codec | Base32 encoding & decoding |
| 🏷️ HTML Entity Codec | HTML entity encoding & decoding |
| 🔢 ASCII Converter | ASCII code & text conversion with hex reference |
| 📖 Markdown Preview | Live preview Markdown, export HTML |
| 📊 Text Stats & Process | Word count + case conversion + dedup/sort/trim |
| 🧮 Number Base Converter | Binary/Octal/Decimal/Hexadecimal conversion |

### Highlights

- 🎨 **Neumorphism UI**: Custom `neu` component library
- 🌈 **Multi-Theme**: 6 carefully designed themes
- 🔒 **Data Security**: 100% local processing
- 💾 **Local Storage**: SQLite-powered history
- ⚡ **High Performance**: Rust backend, tiny footprint, instant launch

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│        Frontend (Vue 3)              │
│  Vite · TypeScript · Pinia · Router │
│        Neumorphism UI Library        │
├─────────────────────────────────────┤
│          Tauri IPC Bridge           │
├─────────────────────────────────────┤
│         Backend (Rust)               │
│  Tauri Commands · tauri-plugin-sql  │
│  chrono · jsonwebtoken · reqwest    │
│  sha2 · regex · uuid · similar      │
└─────────────────────────────────────┘
```

### Frontend Stack

- [Vue 3](https://vuejs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vitejs.dev/) · [Pinia](https://pinia.vuejs.org/) · [Vue Router](https://router.vuejs.org/)

### Backend Stack (Rust)

- [Tauri 2](https://tauri.app/) · [chrono](https://crates.io/crates/chrono) · [jsonwebtoken](https://crates.io/crates/jsonwebtoken) · [reqwest](https://crates.io/crates/reqwest) · [sha2](https://crates.io/crates/sha2) · [regex](https://crates.io/crates/regex) · [uuid](https://crates.io/crates/uuid) · [cron](https://crates.io/crates/cron) · [similar](https://crates.io/crates/similar)

## 📁 Project Structure

```
WATools/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── common/               # Common components
│   │   ├── layout/               # Layout components
│   │   └── neu/                  # Neumorphism UI library
│   ├── composables/              # Composables
│   ├── router/                   # Router
│   ├── stores/                   # Pinia state management
│   ├── styles/themes/            # Theme files
│   ├── types/                    # TypeScript definitions
│   ├── utils/                    # Utilities
│   └── views/tools/              # Tool views (18 tools)
├── src-tauri/                    # Rust backend
│   └── src/commands/             # Tauri commands
├── doc/                          # Documentation (19 articles)
└── public/                       # Static assets
```

## 🎨 Themes

| Theme | Tone | File |
|------|------|--------|
| 🌸 Cherry Blossom | Pink | `cherry-blossom.css` |
| 💜 Lavender Dream | Purple | `lavender-dream.css` |
| 🌿 Mint Fresh | Green | `mint-fresh.css` |
| 🌊 Ocean Breeze | Blue | `ocean-breeze.css` |
| 🌙 Starry Night | Dark | `starry-night.css` |
| 🌅 Sunset Glow | Orange | `sunset-glow.css` |

## 📖 Documentation

Documentation is available in the `doc/` directory, including guides and tutorials:

| Document | Description |
|------|------|
| [Installation Guide](./doc/07-WATools安装与快速上手指南.md) | Getting started from scratch |
| [JSON Formatter Guide](./doc/08-JSON格式化工具完全指南.md) | JSON formatter tutorial |
| [Time Converter Guide](./doc/09-时间转换工具完全指南.md) | Time converter tutorial |
| [JWT Parser Guide](./doc/10-JWT解析工具使用指南.md) | JWT parser tutorial |
| [Theme & Settings Guide](./doc/11-主题切换与个性化配置.md) | Customization guide |
| [Tips & Tricks](./doc/12-WATools高效使用技巧合集.md) | 20 productivity tips |
| [Long-term Roadmap](./doc/13-WATools长期项目规划.md) | Three-stage evolution roadmap |
| [Base32 Codec Guide](./doc/14-Base32编解码工具使用指南.md) | Base32 codec tutorial |
| [HTML Entity Guide](./doc/15-HTML实体编解码工具使用指南.md) | HTML entity codec tutorial |
| [ASCII Converter Guide](./doc/16-ASCII转换工具使用指南.md) | ASCII conversion tutorial |
| [Markdown Preview Guide](./doc/17-Markdown预览工具使用指南.md) | Markdown preview & export tutorial |
| [Text Stats Guide](./doc/18-文本统计处理工具使用指南.md) | Text stats & processing tutorial |
| [Number Base Guide](./doc/19-进制转换工具使用指南.md) | Number base conversion tutorial |

## 🤝 Contributing

Issues and Pull Requests are welcome!

```bash
# After forking
git clone https://gitcode.com/white_chuan/WATools.git
cd WATools
pnpm install
pnpm tauri dev
```

Adding a new tool requires only 4 steps:

1. `src-tauri/src/commands/xxx.rs` — Write Rust command
2. `src-tauri/src/lib.rs` — Register command
3. `src/composables/useXxx.ts` — Create composable
4. `src/views/tools/XxxView.vue` — Build UI

## 📄 License

This project is open source under the [Apache License 2.0](./LICENSE).

---

<div align="center">

**If WATools helps you, please ⭐ Star to support!**

[🔗 GitCode](https://gitcode.com/white_chuan/WATools) | [🔗 GitHub](https://github.com/whitechuan/WATools)

</div>
