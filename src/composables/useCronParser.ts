import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { CronResult } from '@/types/tools'

export function useCronParser() {
  const expression = ref('')
  const result = ref<CronResult | null>(null)
  const isLoading = ref(false)

  const statusText = computed(() => {
    if (result.value?.error) return `⚠ ${result.value.error}`
    if (result.value?.is_valid) return `✓ 有效表达式 │ ${result.value.description}`
    return '⏲️ 输入 Cron 表达式进行解析（支持 5/6/7 字段格式）'
  })

  const statusType = computed(() => {
    if (result.value?.error) return 'error'
    if (result.value?.is_valid) return 'success'
    return 'idle'
  })

  async function parse() {
    if (!expression.value.trim()) return
    isLoading.value = true
    try {
      result.value = await invoke<CronResult>('parse_cron', { expression: expression.value })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      result.value = { is_valid: false, description: '', next_runs: [], error: msg }
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    expression.value = ''
    result.value = null
  }

  return { expression, result, isLoading, statusText, statusType, parse, clearAll }
}
