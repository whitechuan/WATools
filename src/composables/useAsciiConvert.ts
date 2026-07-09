import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export function useAsciiConvert() {
  const input = ref('')
  // 主输出区内容（十进制 ASCII 或转换回的文本）
  const output = ref('')
  // 十六进制对照（仅「文本 → ASCII」时展示）
  const hexOutput = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (output.value) return '✓ 转换完成'
    return '🔢 输入内容后进行 ASCII 码转换'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (output.value) return 'success'
    return 'idle'
  })

  // 文本 → ASCII：主输出显示十进制，下方小标签显示十六进制对照
  async function textToAscii() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const [dec, hex] = await Promise.all([
        invoke<string>('text_to_ascii', { input: input.value }),
        invoke<string>('text_to_hex_ascii', { input: input.value }),
      ])
      output.value = dec
      hexOutput.value = hex
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  // ASCII → 文本：将空格分隔的十进制 ASCII 码转回文本
  async function asciiToText() {
    if (!input.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<string>('ascii_to_text', { input: input.value })
      output.value = result
      hexOutput.value = ''
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    input.value = ''
    output.value = ''
    hexOutput.value = ''
    errorMessage.value = ''
  }

  return {
    input,
    output,
    hexOutput,
    isLoading,
    errorMessage,
    statusText,
    statusType,
    textToAscii,
    asciiToText,
    clearAll,
  }
}
