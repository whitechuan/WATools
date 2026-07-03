<template>
  <span
    class="neu-tag"
    :class="[`neu-tag--${type}`]"
  >
    <slot />
    <button
      v-if="closable"
      class="neu-tag__close"
      type="button"
      @click.stop="handleClose"
    >
      &times;
    </button>
  </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'NeuTag' })

withDefaults(defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  closable?: boolean
}>(), {
  type: 'primary',
  closable: false,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.neu-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 2px var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background: var(--neu-bg);
  box-shadow: 2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light);
  transition: all var(--transition-fast);
}

.neu-tag--primary {
  color: var(--color-primary);
}

.neu-tag--success {
  color: var(--color-success);
}

.neu-tag--warning {
  color: var(--color-warning);
}

.neu-tag--danger {
  color: var(--color-error);
}

.neu-tag--info {
  color: var(--color-info);
}

.neu-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 2px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: inherit;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-fast), background var(--transition-fast);
}

.neu-tag__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}
</style>
