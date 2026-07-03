<template>
  <div class="neu-tabs">
    <div class="neu-tabs__track">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="neu-tabs__item"
        :class="{ 'neu-tabs__item--active': tab.key === modelValue }"
        @click="selectTab(tab.key)"
      >
        <span v-if="tab.icon" class="neu-tabs__icon">{{ tab.icon }}</span>
        <span class="neu-tabs__label">{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NeuTabs' })

export interface TabOption {
  key: string
  label: string
  icon?: string
}

withDefaults(defineProps<{
  modelValue?: string
  tabs?: TabOption[]
}>(), {
  modelValue: '',
  tabs: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

function selectTab(key: string) {
  emit('update:modelValue', key)
  emit('change', key)
}
</script>

<style scoped>
.neu-tabs {
  width: 100%;
}

.neu-tabs__track {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: var(--neu-bg);
  border-radius: var(--neu-radius);
  box-shadow: var(--neu-shadow-pressed);
}

.neu-tabs__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
}

.neu-tabs__item:hover:not(.neu-tabs__item--active) {
  color: var(--text-primary);
  background: var(--neu-bg-dark);
}

.neu-tabs__item--active {
  color: var(--color-primary);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
}

.neu-tabs__icon {
  font-size: var(--font-size-lg);
}

.neu-tabs__label {
  white-space: nowrap;
}
</style>
