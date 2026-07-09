import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { TextStatsResult } from '@/types/tools'

export function useTextStats() {
  const input = ref('')
  const output = ref('')
  const stats = ref<TextStatsResult | null>(null)
  const isLoading = ref(false)
  const isProcessing = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (stats.value) return '✓ 统计完成'
    return '📊 输入文本后将自动统计'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (stats.value) return 'success'
    return 'idle'
  })

  async function calculate() {
    if (!input.value.trim()) {
      stats.value = null
      errorMessage.value = ''
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<TextStatsResult>('text_statistics', { input: input.value })
      stats.value = result
    } catch (e: any) {
      errorMessage.value = e.toString()
      stats.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function processText(operation: string) {
    const text = input.value
    if (!text) {
      errorMessage.value = '请先输入文本'
      return
    }
    isProcessing.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<string>('text_process', { input: text, operation })
      output.value = result
    } catch (e: any) {
      errorMessage.value = e.toString()
      output.value = ''
    } finally {
      isProcessing.value = false
    }
  }

  function applyOutputToInput() {
    if (output.value) {
      input.value = output.value
      output.value = ''
      calculate()
    }
  }

  function clearAll() {
    input.value = ''
    output.value = ''
    stats.value = null
    errorMessage.value = ''
  }

  return {
    input,
    output,
    stats,
    isLoading,
    isProcessing,
    errorMessage,
    statusText,
    statusType,
    calculate,
    processText,
    applyOutputToInput,
    clearAll
  }
}
