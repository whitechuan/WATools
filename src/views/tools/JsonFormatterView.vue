<template>
  <div class="json-formatter">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="json-formatter__status">
      <div
        v-if="validation?.valid && stats"
        class="json-formatter__status-inner json-formatter__status-success"
        :title="`有效 JSON | 行: ${stats.lines} | 键: ${stats.keys} | 深度: ${stats.max_depth} | ${stats.size_bytes} bytes`"
      >
        <NeuTag type="success">✓ 有效 JSON</NeuTag>
        <span class="json-formatter__stat-sep">│</span>
        <span class="json-formatter__stat">行: {{ stats.lines }}</span>
        <span class="json-formatter__stat-sep">│</span>
        <span class="json-formatter__stat">键: {{ stats.keys }}</span>
        <span class="json-formatter__stat-sep">│</span>
        <span class="json-formatter__stat">深度: {{ stats.max_depth }}</span>
        <span class="json-formatter__stat-sep">│</span>
        <span class="json-formatter__stat">{{ stats.size_bytes }} bytes</span>
      </div>
      <div
        v-else-if="validation && !validation.valid"
        class="json-formatter__status-inner json-formatter__status-error"
        :title="[validation.error_message, ...validation.suggestions].join(' | ')"
      >
        <span class="json-formatter__error-msg">⚠ {{ validation.error_message }}</span>
        <template v-if="validation.suggestions.length">
          <span class="json-formatter__stat-sep">│</span>
          <span
            v-for="(suggestion, idx) in validation.suggestions"
            :key="idx"
            class="json-formatter__suggestion"
          >💡 {{ suggestion }}</span>
        </template>
      </div>
      <div
        v-else-if="errorMessage"
        class="json-formatter__status-inner json-formatter__status-error"
        :title="errorMessage"
      >
        <span class="json-formatter__error-msg">⚠ {{ errorMessage }}</span>
      </div>
      <div v-else class="json-formatter__status-inner json-formatter__status-idle">
        <span class="json-formatter__idle-text">📋 输入 JSON 后自动验证</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="json-formatter__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="输入" elevation="raised" class="json-formatter__input-card">
        <NeuTextarea
          v-model="input"
          placeholder="在此粘贴 JSON..."
          :show-count="true"
          class="json-formatter__textarea"
        />
        <template #footer>
          <div class="json-formatter__actions">
            <NeuButton type="primary" :loading="isLoading" @click="formatJson">
              格式化
            </NeuButton>
            <NeuButton :loading="isLoading" @click="minifyJson">
              压缩
            </NeuButton>
            <NeuButton :loading="isLoading" @click="validateJson">
              验证
            </NeuButton>
            <NeuButton type="danger" @click="clearAll">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 输出区 -->
      <NeuCard title="输出" elevation="raised" class="json-formatter__output-card">
        <div class="json-formatter__output neu-pressed">
          <pre
            v-if="output"
            class="json-formatter__code"
            v-html="highlightedOutput"
          ></pre>
          <span v-else class="json-formatter__placeholder">
            输出将在此显示...
          </span>
        </div>
        <template #footer>
          <div class="json-formatter__output-actions">
            <NeuSelect
              :model-value="indent"
              :options="indentOptions"
              placeholder="缩进"
              @change="handleIndentChange"
            />
            <CopyButton :content="output" />
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useJsonFormat } from '@/composables/useJsonFormat'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'JsonFormatterView' })

const {
  input,
  output,
  indent,
  isLoading,
  validation,
  stats,
  errorMessage,
  loadPreferences,
  saveIndentPreference,
  formatJson,
  minifyJson,
  validateJson,
  clearAll
} = useJsonFormat()

const indentOptions = [
  { label: '2 空格', value: 2 },
  { label: '4 空格', value: 4 }
]

function handleIndentChange(value: string | number) {
  saveIndentPreference(Number(value))
}

// 语法高亮
function highlightJson(jsonStr: string): string {
  // 用正则对 JSON 分词并添加高亮 class
  return jsonStr.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, str, colon, bool, num) => {
      if (str) {
        if (colon) {
          // 键名
          return `<span class="json-key">${escapeHtml(str)}</span>${colon}`
        }
        // 字符串值
        return `<span class="json-string">${escapeHtml(str)}</span>`
      }
      if (bool) {
        return `<span class="json-bool">${match}</span>`
      }
      if (num) {
        return `<span class="json-number">${match}</span>`
      }
      return match
    }
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const highlightedOutput = computed(() => {
  if (!output.value) return ''
  return highlightJson(output.value)
})

onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.json-formatter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.json-formatter__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .json-formatter__columns {
    grid-template-columns: 1fr;
  }
}

/* 左右卡片 flex 填充 */
.json-formatter__input-card,
.json-formatter__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.json-formatter__input-card :deep(.neu-card__body),
.json-formatter__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.json-formatter__input-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

.json-formatter__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.json-formatter__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.json-formatter__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.json-formatter__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.json-formatter__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}

.json-formatter__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.json-formatter__output {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.json-formatter__output::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}

.json-formatter__code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.json-formatter__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.json-formatter__output-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.json-formatter__output-actions .neu-select {
  width: 120px;
}

/* 状态栏 */
.json-formatter__status {
  flex-shrink: 0;
}

.json-formatter__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.json-formatter__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.json-formatter__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.json-formatter__stat {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.json-formatter__stat-sep {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.json-formatter__status-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.json-formatter__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.json-formatter__suggestion {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.json-formatter__status-idle {
  display: flex;
  align-items: center;
}

.json-formatter__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* 语法高亮 */
.json-formatter__code :deep(.json-key) {
  color: var(--color-primary);
}

.json-formatter__code :deep(.json-string) {
  color: var(--color-success);
}

.json-formatter__code :deep(.json-number) {
  color: var(--color-accent);
}

.json-formatter__code :deep(.json-bool) {
  color: var(--color-secondary);
}
</style>
