import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { PasswordStrengthResult } from '@/types/tools'

export function usePasswordGenerator() {
  // 密码生成
  const length = ref(16)
  const uppercase = ref(true)
  const lowercase = ref(true)
  const digits = ref(true)
  const symbols = ref(true)
  const generatedPassword = ref('')

  // 密码强度检测
  const passwordToCheck = ref('')
  const strengthResult = ref<PasswordStrengthResult | null>(null)

  const error = ref('')
  const isLoading = ref(false)

  async function generate() {
    try {
      error.value = ''
      isLoading.value = true
      generatedPassword.value = await invoke<string>('generate_password', {
        length: length.value,
        uppercase: uppercase.value,
        lowercase: lowercase.value,
        digits: digits.value,
        symbols: symbols.value,
      })
      // 自动检测生成密码的强度
      passwordToCheck.value = generatedPassword.value
      await checkStrength()
    } catch (e) {
      error.value = String(e)
    } finally {
      isLoading.value = false
    }
  }

  async function checkStrength() {
    try {
      error.value = ''
      if (!passwordToCheck.value) {
        strengthResult.value = null
        return
      }
      strengthResult.value = await invoke<PasswordStrengthResult>('check_password_strength', {
        password: passwordToCheck.value,
      })
    } catch (e) {
      error.value = String(e)
      strengthResult.value = null
    }
  }

  async function copyPassword() {
    if (generatedPassword.value) {
      try {
        await navigator.clipboard.writeText(generatedPassword.value)
      } catch {
        const textarea = document.createElement('textarea')
        textarea.value = generatedPassword.value
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
    }
  }

  function clearAll() {
    generatedPassword.value = ''
    passwordToCheck.value = ''
    strengthResult.value = null
    error.value = ''
  }

  return {
    length, uppercase, lowercase, digits, symbols, generatedPassword,
    passwordToCheck, strengthResult, error, isLoading,
    generate, checkStrength, copyPassword, clearAll
  }
}
