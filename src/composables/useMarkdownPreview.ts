import { ref, computed, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export function useMarkdownPreview() {
  const input = ref('')
  const htmlOutput = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (htmlOutput.value) return '✓ 预览已更新'
    return '📖 输入 Markdown 文本实时预览'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (htmlOutput.value) return 'success'
    return 'idle'
  })

  async function convert() {
    if (!input.value.trim()) {
      htmlOutput.value = ''
      errorMessage.value = ''
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<string>('markdown_to_html', { input: input.value })
      htmlOutput.value = result
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  function scheduleConvert() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      convert()
    }, 300)
  }

  watch(input, () => {
    scheduleConvert()
  })

  function clearAll() {
    input.value = ''
    htmlOutput.value = ''
    errorMessage.value = ''
  }

  return { input, htmlOutput, isLoading, errorMessage, statusText, statusType, convert, clearAll }
}
