import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import { useTheme } from '@/composables/useTheme'

export const useSettingsStore = defineStore('settings', () => {
  const { getSetting, setSetting } = useDatabase()
  const { setTheme, loadTheme } = useTheme()

  // ===== 配置项 =====
  const theme = ref('ocean-breeze')
  const fontSize = ref(14)
  const sidebarCollapsed = ref(false)
  const jsonIndentSize = ref(2)
  const jsonAutoValidate = ref(true)
  const timeDefaultFormat = ref('auto')
  const jwtDefaultAlgorithm = ref('HS256')

  // ===== 是否已加载 =====
  const loaded = ref(false)

  /** 从 SQLite 加载所有设置 */
  async function loadSettings() {
    try {
      const [
        dbTheme,
        dbFontSize,
        dbSidebarCollapsed,
        dbJsonIndentSize,
        dbJsonAutoValidate,
        dbTimeDefaultFormat,
        dbJwtDefaultAlgorithm,
      ] = await Promise.all([
        getSetting('theme', 'ocean-breeze'),
        getSetting('fontSize', '14'),
        getSetting('sidebarCollapsed', 'false'),
        getSetting('jsonIndentSize', '2'),
        getSetting('jsonAutoValidate', 'true'),
        getSetting('timeDefaultFormat', 'auto'),
        getSetting('jwtDefaultAlgorithm', 'HS256'),
      ])

      theme.value = dbTheme || 'ocean-breeze'
      fontSize.value = parseInt(dbFontSize || '14', 10)
      sidebarCollapsed.value = dbSidebarCollapsed === 'true'
      jsonIndentSize.value = parseInt(dbJsonIndentSize || '2', 10)
      jsonAutoValidate.value = dbJsonAutoValidate !== 'false'
      timeDefaultFormat.value = dbTimeDefaultFormat || 'auto'
      jwtDefaultAlgorithm.value = dbJwtDefaultAlgorithm || 'HS256'

      // 同步主题
      await loadTheme()
    } catch {
      // 降级使用默认值
    }
    loaded.value = true
  }

  /** 更新单个设置并持久化 */
  async function updateSetting<K extends keyof SettingsMap>(key: K, value: SettingsMap[K]) {
    switch (key) {
      case 'theme':
        theme.value = value as string
        await setTheme(value as string)
        break
      case 'fontSize':
        fontSize.value = value as number
        break
      case 'sidebarCollapsed':
        sidebarCollapsed.value = value as boolean
        break
      case 'jsonIndentSize':
        jsonIndentSize.value = value as number
        break
      case 'jsonAutoValidate':
        jsonAutoValidate.value = value as boolean
        break
      case 'timeDefaultFormat':
        timeDefaultFormat.value = value as string
        break
      case 'jwtDefaultAlgorithm':
        jwtDefaultAlgorithm.value = value as string
        break
    }

    // 持久化到 SQLite
    try {
      await setSetting(key, String(value))
    } catch {
      // 静默降级
    }
  }

  /** 导出所有设置为 JSON 字符串 */
  function exportSettings(): string {
    return JSON.stringify({
      theme: theme.value,
      fontSize: fontSize.value,
      sidebarCollapsed: sidebarCollapsed.value,
      jsonIndentSize: jsonIndentSize.value,
      jsonAutoValidate: jsonAutoValidate.value,
      timeDefaultFormat: timeDefaultFormat.value,
      jwtDefaultAlgorithm: jwtDefaultAlgorithm.value,
    }, null, 2)
  }

  return {
    // state
    theme,
    fontSize,
    sidebarCollapsed,
    jsonIndentSize,
    jsonAutoValidate,
    timeDefaultFormat,
    jwtDefaultAlgorithm,
    loaded,
    // actions
    loadSettings,
    updateSetting,
    exportSettings,
  }
})

/** 设置键值类型映射 */
interface SettingsMap {
  theme: string
  fontSize: number
  sidebarCollapsed: boolean
  jsonIndentSize: number
  jsonAutoValidate: boolean
  timeDefaultFormat: string
  jwtDefaultAlgorithm: string
}
