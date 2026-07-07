# Tauri 2 + Vue 3 实战：如何构建一个轻量级桌面应用

> Electron 太重？试试 Tauri 2，用你熟悉的 Vue 3 写界面，用 Rust 写后端，打包出来不到 10MB。

## 为什么选 Tauri 2 而不是 Electron？

| 对比项 | Electron | Tauri 2 |
|--------|----------|---------|
| 安装包体积 | 80MB+ | 3~10MB |
| 内存占用 | 100MB+ | 20~40MB |
| 后端语言 | Node.js | Rust |
| 安全模型 | Chromium 沙箱 | 系统 WebView + 权限白名单 |
| 启动速度 | 较慢 | 极快 |

如果你不需要 Chromium 的完整能力，Tauri 2 在体积、性能和安全性上都有明显优势。

## 项目架构：WATools 的技术选型

以我开发的 **WATools** 桌面工具箱为例，整体架构如下：

```
┌─────────────────────────────────┐
│          前端 (Vue 3)            │
│  Vite + TypeScript + Pinia      │
│  新拟态 UI 组件库                │
├─────────────────────────────────┤
│         Tauri IPC 通信           │
│   invoke() / emit() / event     │
├─────────────────────────────────┤
│         后端 (Rust)              │
│  Tauri Commands + 插件系统       │
│  SQLite / chrono / jsonwebtoken │
└─────────────────────────────────┘
```

**前端**负责 UI 交互，**后端**负责计算密集型和数据安全相关的操作，两者通过 Tauri 的 IPC（进程间通信）桥接。

## 快速搭建一个 Tauri 2 + Vue 3 项目

### 1. 初始化项目

```bash
pnpm create tauri-app
# 选择 Vue + TypeScript 模板
```

### 2. 项目结构规划

```
src/                    # 前端代码
├── components/         # UI 组件
├── composables/        # 组合式函数
├── views/              # 页面视图
├── stores/             # Pinia 状态管理
└── router/             # Vue Router

src-tauri/              # Rust 后端
├── src/
│   ├── commands/       # Tauri 命令（前端可调用）
│   ├── lib.rs          # 插件注册入口
│   └── main.rs         # 应用启动入口
└── tauri.conf.json     # Tauri 配置
```

### 3. 编写第一个 Tauri 命令

在 Rust 端定义一个命令：

```rust
// src-tauri/src/commands/json_format.rs
#[tauri::command]
pub fn format_json(input: String) -> Result<String, String> {
    let value: serde_json::Value = serde_json::from_str(&input)
        .map_err(|e| e.to_string())?;
    serde_json::to_string_pretty(&value)
        .map_err(|e| e.to_string())
}
```

在 `lib.rs` 中注册：

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        commands::json_format::format_json
    ])
    .run(tauri::generate_context!())
```

### 4. 前端调用 Rust 命令

```typescript
import { invoke } from '@tauri-apps/api/core'

const result = await invoke('format_json', { input: jsonString })
```

就这么简单！前端用 `invoke` 就能调用 Rust 函数，享受原生性能。

## 插件系统：开箱即用的扩展能力

Tauri 2 提供了丰富的官方插件，WATools 使用了以下插件：

- **tauri-plugin-sql**：SQLite 数据库支持，用于存储历史记录
- **tauri-plugin-shell**：系统 Shell 交互能力

SQL 插件配置示例（`tauri.conf.json`）：

```json
{
  "plugins": {
    "sql": {
      "preload": ["sqlite:watools.db"]
    }
  }
}
```

> ⚠️ 注意：`preload` 字段必须是字符串数组格式，否则会导致应用启动 panic。

## 多主题实现：CSS 变量 + 动态切换

WATools 通过 CSS 变量体系实现主题切换：

```css
/* variables.css - 定义主题变量 */
:root {
  --neu-bg: #e0e5ec;
  --neu-shadow-dark: #a3b1c6;
  --neu-shadow-light: #ffffff;
  --neu-text: #4a5568;
}
```

切换主题时只需动态替换 `document.documentElement` 的样式表引用，所有组件自动跟随变化。

## 打包发布

```bash
pnpm tauri build
```

Tauri 会自动调用系统编译器，生成平台原生安装包：
- Windows：`.msi` / `.exe`
- macOS：`.dmg`
- Linux：`.deb` / `.AppImage`

## 总结

Tauri 2 + Vue 3 是目前构建轻量级桌面工具应用的最佳组合之一：

- **Vue 3** 提供优秀的开发体验和丰富的生态
- **Rust 后端** 保证性能和安全
- **Tauri 2** 把两者优雅地桥接在一起

如果你也想做一个自己的桌面工具，不妨从 [WATools](https://github.com/whitechuan/WATools)（[GitCode 镜像](https://gitcode.com/white_chuan/WATools)）的源码开始参考，Star 一下支持开源！
