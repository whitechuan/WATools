<template>
  <div class="markdown-preview">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="markdown-preview__status">
      <div
        class="markdown-preview__status-inner"
        :class="{
          'markdown-preview__status-success': statusType === 'success',
          'markdown-preview__status-error': statusType === 'error',
          'markdown-preview__status-idle': statusType === 'idle'
        }"
        :title="statusText"
      >
        <span class="markdown-preview__status-text">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="markdown-preview__columns">
      <!-- 左栏 - Markdown 编辑区 -->
      <NeuCard elevation="raised" class="markdown-preview__input-card">
        <template #header>
          <div class="markdown-preview__card-header">
            <h3 class="neu-card__title">Markdown 编辑</h3>
            <div class="markdown-preview__card-actions">
              <NeuButton type="primary" :loading="isLoading" @click="convert">
                🔄 刷新预览
              </NeuButton>
              <NeuButton type="danger" @click="clearAll">
                🗑️ 清空
              </NeuButton>
            </div>
          </div>
        </template>
        <NeuTextarea
          v-model="input"
          placeholder="# 输入 Markdown 文本..."
          :show-count="true"
          class="markdown-preview__textarea"
        />
      </NeuCard>

      <!-- 右栏 - HTML 预览区 -->
      <NeuCard elevation="raised" class="markdown-preview__output-card">
        <template #header>
          <div class="markdown-preview__card-header">
            <h3 class="neu-card__title">HTML 预览</h3>
            <div class="markdown-preview__card-actions">
              <CopyButton :content="htmlOutput" label="📋 导出 HTML" />
            </div>
          </div>
        </template>
        <div class="markdown-preview__output neu-pressed">
          <div v-if="htmlOutput" class="markdown-preview__html" v-html="htmlOutput"></div>
          <span v-else class="markdown-preview__placeholder">
            预览将在此显示...
          </span>
        </div>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMarkdownPreview } from '@/composables/useMarkdownPreview'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'MarkdownPreviewView' })

const {
  input,
  htmlOutput,
  isLoading,
  statusText,
  statusType,
  convert,
  clearAll
} = useMarkdownPreview()
</script>

<style scoped>
.markdown-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.markdown-preview__status {
  flex-shrink: 0;
}

.markdown-preview__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.markdown-preview__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.markdown-preview__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.markdown-preview__status-success .markdown-preview__status-text {
  color: var(--color-success);
}

.markdown-preview__status-error .markdown-preview__status-text {
  color: var(--color-error);
}

.markdown-preview__status-idle .markdown-preview__status-text {
  color: var(--text-muted);
}

/* 卡片头部 */
.markdown-preview__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.markdown-preview__card-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
  align-items: center;
}

.markdown-preview__card-actions :deep(.neu-button) {
  padding: 6px 12px;
  font-size: var(--font-size-sm);
}

/* 双栏布局 */
.markdown-preview__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .markdown-preview__columns {
    grid-template-columns: 1fr;
  }
}

/* 左栏卡片 */
.markdown-preview__input-card,
.markdown-preview__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.markdown-preview__input-card :deep(.neu-card__body),
.markdown-preview__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* textarea 自适应 */
.markdown-preview__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.markdown-preview__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.markdown-preview__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.markdown-preview__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 右栏预览区 */
.markdown-preview__output {
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

.markdown-preview__output::-webkit-scrollbar {
  display: none;
}

.markdown-preview__html {
  font-size: var(--font-size-base);
  line-height: 1.7;
  color: var(--text-primary);
}

.markdown-preview__html :deep(h1) {
  font-size: 1.6em;
  font-weight: 700;
  margin: 0.6em 0 0.4em;
  border-bottom: 1px solid var(--neu-shadow-dark);
  padding-bottom: 0.3em;
}

.markdown-preview__html :deep(h2) {
  font-size: 1.4em;
  font-weight: 700;
  margin: 0.6em 0 0.4em;
}

.markdown-preview__html :deep(h3) {
  font-size: 1.2em;
  font-weight: 600;
  margin: 0.5em 0 0.3em;
}

.markdown-preview__html :deep(p) {
  margin: 0.5em 0;
}

.markdown-preview__html :deep(ul),
.markdown-preview__html :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-preview__html :deep(li) {
  margin: 0.2em 0;
}

.markdown-preview__html :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
  background: var(--neu-bg-dark);
  padding: 0.1em 0.3em;
  border-radius: var(--neu-radius-sm);
}

.markdown-preview__html :deep(pre) {
  background: var(--neu-bg-dark);
  padding: var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-preview__html :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-preview__html :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  margin: 0.5em 0;
  padding: 0.2em 0 var(--spacing-sm);
  color: var(--text-secondary);
}

.markdown-preview__html :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.markdown-preview__html :deep(th),
.markdown-preview__html :deep(td) {
  border: 1px solid var(--neu-shadow-dark);
  padding: var(--spacing-xs) var(--spacing-sm);
  text-align: left;
}

.markdown-preview__html :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}

.markdown-preview__html :deep(hr) {
  border: none;
  border-top: 1px solid var(--neu-shadow-dark);
  margin: 1em 0;
}

.markdown-preview__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}
</style>
