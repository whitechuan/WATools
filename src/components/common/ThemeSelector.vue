<template>
  <div class="theme-selector">
    <div class="theme-selector__grid">
      <div
        v-for="theme in THEME_LIST"
        :key="theme.id"
        class="theme-selector__item"
        :class="{ 'theme-selector__item--active': theme.id === currentTheme }"
        :title="theme.name"
        @click="setTheme(theme.id)"
      >
        <div
          class="theme-selector__swatch"
          :style="{ background: theme.preview }"
        >
          <span v-if="theme.id === currentTheme" class="theme-selector__check">&#10003;</span>
        </div>
        <span class="theme-selector__name">{{ theme.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme, THEME_LIST } from '@/composables/useTheme'

defineOptions({ name: 'ThemeSelector' })

const { currentTheme, setTheme } = useTheme()
</script>

<style scoped>
.theme-selector__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.theme-selector__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.theme-selector__swatch {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  box-shadow: var(--neu-shadow-raised);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.theme-selector__item:hover .theme-selector__swatch {
  transform: scale(1.1);
  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
}

.theme-selector__item--active .theme-selector__swatch {
  box-shadow: var(--neu-shadow-pressed);
  transform: scale(0.95);
}

.theme-selector__check {
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.theme-selector__name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.theme-selector__item--active .theme-selector__name {
  color: var(--color-primary);
  font-weight: 500;
}
</style>
