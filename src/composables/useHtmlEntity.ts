import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export function useHtmlEntity() {
  const input = ref('')
  const output = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (output.value) return '✓ 转换完成'
    return '🏷️ 输入文本后进行 HTML 实体编码或解码'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (output.value) return 'success'
    return 'idle'
  })

  async function encode() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<string>('html_entity_encode', { input: input.value })
      output.value = result
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  async function decode() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<string>('html_entity_decode', { input: input.value })
      output.value = result
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    input.value = ''
    output.value = ''
    errorMessage.value = ''
  }

  return { input, output, isLoading, errorMessage, statusText, statusType, encode, decode, clearAll }
}
