# Rust + 前端混合开发入门：用 Tauri 2 桥接两个世界

> 前端工程师不会 Rust？没关系。本文以 WATools 项目为例，手把手教你如何在 Vue 3 前端项目中引入 Rust 后端，实现前后端混合开发。

## 为什么要混合开发？

传统前端项目（React/Vue）所有逻辑都跑在浏览器里，但有些场景下你会感到力不从心：

- **计算密集型任务**：大文件哈希、复杂数据解析，JS 性能不够
- **文件系统操作**：读写本地文件、访问 SQLite 数据库
- **安全敏感操作**：加密解密、签名验证，不想把逻辑暴露在浏览器

Rust 恰好弥补了这些短板——高性能、内存安全、强大的 crate 生态。Tauri 2 把两者优雅地连接在一起。

## 混合开发的架构图

```
┌──────────────────────────────────────┐
│              前端 (Vue 3)             │
│  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │ 页面   │  │ 组件   │  │ Store  │ │
│  └───┬────┘  └────────┘  └───┬────┘ │
│      │                       │       │
│      └───────────┬───────────┘       │
│                  │ invoke()          │
├──────────────────┼───────────────────┤
│              Tauri IPC               │
├──────────────────┼───────────────────┤
│              后端 (Rust)              │
│  ┌───────────────┴─────────────────┐ │
│  │       Tauri Commands            │ │
│  │  ┌──────┐ ┌──────┐ ┌────────┐  │ │
│  │  │ JSON │ │ JWT  │ │ Time   │  │ │
│  │  │格式  │ │解析  │ │转换    │  │ │
│  │  └──────┘ └──────┘ └────────┘  │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │       插件（SQL / Shell）        │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## 第一步：环境准备

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Node.js 和 pnpm
# https://nodejs.org/
npm install -g pnpm

# 创建 Tauri 项目
pnpm create tauri-app
```

## 第二步：规划命令目录

建议将每个 Rust 命令放在独立的文件中，便于维护：

```
src-tauri/src/
├── commands/
│   ├── mod.rs              # 模块声明
│   ├── json_format.rs      # JSON 格式化命令
│   ├── jwt_parse.rs        # JWT 解析命令
│   └── time_convert.rs     # 时间转换命令
├── lib.rs                  # 应用入口，注册命令
└── main.rs                 # 程序入口
```

### mod.rs 模块声明

```rust
// src-tauri/src/commands/mod.rs
pub mod json_format;
pub mod jwt_parse;
pub mod time_convert;
```

## 第三步：编写 Rust 命令

每个命令文件遵循统一模式：

```rust
// src-tauri/src/commands/time_convert.rs
use chrono::{DateTime, Utc, TimeZone};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct TimeResult {
    pub timestamp: i64,
    pub iso: String,
    pub local: String,
}

#[tauri::command]
pub fn convert_timestamp(timestamp: i64) -> Result<TimeResult, String> {
    let dt = Utc.timestamp_opt(timestamp, 0)
        .single()
        .ok_or("无效的时间戳")?;
    
    Ok(TimeResult {
        timestamp,
        iso: dt.to_rfc3339(),
        local: dt.format("%Y-%m-%d %H:%M:%S").to_string(),
    })
}
```

**关键要点：**
- 返回 `Result<T, String>`，Tauri 会自动将 `Err` 转为前端错误
- 使用 `Serialize` 派生宏，Rust 结构体自动转为 JSON
- 用 `#[tauri::command]` 标注函数

## 第四步：注册命令

```rust
// src-tauri/src/lib.rs
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::json_format::format_json,
            commands::json_format::compress_json,
            commands::jwt_parse::jwt_parse,
            commands::time_convert::convert_timestamp,
            commands::time_convert::convert_date_string,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 第五步：前端调用

### 封装 Composable

推荐将 `invoke` 调用封装为 Vue 的组合式函数：

```typescript
// src/composables/useTimeConversion.ts
import { invoke } from '@tauri-apps/api/core'
import { ref } from 'vue'

interface TimeResult {
  timestamp: number
  iso: string
  local: string
}

export function useTimeConversion() {
  const result = ref<TimeResult | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function convertTimestamp(timestamp: number) {
    loading.value = true
    error.value = null
    try {
      result.value = await invoke<TimeResult>(
        'convert_timestamp', 
        { timestamp }
      )
    } catch (e) {
      error.value = e as string
    } finally {
      loading.value = false
    }
  }

  return { result, error, loading, convertTimestamp }
}
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useTimeConversion } from '@/composables/useTimeConversion'

const { result, error, loading, convertTimestamp } = useTimeConversion()
</script>

<template>
  <div>
    <neu-button @click="convertTimestamp(1700000000)" :loading="loading">
      转换
    </neu-button>
    <result-card v-if="result" :data="result" />
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
```

## 数据传递规则

| 前端（TypeScript） | 后端（Rust） |
|-------------------|-------------|
| `string` | `String` |
| `number` | `i64` / `f64` |
| `boolean` | `bool` |
| `object` | `HashMap` / `struct`（需 `Deserialize`） |
| `array` | `Vec<T>` |
| `Promise<T>` | 返回值 `T` |

## 开发调试技巧

1. **Rust 编译错误**：首次编译较慢，后续增量编译很快。`cargo check` 可以快速检查语法
2. **热重载**：前端修改 Vite 会自动热重载，Rust 修改需要重新编译
3. **日志调试**：Rust 端用 `println!()` 输出会显示在终端，前端用 `console.log()` 可在 DevTools 查看
4. **DevTools**：开发模式下按 `F12` 可以打开浏览器开发者工具

## 添加新工具的标准流程

当你在 WATools 中新增一个工具时，只需四步：

1. **Rust 命令**：`src-tauri/src/commands/xxx.rs` 中实现业务逻辑
2. **注册命令**：在 `lib.rs` 的 `invoke_handler` 中添加
3. **前端 Composable**：`src/composables/useXxx.ts` 中封装调用
4. **Vue 页面**：`src/views/tools/XxxView.vue` 中构建 UI

然后在路由中注册页面即可。

## 总结

Rust + 前端混合开发并不复杂：

- **前端工程师**不需要精通 Rust，只需会写 `#[tauri::command]` 函数
- **Rust 工程师**不需要学 Vue，只需提供干净的命令接口
- **Tauri 2** 负责把两者桥接起来，IPC 通信透明高效

WATools 的源码就是一个完整的参考实现，来 [GitHub](https://github.com/whitechuan/WATools) / [GitCode](https://gitcode.com/white_chuan/WATools) Star 一下，开始你的混合开发之旅！
