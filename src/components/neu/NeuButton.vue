<template>
  <button
    class="neu-button"
    :class="[
      `neu-button--${type}`,
      `neu-button--${size}`,
      { 'neu-button--loading': loading, 'neu-button--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="neu-button__spinner"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ name: 'NeuButton' })

const props = withDefaults(defineProps<{
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}>(), {
  type: 'default',
  size: 'md',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.neu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;
  border-radius: var(--neu-radius);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  color: var(--text-primary);
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  outline: none;
  user-select: none;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast), background var(--transition-fast);
}

.neu-button:hover:not(:disabled) {
  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
  transform: translateY(-1px);
}

.neu-button:active:not(:disabled) {
  box-shadow: var(--neu-shadow-pressed);
  transform: translateY(0) scale(0.97);
}

/* Sizes */
.neu-button--sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  border-radius: var(--neu-radius-sm);
}

.neu-button--md {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
}

.neu-button--lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  border-radius: var(--neu-radius-lg);
}

/* Types */
.neu-button--primary {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: var(--text-inverse);
}

.neu-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
}

.neu-button--success {
  background: linear-gradient(135deg, var(--color-success), #27ae60);
  color: var(--text-inverse);
}

.neu-button--warning {
  background: linear-gradient(135deg, var(--color-warning), #e69500);
  color: var(--text-inverse);
}

.neu-button--danger {
  background: linear-gradient(135deg, var(--color-error), #e03e4a);
  color: var(--text-inverse);
}

/* Disabled */
.neu-button--disabled,
.neu-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: var(--neu-shadow-flat) !important;
}

/* Loading */
.neu-button--loading {
  pointer-events: none;
}

.neu-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: neu-spin 0.8s linear infinite;
}

@keyframes neu-spin {
  to { transform: rotate(360deg); }
}
</style>
