# WATools - 开发者工具箱

一款基于 **Tauri 2 + Vue 3** 构建的桌面开发者工具集合，采用新拟态（Neumorphism）UI 设计风格，支持多主题切换。

> 💖 如果这个项目对你有帮助，请点击右上角 **⭐ Star** 支持一下，这是我持续维护和更新的最大动力！

## ✨ 功能特性

| 工具 | 描述 |
|------|------|
| JSON 格式化 | JSON 数据的格式化、压缩与校验 |
| JWT 解析 | JWT Token 的解码与结构分析 |
| 时间转换 | 时间戳与日期格式互转，支持多时区 |

- 🎨 **新拟态 UI**：自研 `neu` 组件库，提供统一的视觉风格
- 🌈 **多主题支持**：内置樱花、薰衣草、薄荷、海风、星空、日落等多套主题
- 💾 **本地存储**：基于 SQLite，历史记录持久化保存
- ⚡ **高性能**：Tauri 2 原生后端，体积小、启动快

## 🛠️ 技术栈

### 前端
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 极速构建工具
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [Vue Router](https://router.vuejs.org/) - 路由管理

### 后端（Rust）
- [Tauri 2](https://tauri.app/) - 桌面应用框架
- [chrono](https://crates.io/crates/chrono) - 日期时间处理
- [jsonwebtoken](https://crates.io/crates/jsonwebtoken) - JWT 解析
- [tauri-plugin-sql](https://crates.io/crates/tauri-plugin-sql) - SQLite 数据库插件

## 📦 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8
- [Rust](https://www.rust-lang.org/tools/install) >= 1.75（Tauri 2 要求）

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

启动后会自动打开桌面窗口，前端开发服务器运行在 `http://localhost:5173`。

### 构建生产版本

```bash
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/` 目录。

## 📁 项目结构

```
WATools/
├── src/                          # 前端源码
│   ├── components/
│   │   ├── common/               # 通用组件（CopyButton、ResultCard 等）
│   │   ├── layout/               # 布局组件（AppHeader、AppSidebar）
│   │   └── neu/                  # 新拟态 UI 组件库
│   ├── composables/              # 组合式函数（业务逻辑）
│   ├── router/                   # 路由配置
│   ├── stores/                   # Pinia 状态管理
│   ├── styles/
│   │   └── themes/               # 多主题样式文件
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   └── views/
│       └── tools/                # 工具页面视图
├── src-tauri/                    # Rust 后端
│   └── src/
│       └── commands/             # Tauri 命令（前端可调用的后端函数）
└── public/                       # 静态资源
```

## 🎨 主题列表

| 主题 | 文件名 |
|------|--------|
| 樱花 | `cherry-blossom.css` |
| 薰衣草之梦 | `lavender-dream.css` |
| 薄荷清新 | `mint-fresh.css` |
| 海风 | `ocean-breeze.css` |
| 星空 | `starry-night.css` |
| 日落余晖 | `sunset-glow.css` |

## 📄 许可证

本项目仅供学习与日常开发使用。
