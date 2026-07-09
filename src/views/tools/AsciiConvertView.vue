<template>
  <div class="ascii-convert">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="ascii-convert__status">
      <div
        class="ascii-convert__status-inner"
        :class="{
          'ascii-convert__status-success': statusType === 'success',
          'ascii-convert__status-error': statusType === 'error',
          'ascii-convert__status-idle': statusType === 'idle'
        }"
        :title="statusText"
      >
        <span class="ascii-convert__status-text">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="ascii-convert__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="输入" elevation="raised" class="ascii-convert__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="输入文本或ASCII码（空格分隔的十进制数字）..."
          :show-count="true"
          class="ascii-convert__textarea"
        />
        <template #footer>
          <div class="ascii-convert__actions">
            <NeuButton type="primary" :loading="isLoading" @click="textToAscii">
              文本 → ASCII
            </NeuButton>
            <NeuButton type="primary" :loading="isLoading" @click="asciiToText">
              ASCII → 文本
            </NeuButton>
            <NeuButton type="danger" @click="clearAll">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 输出区 -->
      <NeuCard title="输出" elevation="raised" class="ascii-convert__output-card">
        <div class="ascii-convert__output-body">
          <div class="ascii-convert__result-value neu-pressed">
            <pre v-if="output" class="ascii-convert__code">{{ output }}</pre>
            <span v-else class="ascii-convert__placeholder">点击下方按钮进行转换</span>
          </div>
          <!-- 十六进制对照（仅「文本 → ASCII」时展示） -->
          <div v-if="hexOutput" class="ascii-convert__hex">
            <span class="ascii-convert__hex-label">Hex 对照</span>
            <span class="ascii-convert__hex-value">{{ hexOutput }}</span>
          </div>
        </div>
        <template #footer>
          <div class="ascii-convert__result-footer">
            <CopyButton :content="output" />
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsciiConvert } from '@/composables/useAsciiConvert'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'AsciiConvertView' })

const {
  input,
  output,
  hexOutput,
  isLoading,
  statusText,
  statusType,
  textToAscii,
  asciiToText,
  clearAll
} = useAsciiConvert()
</script>

<style scoped>
.ascii-convert {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.ascii-convert__status {
  flex-shrink: 0;
}

.ascii-convert__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.ascii-convert__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.ascii-convert__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.ascii-convert__status-success .ascii-convert__status-text {
  color: var(--color-success);
}

.ascii-convert__status-error .ascii-convert__status-text {
  color: var(--color-error);
}

.ascii-convert__status-idle .ascii-convert__status-text {
  color: var(--text-muted);
}

/* 双栏布局 */
.ascii-convert__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .ascii-convert__columns {
    grid-template-columns: 1fr;
  }
}

/* 左栏卡片 */
.ascii-convert__input-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.ascii-convert__input-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ascii-convert__input-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.ascii-convert__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ascii-convert__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ascii-convert__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ascii-convert__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 操作按钮 */
.ascii-convert__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 右栏输出卡片 */
.ascii-convert__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.ascii-convert__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ascii-convert__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

.ascii-convert__output-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ascii-convert__result-value {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ascii-convert__result-value::-webkit-scrollbar {
  display: none;
}

.ascii-convert__code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.ascii-convert__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* 十六进制对照小标签 */
.ascii-convert__hex {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  max-height: 120px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ascii-convert__hex::-webkit-scrollbar {
  display: none;
}

.ascii-convert__hex-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.ascii-convert__hex-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-xs);
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

.ascii-convert__result-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
