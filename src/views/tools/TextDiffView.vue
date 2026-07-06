<template>
  <div class="text-diff">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="text-diff__status">
      <div
        v-if="statusType === 'success'"
        class="text-diff__status-inner text-diff__status-success"
      >
        <NeuTag type="success">✓ 对比完成</NeuTag>
        <span class="text-diff__stat-sep">│</span>
        <span class="text-diff__stat text-diff__stat-add">+{{ result!.stats.additions }}</span>
        <span class="text-diff__stat-sep">│</span>
        <span class="text-diff__stat text-diff__stat-del">-{{ result!.stats.deletions }}</span>
        <span class="text-diff__stat-sep">│</span>
        <span class="text-diff__stat text-diff__stat-eq">={{ result!.stats.unchanged }}</span>
      </div>
      <div
        v-else-if="statusType === 'error'"
        class="text-diff__status-inner text-diff__status-error"
      >
        <span class="text-diff__error-msg">⚠ {{ errorMessage }}</span>
      </div>
      <div v-else class="text-diff__status-inner text-diff__status-idle">
        <span class="text-diff__idle-text">📝 输入原文和新文进行差异对比</span>
      </div>
    </NeuCard>

    <!-- 上部双栏输入区 -->
    <div class="text-diff__inputs">
      <NeuCard title="原文" elevation="raised" class="text-diff__input-card">
        <NeuTextarea
          v-model="oldText"
          placeholder="在此粘贴原文..."
          :show-count="true"
          class="text-diff__textarea"
        />
      </NeuCard>
      <NeuCard title="新文" elevation="raised" class="text-diff__input-card">
        <NeuTextarea
          v-model="newText"
          placeholder="在此粘贴新文..."
          :show-count="true"
          class="text-diff__textarea"
        />
      </NeuCard>
    </div>

    <!-- 按钮行 -->
    <div class="text-diff__actions">
      <NeuButton type="primary" :loading="isLoading" @click="compare">
        🔍 对比
      </NeuButton>
      <NeuButton type="danger" @click="clearAll">
        🗑️ 清空
      </NeuButton>
    </div>

    <!-- 下部结果区 -->
    <NeuCard title="差异结果" elevation="raised" class="text-diff__result-card">
      <div v-if="result && result.lines.length" class="text-diff__result">
        <div
          v-for="(line, idx) in result.lines"
          :key="idx"
          class="text-diff__line"
          :class="[`text-diff__line--${line.tag}`]"
        >
          <span class="text-diff__line-num text-diff__line-num--old">
            {{ line.old_index ?? '' }}
          </span>
          <span class="text-diff__line-num text-diff__line-num--new">
            {{ line.new_index ?? '' }}
          </span>
          <span class="text-diff__line-tag">
            {{ line.tag === 'insert' ? '+' : line.tag === 'delete' ? '-' : ' ' }}
          </span>
          <span class="text-diff__line-content">{{ line.value }}</span>
        </div>
      </div>
      <span v-else class="text-diff__placeholder">差异结果将在此显示...</span>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import { useTextDiff } from '@/composables/useTextDiff'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTag from '@/components/neu/NeuTag.vue'

defineOptions({ name: 'TextDiffView' })

const {
  oldText,
  newText,
  result,
  isLoading,
  errorMessage,
  statusType,
  compare,
  clearAll,
} = useTextDiff()
</script>

<style scoped>
.text-diff {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.text-diff__status {
  flex-shrink: 0;
}

.text-diff__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.text-diff__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-diff__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.text-diff__status-error {
  display: flex;
  align-items: center;
}

.text-diff__status-idle {
  display: flex;
  align-items: center;
}

.text-diff__stat {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.text-diff__stat-add { color: var(--color-success); }
.text-diff__stat-del { color: var(--color-error); }
.text-diff__stat-eq  { color: var(--text-secondary); }

.text-diff__stat-sep {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.text-diff__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.text-diff__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* 双栏输入区 */
.text-diff__inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  flex: 0 0 40%;
  min-height: 0;
}

@media (max-width: 768px) {
  .text-diff__inputs {
    grid-template-columns: 1fr;
  }
}

.text-diff__input-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.text-diff__input-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* textarea 自适应 */
.text-diff__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.text-diff__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.text-diff__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.text-diff__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 按钮行 */
.text-diff__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

/* 结果区 */
.text-diff__result-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.text-diff__result-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.text-diff__result {
  flex: 1;
  overflow-y: auto;
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.text-diff__result::-webkit-scrollbar {
  display: none;
}

/* Diff 行 */
.text-diff__line {
  display: flex;
  align-items: flex-start;
  padding: 1px var(--spacing-sm);
  white-space: pre-wrap;
  word-break: break-all;
}

.text-diff__line--insert {
  background: rgba(46, 204, 113, 0.18);
}

.text-diff__line--delete {
  background: rgba(231, 76, 60, 0.18);
}

.text-diff__line--equal {
  background: transparent;
}

/* 行号 */
.text-diff__line-num {
  flex-shrink: 0;
  width: 40px;
  text-align: right;
  padding-right: var(--spacing-sm);
  color: var(--text-muted);
  font-size: var(--font-size-xs, 11px);
  user-select: none;
}

.text-diff__line-num--old {
  border-right: 1px solid var(--neu-shadow-dark, rgba(0,0,0,.1));
}

.text-diff__line-num--new {
  margin-right: var(--spacing-sm);
}

/* 增删符号 */
.text-diff__line-tag {
  flex-shrink: 0;
  width: 16px;
  text-align: center;
  font-weight: 700;
  margin-right: var(--spacing-xs);
}

.text-diff__line--insert .text-diff__line-tag { color: var(--color-success); }
.text-diff__line--delete .text-diff__line-tag { color: var(--color-error); }
.text-diff__line--equal  .text-diff__line-tag { color: var(--text-muted); }

.text-diff__line-content {
  flex: 1;
  color: var(--text-primary);
}

.text-diff__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}
</style>
