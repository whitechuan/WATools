import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { RsaKeyPairResult } from '@/types/tools'

export function useAsymmetricCrypto() {
  // 密钥生成
  const keySize = ref<2048 | 4096>(2048)
  const keyPair = ref<RsaKeyPairResult | null>(null)
  const generating = ref(false)

  // 加解密
  const publicKeyPem = ref('')
  const privateKeyPem = ref('')
  const plaintext = ref('')
  const ciphertext = ref('')

  // 签名验证
  const signMessage = ref('')
  const signPrivateKey = ref('')
  const signature = ref('')
  const verifyMessage = ref('')
  const verifySignature = ref('')
  const verifyPublicKey = ref('')
  const verifyResult = ref<boolean | null>(null)

  const error = ref('')

  async function generateKeyPair() {
    try {
      error.value = ''
      generating.value = true
      keyPair.value = await invoke<RsaKeyPairResult>('rsa_generate_keypair', { bits: keySize.value })
      // 自动填充到加解密区域
      publicKeyPem.value = keyPair.value.public_key_pem
      privateKeyPem.value = keyPair.value.private_key_pem
      signPrivateKey.value = keyPair.value.private_key_pem
      verifyPublicKey.value = keyPair.value.public_key_pem
    } catch (e) {
      error.value = String(e)
    } finally {
      generating.value = false
    }
  }

  async function encrypt() {
    try {
      error.value = ''
      ciphertext.value = await invoke<string>('rsa_encrypt', {
        plaintext: plaintext.value,
        publicKeyPem: publicKeyPem.value
      })
    } catch (e) {
      error.value = String(e)
    }
  }

  async function decrypt() {
    try {
      error.value = ''
      plaintext.value = await invoke<string>('rsa_decrypt', {
        ciphertext: ciphertext.value,
        privateKeyPem: privateKeyPem.value
      })
    } catch (e) {
      error.value = String(e)
    }
  }

  async function sign() {
    try {
      error.value = ''
      signature.value = await invoke<string>('rsa_sign', {
        message: signMessage.value,
        privateKeyPem: signPrivateKey.value
      })
    } catch (e) {
      error.value = String(e)
    }
  }

  async function verify() {
    try {
      error.value = ''
      verifyResult.value = await invoke<boolean>('rsa_verify', {
        message: verifyMessage.value,
        signature: verifySignature.value,
        publicKeyPem: verifyPublicKey.value
      })
    } catch (e) {
      error.value = String(e)
      verifyResult.value = null
    }
  }

  function clearAll() {
    keyPair.value = null
    publicKeyPem.value = ''
    privateKeyPem.value = ''
    plaintext.value = ''
    ciphertext.value = ''
    signMessage.value = ''
    signPrivateKey.value = ''
    signature.value = ''
    verifyMessage.value = ''
    verifySignature.value = ''
    verifyPublicKey.value = ''
    verifyResult.value = null
    error.value = ''
  }

  return {
    keySize, keyPair, generating,
    publicKeyPem, privateKeyPem, plaintext, ciphertext,
    signMessage, signPrivateKey, signature,
    verifyMessage, verifySignature, verifyPublicKey, verifyResult,
    error, generateKeyPair, encrypt, decrypt, sign, verify, clearAll
  }
}
