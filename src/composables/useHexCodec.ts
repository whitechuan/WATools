import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export function useHexCodec() {
  const input = ref('')
  const output = ref('')
  const error = ref('')

  async function encode() {
    try {
      error.value = ''
      output.value = await invoke<string>('hex_encode', { input: input.value })
    } catch (e) {
      error.value = String(e)
      output.value = ''
    }
  }

  async function decode() {
    try {
      error.value = ''
      output.value = await invoke<string>('hex_decode', { input: input.value })
    } catch (e) {
      error.value = String(e)
      output.value = ''
    }
  }

  function clear() {
    input.value = ''
    output.value = ''
    error.value = ''
  }

  function copyOutput() {
    if (output.value) {
      navigator.clipboard.writeText(output.value)
    }
  }

  return { input, output, error, encode, decode, clear, copyOutput }
}
