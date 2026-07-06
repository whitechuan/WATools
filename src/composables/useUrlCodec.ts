import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { UrlEncodeResult, UrlDecodeResult, UrlParseResult } from '@/types/tools'

export function useUrlCodec() {
  const input = ref('')
  const output = ref('')
  const parseResult = ref<UrlParseResult | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (output.value || parseResult.value) return `✓ 处理完成`
    return '🔗 输入 URL 或文本进行编码/解码/解析'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (output.value || parseResult.value) return 'success'
    return 'idle'
  })

  async function encode() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    parseResult.value = null
    try {
      const result = await invoke<UrlEncodeResult>('url_encode', { input: input.value })
      output.value = result.encoded
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
    parseResult.value = null
    try {
      const result = await invoke<UrlDecodeResult>('url_decode', { input: input.value })
      output.value = result.decoded
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  async function parse() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      parseResult.value = await invoke<UrlParseResult>('url_parse', { input: input.value })
      output.value = ''
    } catch (e: any) {
      errorMessage.value = e.toString()
      parseResult.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    input.value = ''
    output.value = ''
    parseResult.value = null
    errorMessage.value = ''
  }

  return { input, output, parseResult, isLoading, errorMessage, statusText, statusType, encode, decode, parse, clearAll }
}
