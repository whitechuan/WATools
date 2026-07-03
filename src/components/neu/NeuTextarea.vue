<template>
  <div class="neu-textarea-wrapper" :class="{ 'neu-textarea-wrapper--focused': isFocused }">
    <textarea
      class="neu-textarea-field"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    ></textarea>
    <span v-if="showCount" class="neu-textarea-count">
      {{ modelValue?.length || 0 }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'NeuTextarea' })

withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number
  showCount?: boolean
}>(), {
  modelValue: '',
  placeholder: '',
  rows: 6,
  showCount: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isFocused = ref(false)

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.neu-textarea-wrapper {
  position: relative;
  background: var(--neu-bg);
  border-radius: var(--neu-radius);
  box-shadow: var(--neu-shadow-pressed);
  transition: box-shadow var(--transition-normal);
}

.neu-textarea-wrapper--focused {
  box-shadow: var(--neu-shadow-pressed), 0 0 0 3px rgba(108, 99, 255, 0.15);
}

.neu-textarea-field {
  width: 100%;
  padding: var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.neu-textarea-field::placeholder {
  color: var(--text-muted);
}

.neu-textarea-count {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
</style>
