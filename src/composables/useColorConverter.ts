import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { ColorResult } from '@/types/tools'

export function useColorConverter() {
  const input = ref('')
  const format = ref('hex') // hex, rgb, hsl
  const result = ref<ColorResult | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (result.value) return `✓ 颜色转换完成`
    return '🎨 输入颜色值进行格式转换'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (result.value) return 'success'
    return 'idle'
  })

  async function convert() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      result.value = await invoke<ColorResult>('convert_color', { input: input.value, format: format.value })
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

  return { input, format, result, isLoading, errorMessage, statusText, statusType, convert, clearAll }
}
