import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Base64Result } from '@/types/tools'

export function useBase64Codec() {
  const input = ref('')
  const output = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const sizeBefore = ref(0)
  const sizeAfter = ref(0)

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (sizeBefore.value > 0) return `✓ 转换完成 │ 输入: ${sizeBefore.value} bytes │ 输出: ${sizeAfter.value} bytes`
    return '🔤 输入文本后进行 Base64 编码或解码'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (sizeBefore.value > 0) return 'success'
    return 'idle'
  })

  async function encode() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<Base64Result>('base64_encode', { input: input.value })
      output.value = result.output
      sizeBefore.value = result.size_before
      sizeAfter.value = result.size_after
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
      const result = await invoke<Base64Result>('base64_decode', { input: input.value })
      output.value = result.output
      sizeBefore.value = result.size_before
      sizeAfter.value = result.size_after
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
    sizeBefore.value = 0
    sizeAfter.value = 0
  }

  return { input, output, isLoading, errorMessage, statusText, statusType, sizeBefore, sizeAfter, encode, decode, clearAll }
}
