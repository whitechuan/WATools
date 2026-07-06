import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { HttpResponse, HttpHeader } from '@/types/tools'

export function useHttpClient() {
  const url = ref('')
  const method = ref('GET')
  const headers = ref<HttpHeader[]>([{ key: '', value: '' }])
  const body = ref('')
  const response = ref<HttpResponse | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const statusText = computed(() => {
    if (errorMessage.value) return `⚠ ${errorMessage.value}`
    if (response.value) return `✓ ${response.value.status} ${response.value.status_text} │ ${response.value.elapsed_ms}ms │ ${response.value.size_bytes} bytes`
    return '🌐 输入 URL 发送 HTTP 请求'
  })

  const statusType = computed(() => {
    if (errorMessage.value) return 'error'
    if (response.value) {
      if (response.value.status >= 400) return 'error'
      return 'success'
    }
    return 'idle'
  })

  function addHeader() {
    headers.value.push({ key: '', value: '' })
  }

  function removeHeader(index: number) {
    headers.value.splice(index, 1)
  }

  async function send() {
    if (!url.value.trim()) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      response.value = await invoke<HttpResponse>('send_http_request', {
        url: url.value,
        method: method.value,
        headers: headers.value.filter(h => h.key.trim() !== ''),
        body: body.value,
      })
    } catch (e: any) {
      errorMessage.value = e.toString()
      response.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clearAll() {
    url.value = ''
    method.value = 'GET'
    headers.value = [{ key: '', value: '' }]
    body.value = ''
    response.value = null
    errorMessage.value = ''
  }

  return { url, method, headers, body, response, isLoading, errorMessage, statusText, statusType, addHeader, removeHeader, send, clearAll }
}
