<template>
  <div class="hash-calculator-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="hash-calculator-view__status">
      <div class="hash-calculator-view__status-inner">
        <span
          class="hash-calculator-view__status-text"
          :class="{
            'hash-calculator-view__status-text--error': statusType === 'error',
            'hash-calculator-view__status-text--success': statusType === 'success',
            'hash-calculator-view__status-text--idle': statusType === 'idle',
          }"
        >
          {{ statusText }}
        </span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="hash-calculator-view__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="#️⃣ Hash 计算器" elevation="raised" class="hash-calculator-view__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="输入要计算哈希值的文本..."
          class="hash-calculator-view__textarea"
        />
        <template #footer>
          <div class="hash-calculator-view__actions">
            <NeuButton type="primary" :loading="isLoading" @click="calculate">
              计算
            </NeuButton>
            <NeuButton @click="clearAll">清空</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 结果区 -->
      <div class="hash-calculator-view__output-area">
        <NeuCard
          v-for="algo in algorithms"
          :key="algo.key"
          elevation="raised"
          class="hash-calculator-view__result-card"
        >
          <template #header>
            <div class="hash-calculator-view__card-header">
              <h3 class="neu-card__title">{{ algo.label }}</h3>
              <CopyButton :content="result ? result[algo.key as keyof HashResult] : ''" />
            </div>
          </template>
          <div
            class="hash-calculator-view__hash-value"
            :class="{ 'hash-calculator-view__hash-value--clickable': result?.[algo.key as keyof HashResult] }"
            @click="copyValue(result?.[algo.key as keyof HashResult] || '')"
          >
            <template v-if="result">
              {{ result[algo.key as keyof HashResult] }}
            </template>
            <span v-else class="hash-calculator-view__placeholder">等待计算...</span>
          </div>
        </NeuCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { useHashCalculator } from '@/composables/useHashCalculator'
import type { HashResult } from '@/types/tools'

defineOptions({ name: 'HashCalculatorView' })

const { input, result, isLoading, statusText, statusType, calculate, clearAll } = useHashCalculator()

const algorithms = [
  { key: 'md5', label: 'MD5' },
  { key: 'sha1', label: 'SHA-1' },
  { key: 'sha256', label: 'SHA-256' },
  { key: 'sha512', label: 'SHA-512' },
]

async function copyValue(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
</script>

<style scoped>
.hash-calculator-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.hash-calculator-view__status {
  flex-shrink: 0;
}

.hash-calculator-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.hash-calculator-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.hash-calculator-view__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.hash-calculator-view__status-text--error {
  color: var(--color-error);
}

.hash-calculator-view__status-text--success {
  color: var(--color-success);
}

.hash-calculator-view__status-text--idle {
  color: var(--text-muted);
}

/* 双栏布局 */
.hash-calculator-view__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .hash-calculator-view__columns {
    grid-template-columns: 1fr;
  }
}

/* 左栏卡片 */
.hash-calculator-view__input-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.hash-calculator-view__input-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hash-calculator-view__input-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.hash-calculator-view__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hash-calculator-view__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hash-calculator-view__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hash-calculator-view__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 操作按钮 */
.hash-calculator-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 右栏结果区 */
.hash-calculator-view__output-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hash-calculator-view__output-area::-webkit-scrollbar {
  display: none;
}

.hash-calculator-view__result-card {
  flex-shrink: 0;
}

.hash-calculator-view__result-card :deep(.neu-card__body) {
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}

.hash-calculator-view__hash-value {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.6;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* 卡片头部 */
.hash-calculator-view__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.hash-calculator-view__card-header :deep(.copy-button) {
  padding: 4px 10px;
  font-size: var(--font-size-sm);
}

/* 点击复制 */
.hash-calculator-view__hash-value--clickable {
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
}

.hash-calculator-view__hash-value--clickable:hover {
  box-shadow: var(--neu-shadow-pressed), 0 0 0 2px rgba(108, 99, 255, 0.15);
}

.hash-calculator-view__hash-value--clickable:active {
  opacity: 0.85;
}

.hash-calculator-view__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
