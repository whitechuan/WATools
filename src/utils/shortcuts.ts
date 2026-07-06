import { register } from '@tauri-apps/plugin-global-shortcut'
import router from '@/router'

// 工具路由列表（按侧边栏顺序）
const toolRoutes = [
  '/tools/time-converter',
  '/tools/json-formatter',
  '/tools/jwt-parser',
  '/tools/hash-calculator',
  '/tools/url-codec',
  '/tools/text-diff',
  '/tools/uuid-generator',
  '/tools/color-converter',
  '/tools/regex-tester',
]

/**
 * 初始化全局快捷键
 */
export async function initShortcuts() {
  // Ctrl+1 ~ Ctrl+9: 快速切换工具
  for (let i = 0; i < toolRoutes.length; i++) {
    const shortcut = `CommandOrControl+${i + 1}`
    const route = toolRoutes[i]
    await register(shortcut, () => {
      router.push(route)
    })
  }

  // Ctrl+,: 打开设置
  await register('CommandOrControl+,', () => {
    router.push('/settings')
  })

  // Ctrl+Shift+T: 显示/隐藏窗口（全局快捷键）
  await register('CommandOrControl+Shift+T', () => {
    // 此快捷键在 Rust 端处理窗口显示/隐藏
    // 前端注册后由 Tauri 自动处理窗口焦点切换
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
      const win = getCurrentWindow()
      win.isVisible().then((visible) => {
        if (visible) {
          win.hide()
        } else {
          win.show()
          win.setFocus()
        }
      })
    })
  })
}

/**
 * 清理快捷键（可选）
 */
export async function cleanupShortcuts() {
  const { unregister } = await import('@tauri-apps/plugin-global-shortcut')
  const shortcuts = [
    ...toolRoutes.map((_, i) => `CommandOrControl+${i + 1}`),
    'CommandOrControl+,',
    'CommandOrControl+Shift+T',
  ]
  for (const shortcut of shortcuts) {
    try {
      await unregister(shortcut)
    } catch {
      // ignore
    }
  }
}
