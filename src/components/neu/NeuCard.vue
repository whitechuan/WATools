<template>
  <div
    class="neu-card"
    :class="[
      `neu-card--${elevation}`,
      { 'neu-card--hoverable': hoverable }
    ]"
  >
    <div v-if="$slots.header || title" class="neu-card__header">
      <slot name="header">
        <h3 class="neu-card__title">{{ title }}</h3>
      </slot>
    </div>
    <div class="neu-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="neu-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NeuCard' })

withDefaults(defineProps<{
  title?: string
  elevation?: 'flat' | 'raised' | 'high'
  hoverable?: boolean
}>(), {
  title: '',
  elevation: 'raised',
  hoverable: false,
})
</script>

<style scoped>
.neu-card {
  background: var(--neu-bg);
  border-radius: var(--neu-radius-lg);
  padding: 0;
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.neu-card--flat {
  box-shadow: var(--neu-shadow-flat);
}

.neu-card--raised {
  box-shadow: var(--neu-shadow-raised);
}

.neu-card--high {
  box-shadow: 10px 10px 20px var(--neu-shadow-dark), -10px -10px 20px var(--neu-shadow-light);
}

.neu-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 12px 12px 24px var(--neu-shadow-dark), -12px -12px 24px var(--neu-shadow-light);
}

.neu-card__header {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
}

.neu-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.neu-card__body {
  padding: var(--spacing-lg);
}

.neu-card__footer {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}
</style>
