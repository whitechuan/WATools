<template>
  <div class="html-entity">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="html-entity__status">
      <div
        class="html-entity__status-inner"
        :class="{
          'html-entity__status-success': statusType === 'success',
          'html-entity__status-error': statusType === 'error',
          'html-entity__status-idle': statusType === 'idle'
        }"
        :title="statusText"
      >
        <NeuTag v-if="statusType === 'success'" type="success">✓ 转换完成</NeuTag>
        <span v-if="statusType === 'error'" class="html-entity__error-msg">⚠ {{ errorMessage }}</span>
        <span v-if="statusType === 'idle'" class="html-entity__idle-text">🏷️ 输入文本后进行 HTML 实体编码或解码</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="html-entity__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="输入" elevation="raised" class="html-entity__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="在此输入文本..."
          :show-count="true"
          class="html-entity__textarea"
        />
        <template #footer>
          <div class="html-entity__actions">
            <NeuButton type="primary" :loading="isLoading" @click="encode">
              编码
            </NeuButton>
            <NeuButton :loading="isLoading" @click="decode">
              解码
            </NeuButton>
            <NeuButton type="danger" @click="clearAll">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 输出区 -->
      <NeuCard title="输出" elevation="raised" class="html-entity__output-card">
        <div class="html-entity__output neu-pressed">
          <pre
            v-if="output"
            class="html-entity__code"
          >{{ output }}</pre>
          <span v-else class="html-entity__placeholder">
            输出将在此显示...
          </span>
        </div>
        <template #footer>
          <div class="html-entity__output-actions">
            <CopyButton :content="output" />
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHtmlEntity } from '@/composables/useHtmlEntity'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'HtmlEntityView' })

const {
  input,
  output,
  isLoading,
  errorMessage,
  statusText,
  statusType,
  encode,
  decode,
  clearAll
} = useHtmlEntity()
</script>

<style scoped>
.html-entity {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.html-entity__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .html-entity__columns {
    grid-template-columns: 1fr;
  }
}

.html-entity__input-card,
.html-entity__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.html-entity__input-card :deep(.neu-card__body),
.html-entity__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.html-entity__input-card :deep(.neu-card__footer),
.html-entity__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

.html-entity__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.html-entity__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.html-entity__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.html-entity__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

.html-entity__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.html-entity__output {
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

.html-entity__output::-webkit-scrollbar {
  display: none;
}

.html-entity__code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.html-entity__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.html-entity__output-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 状态栏 */
.html-entity__status {
  flex-shrink: 0;
}

.html-entity__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.html-entity__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.html-entity__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.html-entity__status-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.html-entity__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.html-entity__status-idle {
  display: flex;
  align-items: center;
}

.html-entity__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
