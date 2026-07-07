<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="app-layout__content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useTheme } from '@/composables/useTheme'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { initShortcuts, cleanupShortcuts } from '@/utils/shortcuts'

const { loadTheme } = useTheme()

onMounted(async () => {
  loadTheme()
  await initShortcuts()
  // 等待下一帧确保 DOM 已渲染，然后显示窗口
  await nextTick()
  const appWindow = getCurrentWindow()
  await appWindow.show()
  await appWindow.setFocus()
})

onUnmounted(() => {
  cleanupShortcuts()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--neu-bg);
}

.app-layout__content {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: var(--spacing-lg);
  overflow-y: auto;
}
</style>
