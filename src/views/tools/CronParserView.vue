<template>
  <div class="cron-parser-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="cron-parser-view__status">
      <div
        class="cron-parser-view__status-inner"
        :class="{
          'cron-parser-view__status-inner--error': statusType === 'error',
          'cron-parser-view__status-inner--success': statusType === 'success',
          'cron-parser-view__status-inner--idle': statusType === 'idle',
        }"
      >
        <span class="cron-parser-view__status-text">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 输入区 -->
    <NeuCard elevation="raised" class="cron-parser-view__input-card">
      <div class="cron-parser-view__input-row">
        <NeuInput
          v-model="expression"
          placeholder="* * * * * 或 0 * * * * * *"
          clearable
          @keyup.enter="parse"
        />
        <div class="cron-parser-view__input-actions">
          <NeuButton type="primary" :loading="isLoading" @click="parse">
            解析
          </NeuButton>
          <NeuButton type="default" @click="clearAll">清空</NeuButton>
        </div>
      </div>
      <!-- 快捷模板 -->
      <div class="cron-parser-view__templates">
        <span class="cron-parser-view__templates-label">常用：</span>
        <button
          v-for="tpl in templates"
          :key="tpl.value"
          class="cron-parser-view__template-btn"
          type="button"
          @click="fillTemplate(tpl.value)"
        >
          {{ tpl.label }}
        </button>
      </div>
    </NeuCard>

    <!-- 结果区 -->
    <NeuCard elevation="raised" class="cron-parser-view__result-card">
      <template v-if="result && result.is_valid">
        <!-- 描述行 -->
        <div class="cron-parser-view__description">
          <span class="cron-parser-view__desc-label">描述</span>
          <span class="cron-parser-view__desc-value">{{ result.description }}</span>
        </div>
        <!-- 下次执行时间列表 -->
        <div class="cron-parser-view__next-label">下 10 次执行时间</div>
        <div class="cron-parser-view__next-list">
          <div
            v-for="(run, idx) in result.next_runs"
            :key="idx"
            class="cron-parser-view__next-item"
          >
            <span class="cron-parser-view__next-index">#{{ idx + 1 }}</span>
            <span class="cron-parser-view__next-time">{{ run }}</span>
          </div>
          <div v-if="result.next_runs.length === 0" class="cron-parser-view__next-empty">
            无可用执行时间
          </div>
        </div>
      </template>
      <div v-else class="cron-parser-view__placeholder">
        解析结果将在此显示...
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import { useCronParser } from '@/composables/useCronParser'

defineOptions({ name: 'CronParserView' })

const {
  expression,
  result,
  isLoading,
  statusText,
  statusType,
  parse,
  clearAll,
} = useCronParser()

const templates = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0 点', value: '0 0 * * *' },
  { label: '每周一', value: '0 0 * * 1' },
  { label: '每月 1 号', value: '0 0 1 * *' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每 30 分钟', value: '*/30 * * * *' },
  { label: '工作日 9 点', value: '0 9 * * 1-5' },
]

function fillTemplate(value: string) {
  expression.value = value
  parse()
}
</script>

<style scoped>
.cron-parser-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.cron-parser-view__status {
  flex-shrink: 0;
}

.cron-parser-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.cron-parser-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.cron-parser-view__status-inner--error .cron-parser-view__status-text {
  color: var(--color-error);
  font-weight: 500;
}

.cron-parser-view__status-inner--success .cron-parser-view__status-text {
  color: var(--color-success);
  font-weight: 500;
}

.cron-parser-view__status-inner--idle .cron-parser-view__status-text {
  color: var(--text-muted);
}

.cron-parser-view__status-text {
  font-size: var(--font-size-sm);
}

/* 输入区 */
.cron-parser-view__input-card {
  flex-shrink: 0;
}

.cron-parser-view__input-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.cron-parser-view__input-row :deep(.neu-input-wrapper) {
  flex: 1;
}

.cron-parser-view__input-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

/* 快捷模板 */
.cron-parser-view__templates {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
}

.cron-parser-view__templates-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  flex-shrink: 0;
}

.cron-parser-view__template-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: none;
  border-radius: var(--neu-radius-sm);
  background: var(--neu-bg);
  box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.cron-parser-view__template-btn:hover {
  color: var(--color-primary);
  box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
}

.cron-parser-view__template-btn:active {
  box-shadow: var(--neu-shadow-pressed);
  transform: scale(0.96);
}

/* 结果区 */
.cron-parser-view__result-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.cron-parser-view__result-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 描述行 */
.cron-parser-view__description {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  margin-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.cron-parser-view__desc-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.cron-parser-view__desc-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 500;
}

/* 下次执行时间 */
.cron-parser-view__next-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  flex-shrink: 0;
}

.cron-parser-view__next-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cron-parser-view__next-list::-webkit-scrollbar {
  display: none;
}

.cron-parser-view__next-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  transition: background var(--transition-fast);
}

.cron-parser-view__next-item:hover {
  background: var(--neu-bg-dark);
}

.cron-parser-view__next-item + .cron-parser-view__next-item {
  border-top: 1px solid var(--neu-bg-dark);
}

.cron-parser-view__next-index {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  min-width: 28px;
}

.cron-parser-view__next-time {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
}

.cron-parser-view__next-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  padding: var(--spacing-lg);
}

/* 占位符 */
.cron-parser-view__placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--font-size-base);
}
</style>
