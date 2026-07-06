<template>
  <div class="url-codec-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="url-codec-view__status">
      <div class="url-codec-view__status-inner" :class="`url-codec-view__status-inner--${statusType}`">
        <span class="url-codec-view__status-text">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="url-codec-view__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="🔗 URL 编解码工具" elevation="raised" class="url-codec-view__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="输入 URL 或文本..."
          class="url-codec-view__textarea"
        />
        <template #footer>
          <div class="url-codec-view__actions">
            <NeuButton type="primary" :loading="isLoading" @click="encode">编码</NeuButton>
            <NeuButton type="primary" :loading="isLoading" @click="decode">解码</NeuButton>
            <NeuButton :loading="isLoading" @click="parse">解析</NeuButton>
            <NeuButton @click="clearAll">清空</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 结果区 -->
      <!-- 编码/解码结果 -->
      <NeuCard v-if="output" title="结果" elevation="raised" class="url-codec-view__output-card">
        <div class="url-codec-view__code-block">
          <pre>{{ output }}</pre>
        </div>
        <div class="url-codec-view__copy-row">
          <CopyButton :content="output" />
        </div>
      </NeuCard>

      <!-- 解析结果 -->
      <NeuCard v-else-if="parseResult" title="解析结果" elevation="raised" class="url-codec-view__output-card">
        <div class="url-codec-view__parse-table">
          <div class="url-codec-view__parse-row">
            <span class="url-codec-view__parse-label">Scheme</span>
            <span class="url-codec-view__parse-value">{{ parseResult.scheme || '-' }}</span>
          </div>
          <div class="url-codec-view__parse-row">
            <span class="url-codec-view__parse-label">Host</span>
            <span class="url-codec-view__parse-value">{{ parseResult.host || '-' }}</span>
          </div>
          <div class="url-codec-view__parse-row">
            <span class="url-codec-view__parse-label">Port</span>
            <span class="url-codec-view__parse-value">{{ parseResult.port || '-' }}</span>
          </div>
          <div class="url-codec-view__parse-row">
            <span class="url-codec-view__parse-label">Path</span>
            <span class="url-codec-view__parse-value">{{ parseResult.path || '-' }}</span>
          </div>
          <div class="url-codec-view__parse-row">
            <span class="url-codec-view__parse-label">Query</span>
            <span class="url-codec-view__parse-value">{{ parseResult.query || '-' }}</span>
          </div>
          <div class="url-codec-view__parse-row">
            <span class="url-codec-view__parse-label">Fragment</span>
            <span class="url-codec-view__parse-value">{{ parseResult.fragment || '-' }}</span>
          </div>
        </div>

        <!-- Query Params 列表 -->
        <div v-if="parseResult.query_params.length > 0" class="url-codec-view__params-section">
          <div class="url-codec-view__params-title">Query Parameters</div>
          <div class="url-codec-view__params-table">
            <div
              v-for="(param, index) in parseResult.query_params"
              :key="index"
              class="url-codec-view__params-row"
            >
              <span class="url-codec-view__params-key">{{ param.key }}</span>
              <span class="url-codec-view__params-eq">=</span>
              <span class="url-codec-view__params-val">{{ param.value }}</span>
            </div>
          </div>
        </div>
      </NeuCard>

      <!-- 空占位 -->
      <NeuCard v-else elevation="raised" class="url-codec-view__output-card">
        <div class="url-codec-view__placeholder">结果将在此显示...</div>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { useUrlCodec } from '@/composables/useUrlCodec'

defineOptions({ name: 'UrlCodecView' })

const {
  input,
  output,
  parseResult,
  isLoading,
  statusText,
  statusType,
  encode,
  decode,
  parse,
  clearAll,
} = useUrlCodec()
</script>

<style scoped>
.url-codec-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.url-codec-view__status {
  flex-shrink: 0;
}

.url-codec-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.url-codec-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.url-codec-view__status-inner--error .url-codec-view__status-text {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.url-codec-view__status-inner--success .url-codec-view__status-text {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.url-codec-view__status-inner--idle .url-codec-view__status-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* 双栏布局 */
.url-codec-view__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .url-codec-view__columns {
    grid-template-columns: 1fr;
  }
}

/* 左右卡片 flex 填充 */
.url-codec-view__input-card,
.url-codec-view__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.url-codec-view__input-card :deep(.neu-card__body),
.url-codec-view__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.url-codec-view__input-card :deep(.neu-card__footer),
.url-codec-view__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.url-codec-view__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.url-codec-view__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.url-codec-view__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.url-codec-view__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 操作按钮 */
.url-codec-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 编码/解码结果代码块 */
.url-codec-view__code-block {
  flex: 1;
  min-height: 0;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-md);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.url-codec-view__code-block::-webkit-scrollbar {
  display: none;
}

.url-codec-view__code-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.6;
}

.url-codec-view__copy-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
  flex-shrink: 0;
}

/* 解析结果表格 */
.url-codec-view__parse-table {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.url-codec-view__parse-table::-webkit-scrollbar {
  display: none;
}

.url-codec-view__parse-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.url-codec-view__parse-row + .url-codec-view__parse-row {
  border-top: 1px solid var(--neu-bg-dark);
}

.url-codec-view__parse-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 80px;
  flex-shrink: 0;
}

.url-codec-view__parse-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  word-break: break-all;
}

/* Query Params */
.url-codec-view__params-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--neu-bg-dark);
  flex-shrink: 0;
  max-height: 40%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.url-codec-view__params-section::-webkit-scrollbar {
  display: none;
}

.url-codec-view__params-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.url-codec-view__params-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.url-codec-view__params-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
}

.url-codec-view__params-key {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
}

.url-codec-view__params-eq {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.url-codec-view__params-val {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  word-break: break-all;
}

/* 空占位 */
.url-codec-view__placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--font-size-base);
}
</style>
