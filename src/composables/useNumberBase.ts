import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { NumberBaseResult } from '@/types/tools'

export function useNumberBase() {
  const input = ref('')
  const fromBase = ref<number>(10)
  const result = ref<NumberBaseResult>({ binary: '', octal: '', decimal: '', hex: '' })
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (result.value.binary || result.value.decimal) return '✓ 转换完成'
    return '🧮 输入数字后实时转换进制'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (result.value.binary || result.value.decimal) return 'success'
    return 'idle'
  })

  async function convert() {
    if (!input.value.trim()) {
      result.value = { binary: '', octal: '', decimal: '', hex: '' }
      errorMessage.value = ''
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const [binary, octal, decimal, hex] = await Promise.all([
        invoke<string>('number_base_convert', { input: input.value, fromBase: fromBase.value, toBase: 2 }),
        invoke<string>('number_base_convert', { input: input.value, fromBase: fromBase.value, toBase: 8 }),
        invoke<string>('number_base_convert', { input: input.value, fromBase: fromBase.value, toBase: 10 }),
        invoke<string>('number_base_convert', { input: input.value, fromBase: fromBase.value, toBase: 16 }),
      ])
      result.value = { binary, octal, decimal, hex }
    } catch (e: any) {
      errorMessage.value = e.toString()
      result.value = { binary: '', octal: '', decimal: '', hex: '' }
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    input.value = ''
    result.value = { binary: '', octal: '', decimal: '', hex: '' }
    errorMessage.value = ''
  }

  return { input, fromBase, result, isLoading, errorMessage, statusText, statusType, convert, clearAll }
}
