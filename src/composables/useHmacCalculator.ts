import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { HmacResult } from '@/types/tools'

export function useHmacCalculator() {
  const data = ref('')
  const key = ref('')
  const result = ref<HmacResult | null>(null)
  const error = ref('')
  const isLoading = ref(false)

  async function calculate() {
    if (!data.value || !key.value) {
      error.value = '请输入数据和密钥'
      return
    }
    try {
      isLoading.value = true
      error.value = ''
      result.value = await invoke<HmacResult>('calculate_hmac', { data: data.value, key: key.value })
    } catch (e) {
      error.value = String(e)
      result.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    data.value = ''
    key.value = ''
    result.value = null
    error.value = ''
  }

  return { data, key, result, error, isLoading, calculate, clear }
}
