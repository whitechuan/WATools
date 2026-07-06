<template>
  <div class="base64-codec">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="base64-codec__status">
      <div
        class="base64-codec__status-inner"
        :class="{
          'base64-codec__status-success': statusType === 'success',
          'base64-codec__status-error': statusType === 'error',
          'base64-codec__status-idle': statusType === 'idle'
        }"
        :title="statusText"
      >
        <NeuTag v-if="statusType === 'success'" type="success">✓ 转换完成</NeuTag>
        <span v-if="statusType === 'success'" class="base64-codec__stat-sep">│</span>
        <span v-if="statusType === 'success'" class="base64-codec__stat">输入: {{ sizeBefore }} bytes</span>
        <span v-if="statusType === 'success'" class="base64-codec__stat-sep">│</span>
        <span v-if="statusType === 'success'" class="base64-codec__stat">输出: {{ sizeAfter }} bytes</span>
        <span v-if="statusType === 'error'" class="base64-codec__error-msg">⚠ {{ errorMessage }}</span>
        <span v-if="statusType === 'idle'" class="base64-codec__idle-text">🔤 输入文本后进行 Base64 编码或解码</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="base64-codec__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="输入" elevation="raised" class="base64-codec__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="在此输入文本..."
          :show-count="true"
          class="base64-codec__textarea"
        />
        <template #footer>
          <div class="base64-codec__actions">
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
      <NeuCard title="输出" elevation="raised" class="base64-codec__output-card">
        <div class="base64-codec__output neu-pressed">
          <pre
            v-if="output"
            class="base64-codec__code"
          >{{ output }}</pre>
          <span v-else class="base64-codec__placeholder">
            输出将在此显示...
          </span>
        </div>
        <template #footer>
          <div class="base64-codec__output-actions">
            <CopyButton :content="output" />
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBase64Codec } from '@/composables/useBase64Codec'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'Base64CodecView' })

const {
  input,
  output,
  isLoading,
  errorMessage,
  statusText,
  statusType,
  sizeBefore,
  sizeAfter,
  encode,
  decode,
  clearAll
} = useBase64Codec()
</script>

<style scoped>
.base64-codec {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.base64-codec__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .base64-codec__columns {
    grid-template-columns: 1fr;
  }
}

/* 左右卡片 flex 填充 */
.base64-codec__input-card,
.base64-codec__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.base64-codec__input-card :deep(.neu-card__body),
.base64-codec__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.base64-codec__input-card :deep(.neu-card__footer),
.base64-codec__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.base64-codec__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.base64-codec__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.base64-codec__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.base64-codec__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

.base64-codec__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.base64-codec__output {
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

.base64-codec__output::-webkit-scrollbar {
  display: none;
}

.base64-codec__code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.base64-codec__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.base64-codec__output-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 状态栏 */
.base64-codec__status {
  flex-shrink: 0;
}

.base64-codec__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.base64-codec__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base64-codec__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.base64-codec__stat {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.base64-codec__stat-sep {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.base64-codec__status-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.base64-codec__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.base64-codec__status-idle {
  display: flex;
  align-items: center;
}

.base64-codec__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
