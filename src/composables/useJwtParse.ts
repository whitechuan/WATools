import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useDatabase } from './useDatabase'
import type { JwtDecodeResult, JwtVerifyResult } from '@/types/tools'

export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512'

const TOOL_ID = 'jwt-parser'

export function useJwtParse() {
  const { addHistory, getToolPreference, setToolPreference } = useDatabase()

  // 解析状态
  const token = ref('')
  const decodeResult = ref<JwtDecodeResult | null>(null)
  const decodeError = ref<string | null>(null)
  const isDecoding = ref(false)

  // 签名验证状态
  const secret = ref('')
  const algorithm = ref<JwtAlgorithm>('HS256')
  const verifyResult = ref<JwtVerifyResult | null>(null)
  const verifyError = ref<string | null>(null)
  const isVerifying = ref(false)

  // 解码 JWT
  async function decodeJwt() {
    const trimmedToken = token.value.trim()
    if (!trimmedToken) {
      decodeError.value = '请输入 JWT Token'
      return
    }

    isDecoding.value = true
    decodeError.value = null
    decodeResult.value = null
    verifyResult.value = null
    verifyError.value = null

    try {
      const result = await invoke<JwtDecodeResult>('decode_jwt', { token: trimmedToken })
      decodeResult.value = result

      // 保存历史记录
      await addHistory(TOOL_ID, trimmedToken, JSON.stringify(result))
    } catch (e) {
      decodeError.value = typeof e === 'string' ? e : (e as Error).message || '解码失败'
    } finally {
      isDecoding.value = false
    }
  }

  // 验证签名
  async function verifySignature() {
    const trimmedToken = token.value.trim()
    if (!trimmedToken) {
      verifyError.value = '请先输入 JWT Token'
      return
    }
    if (!secret.value) {
      verifyError.value = '请输入密钥'
      return
    }

    isVerifying.value = true
    verifyError.value = null
    verifyResult.value = null

    try {
      const result = await invoke<JwtVerifyResult>('verify_jwt_signature', {
        token: trimmedToken,
        secret: secret.value,
        algorithm: algorithm.value,
      })
      verifyResult.value = result

      // 保存算法偏好
      await setToolPreference(TOOL_ID, 'algorithm', algorithm.value)
    } catch (e) {
      verifyError.value = typeof e === 'string' ? e : (e as Error).message || '验证失败'
    } finally {
      isVerifying.value = false
    }
  }

  // 加载用户偏好
  async function loadPreferences() {
    try {
      const savedAlgorithm = await getToolPreference(TOOL_ID, 'algorithm')
      if (savedAlgorithm && ['HS256', 'HS384', 'HS512'].includes(savedAlgorithm)) {
        algorithm.value = savedAlgorithm as JwtAlgorithm
      }
    } catch {
      // 忽略加载失败
    }
  }

  // 清空
  function clear() {
    token.value = ''
    decodeResult.value = null
    decodeError.value = null
    verifyResult.value = null
    verifyError.value = null
    secret.value = ''
  }

  return {
    // 状态
    token,
    decodeResult,
    decodeError,
    isDecoding,
    secret,
    algorithm,
    verifyResult,
    verifyError,
    isVerifying,
    // 方法
    decodeJwt,
    verifySignature,
    loadPreferences,
    clear,
  }
}
