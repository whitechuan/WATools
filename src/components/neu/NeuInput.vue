<template>
  <div class="neu-input-wrapper" :class="{ 'neu-input-wrapper--disabled': disabled, 'neu-input-wrapper--focused': isFocused }">
    <input
      ref="inputRef"
      class="neu-input-field"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <button
      v-if="clearable && modelValue"
      class="neu-input-clear"
      type="button"
      @click="handleClear"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'NeuInput' })

withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  type?: 'text' | 'number' | 'password'
  clearable?: boolean
  disabled?: boolean
}>(), {
  modelValue: '',
  placeholder: '',
  type: 'text',
  clearable: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'clear'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}
</script>

<style scoped>
.neu-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  transition: box-shadow var(--transition-normal);
}

.neu-input-wrapper--focused {
  box-shadow: var(--neu-shadow-pressed), 0 0 0 3px rgba(108, 99, 255, 0.15);
}

.neu-input-wrapper--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.neu-input-field {
  flex: 1;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  outline: none;
}

.neu-input-field::placeholder {
  color: var(--text-muted);
}

.neu-input-field:disabled {
  cursor: not-allowed;
}

.neu-input-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-sm);
  background: var(--neu-bg-dark);
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.neu-input-clear:hover {
  background: var(--color-error);
  color: var(--text-inverse);
}
</style>
