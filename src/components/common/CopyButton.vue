<template>
  <button
    class="copy-button neu-btn"
    :class="{ 'copy-button--copied': copied }"
    @click="handleCopy"
  >
    {{ copied ? '已复制 ✓' : label }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'CopyButton' })

const props = withDefaults(defineProps<{
  content: string
  label?: string
}>(), {
  label: '复制'
})

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // fallback
    const textarea = document.createElement('textarea')
    textarea.value = props.content
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  }
}
</script>

<style scoped>
.copy-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.copy-button--copied {
  background: linear-gradient(135deg, var(--color-success), #27ae60);
  color: var(--text-inverse);
}
</style>
