<template>
  <div class="hmac-calculator-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="hmac-calculator-view__status">
      <div class="hmac-calculator-view__status-inner">
        <span
          class="hmac-calculator-view__status-text"
          :class="{
            'hmac-calculator-view__status-text--error': !!error,
            'hmac-calculator-view__status-text--success': !!result && !error,
            'hmac-calculator-view__status-text--idle': !result && !error,
          }"
        >
          {{ statusText }}
        </span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="hmac-calculator-view__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="🔐 HMAC 计算器" elevation="raised" class="hmac-calculator-view__input-card">
        <div class="hmac-calculator-view__inputs">
          <NeuTextarea
            v-model="data"
            placeholder="输入要计算 HMAC 的数据..."
            class="hmac-calculator-view__textarea"
          />
          <NeuInput
            v-model="key"
            placeholder="输入密钥 (Key)..."
            class="hmac-calculator-view__key-input"
          />
        </div>
        <template #footer>
          <div class="hmac-calculator-view__actions">
            <NeuButton type="primary" :loading="isLoading" @click="calculate">
              计算
            </NeuButton>
            <NeuButton @click="clear">清空</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 结果区 -->
      <div class="hmac-calculator-view__output-area">
        <NeuCard
          v-for="algo in algorithms"
          :key="algo.key"
          elevation="raised"
          class="hmac-calculator-view__result-card"
        >
          <template #header>
            <div class="hmac-calculator-view__card-header">
              <h3 class="neu-card__title">{{ algo.label }}</h3>
              <CopyButton :content="result ? result[algo.key as keyof HmacResult] : ''" />
            </div>
          </template>
          <div
            class="hmac-calculator-view__hash-value"
            :class="{ 'hmac-calculator-view__hash-value--clickable': result?.[algo.key as keyof HmacResult] }"
            @click="copyValue(result?.[algo.key as keyof HmacResult] || '')"
          >
            <template v-if="result">
              {{ result[algo.key as keyof HmacResult] }}
            </template>
            <span v-else class="hmac-calculator-view__placeholder">等待计算...</span>
          </div>
        </NeuCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { useHmacCalculator } from '@/composables/useHmacCalculator'
import type { HmacResult } from '@/types/tools'

defineOptions({ name: 'HmacCalculatorView' })

const { data, key, result, error, isLoading, calculate, clear } = useHmacCalculator()

const algorithms = [
  { key: 'hmac_sha256', label: 'HMAC-SHA256' },
  { key: 'hmac_sha512', label: 'HMAC-SHA512' },
]

const statusText = computed(() => {
  if (error.value) return `❌ ${error.value}`
  if (result.value) return '✅ HMAC 计算完成'
  return '💡 输入数据和密钥后点击计算'
})

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
.hmac-calculator-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.hmac-calculator-view__status {
  flex-shrink: 0;
}

.hmac-calculator-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.hmac-calculator-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.hmac-calculator-view__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.hmac-calculator-view__status-text--error {
  color: var(--color-error);
}

.hmac-calculator-view__status-text--success {
  color: var(--color-success);
}

.hmac-calculator-view__status-text--idle {
  color: var(--text-muted);
}

/* 双栏布局 */
.hmac-calculator-view__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .hmac-calculator-view__columns {
    grid-template-columns: 1fr;
  }
}

/* 左栏卡片 */
.hmac-calculator-view__input-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.hmac-calculator-view__input-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hmac-calculator-view__input-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* 输入区容器 */
.hmac-calculator-view__inputs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* textarea 自适应 */
.hmac-calculator-view__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hmac-calculator-view__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hmac-calculator-view__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hmac-calculator-view__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 密钥输入框 */
.hmac-calculator-view__key-input {
  flex-shrink: 0;
}

/* 操作按钮 */
.hmac-calculator-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 右栏结果区 */
.hmac-calculator-view__output-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hmac-calculator-view__output-area::-webkit-scrollbar {
  display: none;
}

.hmac-calculator-view__result-card {
  flex-shrink: 0;
}

.hmac-calculator-view__result-card :deep(.neu-card__body) {
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}

.hmac-calculator-view__hash-value {
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
.hmac-calculator-view__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.hmac-calculator-view__card-header :deep(.copy-button) {
  padding: 4px 10px;
  font-size: var(--font-size-sm);
}

/* 点击复制 */
.hmac-calculator-view__hash-value--clickable {
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
}

.hmac-calculator-view__hash-value--clickable:hover {
  box-shadow: var(--neu-shadow-pressed), 0 0 0 2px rgba(108, 99, 255, 0.15);
}

.hmac-calculator-view__hash-value--clickable:active {
  opacity: 0.85;
}

.hmac-calculator-view__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
