# WATools 安装与快速上手指南

> 从零开始，5 分钟内让你的本地开发者工具箱跑起来。本文覆盖环境准备、安装运行、打包发布全流程。

## 什么是 WATools？

WATools 是一款基于 **Tauri 2 + Vue 3** 的桌面开发者工具箱，提供 JSON 格式化、JWT 解析、时间转换等常用工具，所有数据处理均在本地完成，安全放心。

<!-- 📸 截图占位：应用主界面全貌截图 -->
![应用主界面](images/screenshot-main.png)

## 环境准备

在开始之前，确保你的电脑已安装以下工具：

| 工具 | 最低版本 | 下载地址 |
|------|---------|---------|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org/) |
| pnpm | >= 8 | `npm install -g pnpm` |
| Rust | >= 1.75 | [rustup.rs](https://www.rust-lang.org/tools/install) |

### 验证环境

打开终端，依次检查：

```bash
node --version    # 应输出 v18.x 或更高
pnpm --version    # 应输出 8.x 或更高
rustc --version   # 应输出 rustc 1.75.x 或更高
```

> 💡 **Windows 用户提示**：安装 Rust 时需要 [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)，Rust 安装器会自动引导你安装。

## 克隆项目

```bash
git clone https://gitcode.com/white_chuan/WATools.git
cd WATools
```

## 安装依赖

```bash
pnpm install
```

这一步会安装前端依赖（Vue 3、Pinia、Vue Router 等）。Rust 依赖会在首次编译时自动下载。

## 开发模式运行

```bash
pnpm tauri dev
```

首次运行会编译 Rust 后端，需要等待 1~3 分钟（后续增量编译很快）。编译完成后会自动弹出应用窗口。

<!-- 📸 截图占位：首次编译终端输出截图 -->
![首次编译](images/screenshot-first-build.png)

### 开发模式特性

- **热重载**：修改 Vue 前端代码后界面自动刷新
- **DevTools**：按 `F12` 可打开浏览器开发者工具进行调试
- **增量编译**：修改 Rust 代码后只需等待增量编译（通常几秒）

## 界面概览

应用启动后，你会看到：

```
┌──────────────────────────────────────────────┐
│  🛠️ WATools                    ⚙️ 主题切换  │  ← 顶部导航
├──────────┬───────────────────────────────────┤
│          │                                   │
│  🕐 时间  │      工具内容区域                  │
│  📋 JSON  │                                   │
│  🔑 JWT   │                                   │
│  #️⃣ Hash │                                   │
│  ...     │                                   │
│          │                                   │
└──────────┴───────────────────────────────────┘
   ↑ 侧边栏
```

- **左侧侧边栏**：工具列表，点击切换工具
- **顶部导航**：应用标题和主题切换入口
- **中间区域**：当前工具的操作界面

## 构建安装包

当你想生成可分发的安装包时：

```bash
pnpm tauri build
```

构建产物位置：

```
src-tauri/target/release/
├── bundle/
│   ├── msi/        # Windows MSI 安装包
│   └── nsis/       # Windows EXE 安装包
└── watools.exe     # 可直接运行的可执行文件
```

<!-- 📸 截图占位：构建产物文件夹截图 -->
![构建产物](images/screenshot-build-output.png)

## 常见问题

### Q: 首次 `pnpm tauri dev` 编译失败？

确保已安装 Rust 工具链和 C++ Build Tools（Windows）。尝试：

```bash
rustup update
cargo install tauri-cli --version "^2"
```

### Q: 应用启动后白屏？

检查终端是否有报错。常见原因是 `tauri.conf.json` 中的 SQL 插件 `preload` 配置格式不正确，确保是字符串数组：

```json
"plugins": {
  "sql": {
    "preload": ["sqlite:watools.db"]
  }
}
```

### Q: 如何更新到最新版本？

```bash
git pull origin main
pnpm install
pnpm tauri dev
```

## 下一步

安装完成后，你可以阅读以下使用指南深入了解每个工具：

- [JSON 格式化工具完全指南](./08-JSON格式化工具完全指南.md)
- [时间转换工具使用指南](./09-时间转换工具完全指南.md)
- [JWT 解析工具使用指南](./10-JWT解析工具使用指南.md)
- [主题切换与个性化配置](./11-主题切换与个性化配置.md)

觉得 WATools 好用？来 [GitCode](https://gitcode.com/white_chuan/WATools) 点个 ⭐ Star，支持开源！
