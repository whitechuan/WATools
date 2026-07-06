<template>
  <div class="regex-tester-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="regex-tester-view__status">
      <div class="regex-tester-view__status-inner">
        <span
          class="regex-tester-view__status-text"
          :class="{
            'regex-tester-view__status-text--error': statusType === 'error',
            'regex-tester-view__status-text--success': statusType === 'success',
            'regex-tester-view__status-text--idle': statusType === 'idle',
          }"
        >
          {{ statusText }}
        </span>
      </div>
    </NeuCard>

    <!-- 正则输入区 -->
    <NeuCard title="🎯 正则表达式" elevation="raised" class="regex-tester-view__pattern-card">
      <div class="regex-tester-view__pattern-row">
        <NeuInput
          v-model="pattern"
          placeholder="输入正则表达式..."
          :clearable="true"
          class="regex-tester-view__pattern-input"
        />
        <NeuInput
          v-model="flags"
          placeholder="flags: i,m,s"
          class="regex-tester-view__flags-input"
        />
        <NeuButton type="primary" :loading="isLoading" @click="test">
          测试
        </NeuButton>
        <NeuButton type="danger" @click="clearAll">
          🗑️ 清空
        </NeuButton>
      </div>
    </NeuCard>

    <!-- 测试文本输入区 -->
    <NeuCard title="📝 测试文本" elevation="raised" class="regex-tester-view__text-card">
      <NeuTextarea
        v-model="testText"
        placeholder="在此输入测试文本..."
        :show-count="true"
        class="regex-tester-view__textarea"
      />
    </NeuCard>

    <!-- 匹配结果区 -->
    <NeuCard title="📊 匹配结果" elevation="raised" class="regex-tester-view__results-card">
      <div class="regex-tester-view__results-list">
        <template v-if="result && result.matches.length > 0">
          <div
            v-for="(match, idx) in result.matches"
            :key="idx"
            class="regex-tester-view__match-item"
          >
            <div class="regex-tester-view__match-header">
              <NeuTag type="success">匹配 {{ idx + 1 }}</NeuTag>
              <span class="regex-tester-view__match-pos">[{{ match.start }}:{{ match.end }}]</span>
            </div>
            <div class="regex-tester-view__match-text">{{ match.text }}</div>
            <div v-if="match.groups.length > 0" class="regex-tester-view__groups">
              <div
                v-for="(group, gIdx) in match.groups"
                :key="gIdx"
                class="regex-tester-view__group-item"
              >
                <span class="regex-tester-view__group-label">
                  {{ group.name ? `命名组 "${group.name}"` : `组 ${gIdx + 1}` }}
                </span>
                <span class="regex-tester-view__group-value">{{ group.value }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="regex-tester-view__placeholder">
          {{ result?.is_valid ? '未找到匹配项' : '匹配结果将在此显示...' }}
        </div>
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import { useRegexTester } from '@/composables/useRegexTester'

defineOptions({ name: 'RegexTesterView' })

const {
  pattern,
  testText,
  flags,
  result,
  isLoading,
  statusText,
  statusType,
  test,
  clearAll,
} = useRegexTester()
</script>

<style scoped>
.regex-tester-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.regex-tester-view__status {
  flex-shrink: 0;
}

.regex-tester-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.regex-tester-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.regex-tester-view__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.regex-tester-view__status-text--error {
  color: var(--color-error);
}

.regex-tester-view__status-text--success {
  color: var(--color-success);
}

.regex-tester-view__status-text--idle {
  color: var(--text-muted);
}

/* 正则输入区 */
.regex-tester-view__pattern-card {
  flex-shrink: 0;
}

.regex-tester-view__pattern-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.regex-tester-view__pattern-input {
  flex: 1;
  min-width: 0;
}

.regex-tester-view__flags-input {
  width: 140px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .regex-tester-view__pattern-row {
    flex-wrap: wrap;
  }

  .regex-tester-view__pattern-input {
    width: 100%;
    flex: none;
  }

  .regex-tester-view__flags-input {
    width: 100%;
  }
}

/* 测试文本区 */
.regex-tester-view__text-card {
  flex-shrink: 0;
}

.regex-tester-view__text-card :deep(.neu-card__body) {
  display: flex;
  flex-direction: column;
}

.regex-tester-view__textarea {
  display: flex;
  flex-direction: column;
}

.regex-tester-view__textarea :deep(.neu-textarea-wrapper) {
  display: flex;
  flex-direction: column;
}

.regex-tester-view__textarea :deep(.neu-textarea-field) {
  min-height: 120px;
  resize: vertical;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.regex-tester-view__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 匹配结果区 */
.regex-tester-view__results-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.regex-tester-view__results-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.regex-tester-view__results-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.regex-tester-view__results-list::-webkit-scrollbar {
  display: none;
}

.regex-tester-view__match-item {
  padding: var(--spacing-md);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
}

.regex-tester-view__match-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.regex-tester-view__match-pos {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

.regex-tester-view__match-text {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--neu-radius-sm);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  word-break: break-all;
  line-height: 1.6;
  margin-bottom: var(--spacing-sm);
}

.regex-tester-view__groups {
  padding-left: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.regex-tester-view__group-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.regex-tester-view__group-label {
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.regex-tester-view__group-value {
  color: var(--color-primary);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  word-break: break-all;
}

.regex-tester-view__placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--font-size-base);
  min-height: 120px;
}
</style>
