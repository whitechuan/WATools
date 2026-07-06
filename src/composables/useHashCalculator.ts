import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { HashResult } from '@/types/tools'

export function useHashCalculator() {
  const input = ref('')
  const result = ref<HashResult | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (result.value) return `✓ 计算完成 │ 输入长度: ${input.value.length} 字符`
    return '#️⃣ 输入文本后计算各种哈希值'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (result.value) return 'success'
    return 'idle'
  })

  async function calculate() {
    if (!input.value) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      result.value = await invoke<HashResult>('calculate_hash', { input: input.value })
    } catch (e: any) {
      errorMessage.value = e.toString()
      result.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    input.value = ''
    result.value = null
    errorMessage.value = ''
  }

  return { input, result, isLoading, errorMessage, statusText, statusType, calculate, clearAll }
}
