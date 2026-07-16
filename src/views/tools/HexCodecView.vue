<template>
  <div class="hex-codec">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="hex-codec__status">
      <div
        class="hex-codec__status-inner"
        :class="{
          'hex-codec__status-error': error,
          'hex-codec__status-success': output && !error,
          'hex-codec__status-idle': !output && !error
        }"
      >
        <NeuTag v-if="output && !error" type="success">✓ 转换完成</NeuTag>
        <span v-if="output && !error" class="hex-codec__stat-sep">│</span>
        <span v-if="output && !error" class="hex-codec__stat">输入: {{ input.length }} chars</span>
        <span v-if="output && !error" class="hex-codec__stat-sep">│</span>
        <span v-if="output && !error" class="hex-codec__stat">输出: {{ output.length }} chars</span>
        <span v-if="error" class="hex-codec__error-msg">⚠ {{ error }}</span>
        <span v-if="!output && !error" class="hex-codec__idle-text">🔣 输入文本后进行 Hex 编码或解码</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="hex-codec__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="输入" elevation="raised" class="hex-codec__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="在此输入文本或Hex字符串..."
          :show-count="true"
          class="hex-codec__textarea"
        />
        <template #footer>
          <div class="hex-codec__actions">
            <NeuButton type="primary" @click="encode">
              编码
            </NeuButton>
            <NeuButton @click="decode">
              解码
            </NeuButton>
            <NeuButton type="danger" @click="clear">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 输出区 -->
      <NeuCard title="输出" elevation="raised" class="hex-codec__output-card">
        <div class="hex-codec__output neu-pressed">
          <pre
            v-if="output"
            class="hex-codec__code"
          >{{ output }}</pre>
          <span v-else class="hex-codec__placeholder">
            输出将在此显示...
          </span>
        </div>
        <template #footer>
          <div class="hex-codec__output-actions">
            <CopyButton :content="output" />
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHexCodec } from '@/composables/useHexCodec'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'HexCodecView' })

const { input, output, error, encode, decode, clear } = useHexCodec()
</script>

<style scoped>
.hex-codec {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.hex-codec__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .hex-codec__columns {
    grid-template-columns: 1fr;
  }
}

/* 左右卡片 flex 填充 */
.hex-codec__input-card,
.hex-codec__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.hex-codec__input-card :deep(.neu-card__body),
.hex-codec__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hex-codec__input-card :deep(.neu-card__footer),
.hex-codec__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.hex-codec__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hex-codec__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hex-codec__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hex-codec__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

.hex-codec__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.hex-codec__output {
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

.hex-codec__output::-webkit-scrollbar {
  display: none;
}

.hex-codec__code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.hex-codec__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.hex-codec__output-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 状态栏 */
.hex-codec__status {
  flex-shrink: 0;
}

.hex-codec__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.hex-codec__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hex-codec__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.hex-codec__stat {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.hex-codec__stat-sep {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.hex-codec__status-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.hex-codec__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.hex-codec__status-idle {
  display: flex;
  align-items: center;
}

.hex-codec__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
