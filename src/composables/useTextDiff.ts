import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { DiffResult } from '@/types/tools'

export function useTextDiff() {
  const oldText = ref('')
  const newText = ref('')
  const result = ref<DiffResult | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (result.value) return `✓ 对比完成 │ +${result.value.stats.additions} -${result.value.stats.deletions} =${result.value.stats.unchanged}`
    return '📝 输入原文和新文进行差异对比'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (result.value) return 'success'
    return 'idle'
  })

  async function compare() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      result.value = await invoke<DiffResult>('compute_diff', {
        oldText: oldText.value,
        newText: newText.value,
      })
    } catch (e: any) {
      errorMessage.value = e.toString()
      result.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    oldText.value = ''
    newText.value = ''
    result.value = null
    errorMessage.value = ''
  }

  return { oldText, newText, result, isLoading, errorMessage, statusText, statusType, compare, clearAll }
}
