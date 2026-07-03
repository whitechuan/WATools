<template>
  <aside class="app-sidebar neu-raised">
    <div class="app-sidebar__brand">
      <span class="app-sidebar__logo">🧰</span>
      <span class="app-sidebar__title">WATools</span>
    </div>

    <nav class="app-sidebar__nav">
      <RouterLink
        v-for="tool in TOOL_REGISTRY"
        :key="tool.id"
        :to="tool.path"
        class="app-sidebar__item"
        :class="{ 'app-sidebar__item--active': route.path === tool.path }"
      >
        <span class="app-sidebar__icon">{{ tool.icon }}</span>
        <span class="app-sidebar__name">{{ tool.name }}</span>
      </RouterLink>
    </nav>

    <div class="app-sidebar__footer">
      <RouterLink
        to="/settings"
        class="app-sidebar__item"
        :class="{ 'app-sidebar__item--active': route.path === '/settings' }"
      >
        <span class="app-sidebar__icon">⚙️</span>
        <span class="app-sidebar__name">设置</span>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { TOOL_REGISTRY } from '@/utils/toolRegistry'

defineOptions({ name: 'AppSidebar' })

const route = useRoute()
</script>

<style scoped>
.app-sidebar {
  width: 220px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-sm);
}

.app-sidebar__logo {
  font-size: var(--font-size-2xl);
}

.app-sidebar__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.app-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
}

.app-sidebar__footer {
  margin-top: auto;
}

.app-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: box-shadow var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.app-sidebar__item:hover {
  box-shadow: var(--neu-shadow-flat);
  color: var(--text-primary);
  transform: translateX(2px);
}

.app-sidebar__item--active {
  box-shadow: var(--neu-shadow-pressed);
  color: var(--color-primary);
  font-weight: 600;
}

.app-sidebar__item--active:hover {
  box-shadow: var(--neu-shadow-pressed);
  transform: none;
}

.app-sidebar__icon {
  font-size: var(--font-size-lg);
  width: 24px;
  text-align: center;
}

.app-sidebar__name {
  font-size: var(--font-size-base);
}
</style>
