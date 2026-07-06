import { ref, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useDatabase } from '@/composables/useDatabase'
import type { JsonFormatResult, JsonValidationResult, JsonStats } from '@/types/tools'

const TOOL_ID = 'json-formatter'

export function useJsonFormat() {
  const { getToolPreference, setToolPreference, addHistory } = useDatabase()

  // 状态
  const input = ref('')
  const output = ref('')
  const indent = ref<number>(2)
  const autoValidate = ref(true)
  const isLoading = ref(false)

  // 验证状态
  const validation = ref<JsonValidationResult | null>(null)
  const stats = ref<JsonStats | null>(null)
  const errorMessage = ref('')

  // 加载用户偏好
  async function loadPreferences() {
    try {
      const savedIndent = await getToolPreference(TOOL_ID, 'indent')
      if (savedIndent) {
        indent.value = parseInt(savedIndent, 10)
      }
      const savedAutoValidate = await getToolPreference(TOOL_ID, 'autoValidate')
      if (savedAutoValidate !== null) {
        autoValidate.value = savedAutoValidate === 'true'
      }
    } catch {
      // 偏好加载失败时使用默认值
    }
  }

  // 保存偏好
  async function saveIndentPreference(value: number) {
    indent.value = value
    try {
      await setToolPreference(TOOL_ID, 'indent', String(value))
    } catch {
      // 忽略保存失败
    }
  }

  // 格式化
  async function formatJson() {
    if (!input.value.trim()) {
      errorMessage.value = '请输入 JSON 内容'
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<JsonFormatResult>('format_json', {
        input: input.value,
        indent: indent.value
      })
      output.value = result.formatted
      stats.value = result.stats
      validation.value = { valid: true, error_message: null, error_position: null, suggestions: [] }
      await addHistory(TOOL_ID, input.value, result.formatted)
    } catch (e) {
      errorMessage.value = String(e)
      output.value = ''
      stats.value = null
    } finally {
      isLoading.value = false
    }
  }

  // 压缩
  async function minifyJson() {
    if (!input.value.trim()) {
      errorMessage.value = '请输入 JSON 内容'
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const result = await invoke<string>('minify_json', { input: input.value })
      output.value = result
      stats.value = null
      validation.value = { valid: true, error_message: null, error_position: null, suggestions: [] }
      await addHistory(TOOL_ID, input.value, result)
    } catch (e) {
      errorMessage.value = String(e)
      output.value = ''
    } finally {
      isLoading.value = false
    }
  }

  // 验证
  async function validateJson() {
    if (!input.value.trim()) {
      validation.value = null
      errorMessage.value = ''
      return
    }
    try {
      const result = await invoke<JsonValidationResult>('validate_json', { input: input.value })
      validation.value = result
      if (result.valid) {
        errorMessage.value = ''
      } else {
        errorMessage.value = result.error_message || '无效 JSON'
      }
    } catch (e) {
      errorMessage.value = String(e)
    }
  }

  // 清空重置
  function clearAll() {
    input.value = ''
    output.value = ''
    validation.value = null
    stats.value = null
    errorMessage.value = ''
  }

  // 自动验证（带防抖）
  let validateTimer: ReturnType<typeof setTimeout> | null = null
  watch(input, (val) => {
    if (!autoValidate.value || !val.trim()) {
      validation.value = null
      errorMessage.value = ''
      return
    }
    if (validateTimer) clearTimeout(validateTimer)
    validateTimer = setTimeout(() => {
      validateJson()
    }, 500)
  })

  return {
    input,
    output,
    indent,
    autoValidate,
    isLoading,
    validation,
    stats,
    errorMessage,
    loadPreferences,
    saveIndentPreference,
    formatJson,
    minifyJson,
    validateJson,
    clearAll
  }
}
