import { ref } from 'vue'
import { useDatabase } from '@/composables/useDatabase'

export interface ThemeOption {
  id: string
  name: string
  nameEn: string
  preview: string
  isDark: boolean
}

export const THEME_LIST: ThemeOption[] = [
  { id: 'ocean-breeze', name: '海洋微风', nameEn: 'Ocean Breeze', preview: '#00b4d8', isDark: false },
  { id: 'sunset-glow', name: '日落余晖', nameEn: 'Sunset Glow', preview: '#ff6b35', isDark: false },
  { id: 'mint-fresh', name: '薄荷清新', nameEn: 'Mint Fresh', preview: '#00b894', isDark: false },
  { id: 'lavender-dream', name: '薰衣草梦', nameEn: 'Lavender Dream', preview: '#a855f7', isDark: false },
  { id: 'cherry-blossom', name: '樱花烂漫', nameEn: 'Cherry Blossom', preview: '#f472b6', isDark: false },
  { id: 'starry-night', name: '星空之夜', nameEn: 'Starry Night', preview: '#7c3aed', isDark: true },
]

const STORAGE_KEY = 'watools-theme'
const DB_KEY = 'theme'
const DEFAULT_THEME = 'ocean-breeze'

// 全局单例 ref，确保多个 useTheme() 调用共享状态
const currentTheme = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME)

function applyTheme(themeId: string) {
  document.documentElement.setAttribute('data-theme', themeId)
}

export function useTheme() {
  const { getSetting, setSetting } = useDatabase()

  /** 从 SQLite 加载主题，同步到 localStorage 快照缓存 */
  async function loadTheme() {
    // 先立即应用 localStorage 缓存（避免白屏闪烁）
    applyTheme(currentTheme.value)

    // 异步从 SQLite 加载真实值
    try {
      const dbTheme = await getSetting(DB_KEY, DEFAULT_THEME)
      if (dbTheme && dbTheme !== currentTheme.value) {
        currentTheme.value = dbTheme
        applyTheme(dbTheme)
        localStorage.setItem(STORAGE_KEY, dbTheme)
      }
    } catch {
      // 数据库不可用时静默降级为 localStorage
    }
  }

  /** 设置主题，同时写入 SQLite + localStorage */
  async function setTheme(themeId: string) {
    currentTheme.value = themeId
    applyTheme(themeId)
    // 立即写 localStorage（快照缓存）
    localStorage.setItem(STORAGE_KEY, themeId)
    // 异步持久化到 SQLite
    try {
      await setSetting(DB_KEY, themeId)
    } catch {
      // 静默降级
    }
  }

  return { currentTheme, THEME_LIST, loadTheme, setTheme }
}
