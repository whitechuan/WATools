import { ref, computed } from 'vue'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'

export function useUuidGenerator() {
  const version = ref('v4')
  const count = ref(5)
  const result = ref<string[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (result.value.length > 0) return `✓ 已生成 ${result.value.length} 个 UUID (${version.value})`
    return '🆔 选择版本和数量后生成 UUID'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (result.value.length > 0) return 'success'
    return 'idle'
  })

  function generate() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const n = Math.min(count.value, 100)
      const generator = version.value === 'v7' ? uuidv7 : uuidv4
      result.value = Array.from({ length: n }, () => generator())
    } catch (e: any) {
      errorMessage.value = e.toString()
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    result.value = []
    errorMessage.value = ''
  }

  async function copyAll() {
    if (result.value.length > 0) {
      await navigator.clipboard.writeText(result.value.join('\n'))
    }
  }

  async function copySingle(value: string) {
    await navigator.clipboard.writeText(value)
  }

  return { version, count, result, isLoading, errorMessage, statusText, statusType, generate, clearAll, copyAll, copySingle }
}
