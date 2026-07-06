import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { RegexResult } from '@/types/tools'

export function useRegexTester() {
  const pattern = ref('')
  const testText = ref('')
  const flags = ref('') // i, m, s, x 等
  const result = ref<RegexResult | null>(null)
  const isLoading = ref(false)

  const statusText = computed(() => {
    if (result.value?.error) return `⚠ ${result.value.error}`
    if (result.value) return `✓ 匹配 ${result.value.match_count} 处`
    return '🎯 输入正则表达式和测试文本'
  })

  const statusType = computed(() => {
    if (result.value?.error) return 'error'
    if (result.value) return 'success'
    return 'idle'
  })

  async function test() {
    if (!pattern.value) return
    isLoading.value = true
    try {
      result.value = await invoke<RegexResult>('test_regex', {
        pattern: pattern.value,
        text: testText.value,
        flags: flags.value,
      })
    } catch (e: any) {
      result.value = { is_valid: false, matches: [], match_count: 0, error: e.toString() }
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    pattern.value = ''
    testText.value = ''
    flags.value = ''
    result.value = null
  }

  return { pattern, testText, flags, result, isLoading, statusText, statusType, test, clearAll }
}
