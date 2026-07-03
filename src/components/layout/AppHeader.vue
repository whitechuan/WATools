<template>
  <header class="app-header neu-flat">
    <h1 class="app-header__title">{{ pageTitle }}</h1>
    <div class="app-header__actions">
      <button
        class="app-header__theme-btn neu-btn"
        @click="showThemePanel = !showThemePanel"
      >
        🎨
      </button>
      <Transition name="scale">
        <div v-if="showThemePanel" class="app-header__theme-panel neu-raised">
          <ThemeSelector />
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeSelector from '@/components/common/ThemeSelector.vue'

defineOptions({ name: 'AppHeader' })

const route = useRoute()
const showThemePanel = ref(false)

const pageTitle = computed(() => {
  return (route.meta?.title as string) || 'WATools'
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.app-header__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.app-header__actions {
  position: relative;
}

.app-header__theme-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  font-size: var(--font-size-lg);
  border-radius: 50%;
}

.app-header__theme-panel {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  padding: var(--spacing-lg);
  z-index: 100;
  min-width: 280px;
}
</style>
