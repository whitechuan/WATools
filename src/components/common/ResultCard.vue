<template>
  <div class="result-card neu-raised">
    <div class="result-card__header" v-if="title">
      <h3 class="result-card__title">{{ title }}</h3>
      <div class="result-card__actions" v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="result-card__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ResultCard' })

defineProps<{
  title?: string
}>()
</script>

<style scoped>
.result-card {
  padding: var(--spacing-lg);
}

.result-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.result-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.result-card__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.result-card__body {
  color: var(--text-secondary);
}
</style>
