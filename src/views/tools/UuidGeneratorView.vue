<template>
  <div class="uuid-generator">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="uuid-generator__status">
      <div
        class="uuid-generator__status-inner"
        :class="`uuid-generator__status-${statusType}`"
      >
        <span>{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 控制区 -->
    <NeuCard title="UUID 生成器" elevation="raised" class="uuid-generator__control">
      <div class="uuid-generator__controls">
        <div class="uuid-generator__field">
          <label class="uuid-generator__label">版本</label>
          <NeuSelect
            :model-value="version"
            :options="versionOptions"
            placeholder="选择版本"
            @update:model-value="(v) => version = String(v)"
          />
        </div>
        <div class="uuid-generator__field">
          <label class="uuid-generator__label">数量</label>
          <NeuInput
            :model-value="String(count)"
            type="number"
            placeholder="1-100"
            @update:model-value="(v) => count = Number(v) || 1"
          />
        </div>
        <div class="uuid-generator__buttons">
          <NeuButton type="primary" @click="generate">生成</NeuButton>
          <NeuButton type="danger" @click="clearAll">🗑️ 清空</NeuButton>
          <NeuButton type="success" @click="copyAll">📋 全部复制</NeuButton>
        </div>
      </div>
    </NeuCard>

    <!-- 结果列表区 -->
    <NeuCard title="生成结果" elevation="raised" class="uuid-generator__result-card">
      <div class="uuid-generator__result neu-pressed">
        <template v-if="result.length > 0">
          <div
            v-for="(uuid, index) in result"
            :key="index"
            class="uuid-generator__item"
          >
            <span class="uuid-generator__uuid">{{ uuid }}</span>
            <button class="uuid-generator__copy-btn" @click="copySingle(uuid)" title="复制">
              📋
            </button>
          </div>
        </template>
        <span v-else class="uuid-generator__placeholder">结果将在此显示...</span>
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import { useUuidGenerator } from '@/composables/useUuidGenerator'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'

defineOptions({ name: 'UuidGeneratorView' })

const {
  version,
  count,
  result,
  statusText,
  statusType,
  generate,
  clearAll,
  copyAll,
  copySingle
} = useUuidGenerator()

const versionOptions = [
  { label: 'UUID v4 (随机)', value: 'v4' },
  { label: 'UUID v7 (时间有序)', value: 'v7' }
]
</script>

<style scoped>
.uuid-generator {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.uuid-generator__status {
  flex-shrink: 0;
}

.uuid-generator__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.uuid-generator__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
}

.uuid-generator__status-success {
  color: var(--color-success);
  font-weight: 500;
}

.uuid-generator__status-error {
  color: var(--color-error);
  font-weight: 500;
}

.uuid-generator__status-idle {
  color: var(--text-muted);
}

/* 控制区 */
.uuid-generator__control {
  flex-shrink: 0;
}

.uuid-generator__controls {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.uuid-generator__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 140px;
}

.uuid-generator__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.uuid-generator__buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 结果列表 */
.uuid-generator__result-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.uuid-generator__result-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.uuid-generator__result {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.uuid-generator__result::-webkit-scrollbar {
  display: none;
}

.uuid-generator__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  transition: background var(--transition-fast);
}

.uuid-generator__item:hover {
  background: var(--neu-bg-dark);
}

.uuid-generator__uuid {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  user-select: all;
}

.uuid-generator__copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--neu-radius-sm);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.uuid-generator__copy-btn:hover {
  box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
  transform: translateY(-1px);
}

.uuid-generator__copy-btn:active {
  box-shadow: var(--neu-shadow-pressed);
  transform: translateY(0) scale(0.95);
}

.uuid-generator__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .uuid-generator__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .uuid-generator__field {
    min-width: unset;
  }
}
</style>
