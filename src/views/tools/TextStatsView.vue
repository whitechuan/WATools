<template>
  <div class="text-stats-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="text-stats-view__status">
      <div
        class="text-stats-view__status-inner"
        :class="{
          'text-stats-view__status-success': statusType === 'success',
          'text-stats-view__status-error': statusType === 'error',
          'text-stats-view__status-idle': statusType === 'idle'
        }"
        :title="statusText"
      >
        <span class="text-stats-view__status-text">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 上半部分：输入区 + 统计卡片 -->
    <div class="text-stats-view__top">
      <NeuCard title="输入文本" elevation="raised" class="text-stats-view__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="在此输入文本，下方将实时显示统计结果..."
          :show-count="true"
          class="text-stats-view__textarea"
        />
        <template #footer>
          <div class="text-stats-view__actions">
            <NeuButton type="danger" @click="clearAll">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 统计卡片网格 -->
      <div class="text-stats-view__stats-grid">
        <NeuCard
          v-for="stat in statItems"
          :key="stat.key"
          elevation="raised"
          class="text-stats-view__stat-card"
        >
          <div class="text-stats-view__stat-inner">
            <span class="text-stats-view__stat-number">{{ stats ? stats[stat.key] : 0 }}</span>
            <span class="text-stats-view__stat-label">{{ stat.label }}</span>
          </div>
        </NeuCard>
      </div>
    </div>

    <!-- 下半部分：文本处理 -->
    <NeuCard title="文本处理" elevation="raised" class="text-stats-view__process-card">
      <div class="text-stats-view__process-buttons">
        <NeuButton
          v-for="op in processOperations"
          :key="op.key"
          :disabled="!input || isProcessing"
          @click="processText(op.key)"
        >
          {{ op.icon }} {{ op.label }}
        </NeuButton>
      </div>

      <!-- 处理结果输出区 -->
      <div v-if="output" class="text-stats-view__output-section">
        <div class="text-stats-view__output-header">
          <span class="text-stats-view__output-label">处理结果</span>
          <div class="text-stats-view__output-actions">
            <NeuButton @click="copyOutput">
              📋 复制
            </NeuButton>
            <NeuButton @click="applyOutputToInput">
              ⬆️ 应用到输入
            </NeuButton>
          </div>
        </div>
        <pre class="text-stats-view__output-pre">{{ output }}</pre>
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTextStats } from '@/composables/useTextStats'
import type { TextStatsResult } from '@/types/tools'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'

defineOptions({ name: 'TextStatsView' })

const {
  input,
  output,
  stats,
  isProcessing,
  statusText,
  statusType,
  calculate,
  processText,
  applyOutputToInput,
  clearAll
} = useTextStats()

const statItems: Array<{ key: keyof TextStatsResult; label: string }> = [
  { key: 'characters', label: '字符数' },
  { key: 'characters_no_space', label: '不含空格' },
  { key: 'words', label: '单词数' },
  { key: 'lines', label: '行数' },
  { key: 'paragraphs', label: '段落数' },
  { key: 'bytes', label: '字节数' },
]

const processOperations = [
  { key: 'uppercase', label: '转大写', icon: '🔠' },
  { key: 'lowercase', label: '转小写', icon: '🔡' },
  { key: 'capitalize', label: '首字母大写', icon: '🅰️' },
  { key: 'dedup_lines', label: '去重行', icon: '🧹' },
  { key: 'sort_lines', label: '排序行', icon: '🔢' },
  { key: 'remove_empty_lines', label: '去空行', icon: '✂️' },
  { key: 'trim_lines', label: '去首尾空白', icon: '📐' },
]

async function copyOutput() {
  if (output.value) {
    await navigator.clipboard.writeText(output.value)
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(input, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    calculate()
  }, 300)
})
</script>

<style scoped>
.text-stats-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.text-stats-view__status {
  flex-shrink: 0;
}

.text-stats-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.text-stats-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.text-stats-view__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.text-stats-view__status-success .text-stats-view__status-text {
  color: var(--color-success);
}

.text-stats-view__status-error .text-stats-view__status-text {
  color: var(--color-error);
}

.text-stats-view__status-idle .text-stats-view__status-text {
  color: var(--text-muted);
}

/* 上半部分：输入+统计 */
.text-stats-view__top {
  display: flex;
  gap: var(--spacing-lg);
  flex-shrink: 0;
}

.text-stats-view__input-card {
  flex: 1;
  min-width: 0;
}

.text-stats-view__input-card :deep(.neu-card__body) {
  display: flex;
  flex-direction: column;
}

.text-stats-view__textarea {
  display: flex;
  flex-direction: column;
}

.text-stats-view__textarea :deep(.neu-textarea-wrapper) {
  display: flex;
  flex-direction: column;
}

.text-stats-view__textarea :deep(.neu-textarea-field) {
  min-height: 140px;
  max-height: 200px;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.text-stats-view__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

.text-stats-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 统计卡片网格 */
.text-stats-view__stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--spacing-md);
  min-width: 220px;
  max-width: 280px;
}

.text-stats-view__stat-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.text-stats-view__stat-card :deep(.neu-card__body) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-stats-view__stat-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.text-stats-view__stat-number {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}

.text-stats-view__stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* 下半部分：文本处理 */
.text-stats-view__process-card {
  flex: 1;
  min-height: 0;
}

.text-stats-view__process-card :deep(.neu-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.text-stats-view__process-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.text-stats-view__output-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.text-stats-view__output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.text-stats-view__output-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.text-stats-view__output-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.text-stats-view__output-pre {
  flex: 1;
  min-height: 80px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--neu-bg-inset, var(--bg-secondary));
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  scrollbar-width: thin;
}

@media (max-width: 900px) {
  .text-stats-view__top {
    flex-direction: column;
  }

  .text-stats-view__stats-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    max-width: none;
  }
}

@media (max-width: 600px) {
  .text-stats-view__stats-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}
</style>
