import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { SymmetricEncryptResult } from '@/types/tools'

export function useSymmetricCrypto() {
  const plaintext = ref('')
  const password = ref('')
  const algorithm = ref<'aes' | 'chacha20'>('aes')
  const encryptResult = ref<SymmetricEncryptResult | null>(null)

  const ciphertextInput = ref('')
  const nonceInput = ref('')
  const decryptPassword = ref('')
  const decryptAlgorithm = ref<'aes' | 'chacha20'>('aes')
  const decryptResult = ref('')

  const error = ref('')

  async function encrypt() {
    try {
      error.value = ''
      if (!plaintext.value.trim() || !password.value.trim()) {
        error.value = '请填写明文和密码'
        return
      }
      const cmd = algorithm.value === 'aes' ? 'aes_gcm_encrypt' : 'chacha20_encrypt'
      encryptResult.value = await invoke<SymmetricEncryptResult>(cmd, {
        plaintext: plaintext.value,
        password: password.value
      })
    } catch (e) {
      error.value = String(e)
      encryptResult.value = null
    }
  }

  async function decrypt() {
    try {
      error.value = ''
      if (!ciphertextInput.value.trim() || !nonceInput.value.trim() || !decryptPassword.value.trim()) {
        error.value = '请填写密文、Nonce和密码'
        return
      }
      const cmd = decryptAlgorithm.value === 'aes' ? 'aes_gcm_decrypt' : 'chacha20_decrypt'
      decryptResult.value = await invoke<string>(cmd, {
        ciphertext: ciphertextInput.value,
        nonce: nonceInput.value,
        password: decryptPassword.value
      })
    } catch (e) {
      error.value = String(e)
      decryptResult.value = ''
    }
  }

  function clearEncrypt() {
    plaintext.value = ''
    password.value = ''
    encryptResult.value = null
    error.value = ''
  }

  function clearDecrypt() {
    ciphertextInput.value = ''
    nonceInput.value = ''
    decryptPassword.value = ''
    decryptResult.value = ''
    error.value = ''
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
  }

  return {
    plaintext, password, algorithm, encryptResult,
    ciphertextInput, nonceInput, decryptPassword, decryptAlgorithm, decryptResult,
    error, encrypt, decrypt, clearEncrypt, clearDecrypt, copyText
  }
}
