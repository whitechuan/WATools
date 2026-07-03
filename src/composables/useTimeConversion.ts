import { ref, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useDatabase } from '@/composables/useDatabase'
import type { TimeConversionResult } from '@/types/tools'
import type { HistoryEntry } from '@/composables/useDatabase'

const TOOL_ID = 'time-converter'

export type TimeFormat = 'auto' | 'unix_seconds' | 'unix_millis' | 'iso8601' | 'rfc2822' | 'local'

export function useTimeConversion() {
  const { getToolPreference, setToolPreference, addHistory, getHistory, clearHistory } = useDatabase()

  const input = ref('')
  const fromFormat = ref<TimeFormat>('auto')
  const result = ref<TimeConversionResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const history = ref<HistoryEntry[]>([])

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // 加载用户偏好
  async function loadPreferences() {
    try {
      const savedFormat = await getToolPreference(TOOL_ID, 'default_format')
      if (savedFormat) {
        fromFormat.value = savedFormat as TimeFormat
      }
    } catch {
      // 静默降级
    }
  }

  // 保存格式偏好
  async function saveFormatPreference(format: TimeFormat) {
    try {
      await setToolPreference(TOOL_ID, 'default_format', format)
    } catch {
      // 静默降级
    }
  }

  // 加载历史记录
  async function loadHistory() {
    try {
      history.value = await getHistory(TOOL_ID, 10)
    } catch {
      history.value = []
    }
  }

  // 转换时间
  async function convertTime() {
    const trimmedInput = input.value.trim()
    if (!trimmedInput) {
      result.value = null
      error.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      const res = await invoke<TimeConversionResult>('convert_time', {
        input: trimmedInput,
        fromFormat: fromFormat.value
      })
      result.value = res
      // 保存到历史记录
      try {
        await addHistory(TOOL_ID, trimmedInput, JSON.stringify(res))
        await loadHistory()
      } catch {
        // 历史记录保存失败不影响主流程
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      result.value = null
    } finally {
      loading.value = false
    }
  }

  // 清空输入和结果
  function clearAll() {
    input.value = ''
    result.value = null
    error.value = null
  }

  // 清空历史
  async function clearAllHistory() {
    try {
      await clearHistory(TOOL_ID)
      history.value = []
    } catch {
      // 静默降级
    }
  }

  // 从历史记录回填
  function fillFromHistory(entry: HistoryEntry) {
    input.value = entry.input
    convertTime()
  }

  // 获取所有结果的文本
  function getAllResultsText(): string {
    if (!result.value) return ''
    const r = result.value
    return [
      `Unix(秒): ${r.unix_seconds}`,
      `Unix(毫秒): ${r.unix_millis}`,
      `ISO 8601: ${r.iso8601}`,
      `RFC 2822: ${r.rfc2822}`,
      `本地时间: ${r.local_time}`,
      `UTC: ${r.utc_time}`,
      `相对时间: ${r.relative}`
    ].join('\n')
  }

  // 防抖自动转换
  watch(input, (newVal) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    if (newVal.trim()) {
      debounceTimer = setTimeout(() => {
        convertTime()
      }, 300)
    } else {
      result.value = null
      error.value = null
    }
  })

  // 格式变化时保存偏好并重新转换
  watch(fromFormat, (newFormat) => {
    saveFormatPreference(newFormat)
    if (input.value.trim()) {
      convertTime()
    }
  })

  return {
    input,
    fromFormat,
    result,
    loading,
    error,
    history,
    loadPreferences,
    loadHistory,
    convertTime,
    clearAll,
    clearAllHistory,
    fillFromHistory,
    getAllResultsText
  }
}
