<template>
  <div class="number-base">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="number-base__status">
      <div
        class="number-base__status-inner"
        :class="{
          'number-base__status-success': statusType === 'success',
          'number-base__status-error': statusType === 'error',
          'number-base__status-idle': statusType === 'idle'
        }"
        :title="statusText"
      >
        <span class="number-base__status-text">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 输入区 -->
    <NeuCard title="输入" elevation="raised" class="number-base__input-card">
      <div class="number-base__input-row">
        <div class="number-base__input-field">
          <NeuInput
            v-model="input"
            placeholder="输入数字..."
            type="text"
            class="number-base__input"
            @input="convert"
          />
        </div>
        <div class="number-base__base-select">
          <NeuSelect
            v-model="fromBase"
            :options="baseOptions"
            placeholder="选择进制"
            @change="convert"
          />
        </div>
        <NeuButton type="primary" :loading="isLoading" @click="convert">
          转换
        </NeuButton>
        <NeuButton type="danger" @click="clearAll">
          🗑️ 清空
        </NeuButton>
      </div>
    </NeuCard>

    <!-- 结果卡片 -->
    <div class="number-base__results">
      <NeuCard title="二进制 (BIN)" elevation="raised" class="number-base__result-card">
        <div class="number-base__result-value neu-pressed">
          <pre v-if="result.binary" class="number-base__code">{{ result.binary }}</pre>
          <span v-else class="number-base__placeholder">等待转换...</span>
        </div>
        <template #footer>
          <div class="number-base__result-footer">
            <CopyButton :content="result.binary" />
          </div>
        </template>
      </NeuCard>

      <NeuCard title="八进制 (OCT)" elevation="raised" class="number-base__result-card">
        <div class="number-base__result-value neu-pressed">
          <pre v-if="result.octal" class="number-base__code">{{ result.octal }}</pre>
          <span v-else class="number-base__placeholder">等待转换...</span>
        </div>
        <template #footer>
          <div class="number-base__result-footer">
            <CopyButton :content="result.octal" />
          </div>
        </template>
      </NeuCard>

      <NeuCard title="十进制 (DEC)" elevation="raised" class="number-base__result-card">
        <div class="number-base__result-value neu-pressed">
          <pre v-if="result.decimal" class="number-base__code">{{ result.decimal }}</pre>
          <span v-else class="number-base__placeholder">等待转换...</span>
        </div>
        <template #footer>
          <div class="number-base__result-footer">
            <CopyButton :content="result.decimal" />
          </div>
        </template>
      </NeuCard>

      <NeuCard title="十六进制 (HEX)" elevation="raised" class="number-base__result-card">
        <div class="number-base__result-value neu-pressed">
          <pre v-if="result.hex" class="number-base__code">{{ result.hex }}</pre>
          <span v-else class="number-base__placeholder">等待转换...</span>
        </div>
        <template #footer>
          <div class="number-base__result-footer">
            <CopyButton :content="result.hex" />
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNumberBase } from '@/composables/useNumberBase'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import type { SelectOption } from '@/components/neu/NeuSelect.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'NumberBaseView' })

const baseOptions: SelectOption[] = [
  { label: '二进制 (2)', value: 2 },
  { label: '八进制 (8)', value: 8 },
  { label: '十进制 (10)', value: 10 },
  { label: '十六进制 (16)', value: 16 },
]

const {
  input,
  fromBase,
  result,
  isLoading,
  statusText,
  statusType,
  convert,
  clearAll
} = useNumberBase()
</script>

<style scoped>
.number-base {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.number-base__status {
  flex-shrink: 0;
}

.number-base__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.number-base__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.number-base__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.number-base__status-success .number-base__status-text {
  color: var(--color-success);
}

.number-base__status-error .number-base__status-text {
  color: var(--color-error);
}

.number-base__status-idle .number-base__status-text {
  color: var(--text-muted);
}

/* 输入区 */
.number-base__input-card {
  flex-shrink: 0;
}

.number-base__input-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.number-base__input-field {
  flex: 1;
  min-width: 200px;
}

.number-base__base-select {
  min-width: 160px;
}

/* 结果区 */
.number-base__results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.number-base__results::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .number-base__results {
    grid-template-columns: 1fr;
  }
}

.number-base__result-card {
  display: flex;
  flex-direction: column;
}

.number-base__result-card :deep(.neu-card__body) {
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}

.number-base__result-value {
  min-height: 60px;
  max-height: 140px;
  overflow-y: auto;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.number-base__result-value::-webkit-scrollbar {
  display: none;
}

.number-base__code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.number-base__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.number-base__result-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
