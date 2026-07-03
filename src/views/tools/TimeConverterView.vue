<template>
  <div class="time-converter">
    <!-- 区块1 - 实时时间标题栏 -->
    <NeuCard elevation="raised" class="compact-card">
      <div class="title-bar">
        <span class="title-bar__icon">⏰</span>
        <div class="title-bar__items">
          <span class="title-bar__clock">{{ currentTime }}</span>
          <span class="title-bar__divider">│</span>
          <span class="title-bar__stamp">Unix: {{ currentUnix }}</span>
          <span class="title-bar__divider">│</span>
          <span class="title-bar__stamp">Unix(ms): {{ currentUnixMs }}</span>
        </div>
      </div>
    </NeuCard>

    <!-- 区块2 - 输入区 -->
    <NeuCard elevation="raised">
      <div class="input-section">
        <div class="input-section__row">
          <label class="input-section__label">输入格式</label>
          <NeuSelect
            v-model="fromFormat"
            :options="formatOptions"
            placeholder="选择格式"
          />
        </div>
        <div class="input-section__row">
          <label class="input-section__label">输入值</label>
          <div class="time-input-wrapper">
            <input
              v-model="input"
              class="time-input__field"
              :placeholder="formatPlaceholder"
            />
            <div class="time-input__actions">
              <button class="time-input__now-btn" type="button" @click="fillCurrentTime" title="填入当前时间">
                <svg class="time-input__now-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>当前时间</span>
              </button>
              <div class="time-input__calendar" @click="openDatePicker" title="选择日期时间">
                <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>

            <!-- 自定义日期选择弹出面板 -->
            <div v-if="showDatePicker" class="date-picker-popup" @click.stop>
              <div class="date-picker-popup__content">
                <label class="date-picker-popup__label">选择日期和时间</label>
                <input
                  type="datetime-local"
                  v-model="tempDateValue"
                  class="date-picker-popup__input"
                />
                <div class="date-picker-popup__actions">
                  <NeuButton type="default" size="sm" @click="showDatePicker = false">取消</NeuButton>
                  <NeuButton type="primary" size="sm" @click="confirmDatePicker">确认</NeuButton>
                </div>
              </div>
            </div>
          </div>
          <!-- 点击外部关闭的遮罩 -->
          <div v-if="showDatePicker" class="date-picker-overlay" @click="showDatePicker = false"></div>
        </div>
        <div class="input-section__actions">
          <NeuButton type="primary" :loading="loading" @click="convertTime">
            转换
          </NeuButton>
          <NeuButton type="default" @click="clearAll">
            清空
          </NeuButton>
        </div>
      </div>
    </NeuCard>

    <!-- 错误提示 -->
    <NeuCard v-if="error" elevation="raised">
      <div class="error-message">
        ❌ {{ error }}
      </div>
    </NeuCard>

    <!-- 区块3 - 结果区（始终显示，每行2卡片） -->
    <div class="result-section">
      <div class="result-section__header">
        <h3 class="section-title">转换结果</h3>
        <NeuButton
          type="default"
          size="sm"
          :disabled="!result"
          @click="copyAll"
        >
          复制全部
        </NeuButton>
      </div>
      <div class="result-rows">
        <!-- 行1: 本地时间 | Unix(秒) | Unix(毫秒) -->
        <div class="result-row result-row--triple">
          <div
            v-for="item in [resultItems[0], resultItems[1], resultItems[2]]"
            :key="item.label"
            class="result-card"
            :class="{
              'result-card--copied': copiedLabel === item.label,
              'result-card--empty': !item.value
            }"
            @click="copyResult(item)"
          >
            <div class="result-card__header">
              <span class="result-card__label">{{ item.label }}</span>
              <span class="result-card__icon">
                {{ copiedLabel === item.label ? '✓' : '📋' }}
              </span>
            </div>
            <div class="result-card__value">
              {{ item.value || '等待输入...' }}
            </div>
          </div>
        </div>
        <!-- 行2: ISO 8601 | RFC 2822 -->
        <div class="result-row">
          <div
            v-for="item in [resultItems[3], resultItems[4]]"
            :key="item.label"
            class="result-card"
            :class="{
              'result-card--copied': copiedLabel === item.label,
              'result-card--empty': !item.value
            }"
            @click="copyResult(item)"
          >
            <div class="result-card__header">
              <span class="result-card__label">{{ item.label }}</span>
              <span class="result-card__icon">
                {{ copiedLabel === item.label ? '✓' : '📋' }}
              </span>
            </div>
            <div class="result-card__value">
              {{ item.value || '等待输入...' }}
            </div>
          </div>
        </div>
        <!-- 行3: UTC时间 | 相对时间 -->
        <div class="result-row">
          <div
            v-for="item in [resultItems[5], resultItems[6]]"
            :key="item.label"
            class="result-card"
            :class="{
              'result-card--copied': copiedLabel === item.label,
              'result-card--empty': !item.value
            }"
            @click="copyResult(item)"
          >
            <div class="result-card__header">
              <span class="result-card__label">{{ item.label }}</span>
              <span class="result-card__icon">
                {{ copiedLabel === item.label ? '✓' : '📋' }}
              </span>
            </div>
            <div class="result-card__value">
              {{ item.value || '等待输入...' }}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import { useTimeConversion } from '@/composables/useTimeConversion'
import type { SelectOption } from '@/components/neu/NeuSelect.vue'

defineOptions({ name: 'TimeConverterView' })

const {
  input,
  fromFormat,
  result,
  loading,
  error,
  loadPreferences,
  convertTime,
  clearAll,
  getAllResultsText
} = useTimeConversion()

const formatOptions: SelectOption[] = [
  { label: '自动检测', value: 'auto' },
  { label: 'Unix秒', value: 'unix_seconds' },
  { label: 'Unix毫秒', value: 'unix_millis' },
  { label: 'ISO 8601', value: 'iso8601' },
  { label: 'RFC 2822', value: 'rfc2822' },
  { label: '本地时间', value: 'local' }
]

const formatPlaceholder = computed(() => {
  switch (fromFormat.value) {
    case 'auto': return '输入时间值（支持时间戳、ISO 8601、RFC 2822等）'
    case 'unix_seconds': return '输入秒级时间戳，如 1719129600'
    case 'unix_millis': return '输入毫秒级时间戳，如 1719129600000'
    case 'iso8601': return '输入 ISO 8601 格式，如 2024-06-23T12:00:00Z'
    case 'rfc2822': return '输入 RFC 2822 格式，如 Sun, 23 Jun 2024 12:00:00 +0000'
    case 'local': return '输入本地时间，如 2024-06-23 20:00:00'
    default: return '输入时间值...'
  }
})

const showDatePicker = ref(false)
const tempDateValue = ref('')

function formatToLocal(date: Date): string {
  const y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${M}-${d} ${h}:${m}:${s}`
}

function openDatePicker() {
  const now = new Date()
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const y = now.getFullYear()
  const M = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  tempDateValue.value = `${y}-${M}-${d}T${h}:${m}`
  showDatePicker.value = true
}

function confirmDatePicker() {
  if (!tempDateValue.value) return
  const selectedDate = new Date(tempDateValue.value)
  if (isNaN(selectedDate.getTime())) return

  switch (fromFormat.value) {
    case 'unix_seconds':
      input.value = String(Math.floor(selectedDate.getTime() / 1000))
      break
    case 'unix_millis':
      input.value = String(selectedDate.getTime())
      break
    case 'iso8601':
      input.value = selectedDate.toISOString()
      break
    case 'rfc2822':
      input.value = selectedDate.toUTCString()
      break
    case 'local':
      input.value = formatToLocal(selectedDate)
      break
    case 'auto':
    default:
      input.value = selectedDate.toISOString()
      break
  }
  showDatePicker.value = false
}

function fillCurrentTime() {
  const now = new Date()
  switch (fromFormat.value) {
    case 'unix_seconds':
      input.value = String(Math.floor(now.getTime() / 1000))
      break
    case 'unix_millis':
      input.value = String(now.getTime())
      break
    case 'iso8601':
      input.value = now.toISOString()
      break
    case 'rfc2822':
      input.value = now.toUTCString()
      break
    case 'local':
      input.value = now.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      })
      break
    case 'auto':
    default:
      input.value = now.toISOString()
      break
  }
}

interface ResultItem {
  label: string
  value: string
}

const resultItems = computed<ResultItem[]>(() => {
  const r = result.value
  return [
    { label: '本地时间', value: r?.local_time ?? '' },
    { label: 'Unix(秒)', value: r ? String(r.unix_seconds) : '' },
    { label: 'Unix(毫秒)', value: r ? String(r.unix_millis) : '' },
    { label: 'ISO 8601', value: r?.iso8601 ?? '' },
    { label: 'RFC 2822', value: r?.rfc2822 ?? '' },
    { label: 'UTC时间', value: r?.utc_time ?? '' },
    { label: '相对时间', value: r?.relative ?? '' }
  ]
})

const copiedLabel = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyResult(item: ResultItem) {
  if (!item.value) return
  try {
    await navigator.clipboard.writeText(item.value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = item.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  copiedLabel.value = item.label
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copiedLabel.value = null
  }, 1500)
}

async function copyAll() {
  const text = getAllResultsText()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

onMounted(() => {
  loadPreferences()
  startClock()
})

onUnmounted(() => {
  stopClock()
})

// 实时时钟
const currentTime = ref('')
const currentUnix = ref(0)
const currentUnixMs = ref(0)
let clockTimer: ReturnType<typeof setInterval> | null = null

function updateClock() {
  const now = new Date()
  const y = now.getFullYear()
  const M = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${y}-${M}-${d} ${h}:${m}:${s}`
  currentUnix.value = Math.floor(now.getTime() / 1000)
  currentUnixMs.value = now.getTime()
}

function startClock() {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
}

function stopClock() {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
}
</script>

<style scoped>
.time-converter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 紧凑卡片：减少标题栏垂直空间 */
.compact-card :deep(.neu-card__body) {
  padding: var(--spacing-sm) var(--spacing-lg);
}

/* 标题栏 */
.title-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
}

.title-bar__icon {
  font-size: 1.5rem;
}

.title-bar__time {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-bar__clock {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.title-bar__items {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--text-muted);
  line-height: 1.2;
}

.title-bar__divider {
  opacity: 0.4;
}

.title-bar__stamp {
  color: var(--text-muted);
}

.title-bar__timestamps {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--text-muted);
  line-height: 1.2;
}

.title-bar__sep {
  opacity: 0.4;
}

/* 输入区 */
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.input-section__row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.input-section__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

/* 拟态凹陷输入框容器 */
.time-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: box-shadow var(--transition-fast);
}

.time-input-wrapper:focus-within {
  box-shadow: inset 5px 5px 10px var(--neu-shadow-dark),
              inset -5px -5px 10px var(--neu-shadow-light),
              0 0 0 3px var(--color-primary-light);
}

.time-input__field {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  min-width: 0;
}

.time-input__field::placeholder {
  color: var(--text-muted);
}

/* 输入框内右侧操作区 */
.time-input__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
  margin-left: var(--spacing-sm);
}

/* 当前时间按钮 */
.time-input__now-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: var(--neu-radius-sm);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.time-input__now-btn:hover {
  color: var(--color-primary);
  box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
}

.time-input__now-btn:active {
  box-shadow: var(--neu-shadow-pressed);
  transform: scale(0.96);
}

.time-input__now-icon {
  width: 14px;
  height: 14px;
}

/* 日历按钮 - 内嵌在输入框内 */
.time-input__calendar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--neu-radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.time-input__calendar:hover {
  background: var(--neu-bg-dark);
}

.calendar-icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

/* 自定义日期选择弹出面板 */
.date-picker-popup {
  position: absolute;
  top: calc(100% + var(--spacing-sm, 8px));
  right: 0;
  z-index: 1000;
  background: var(--neu-bg);
  border-radius: var(--neu-radius, 16px);
  box-shadow: var(--neu-shadow-raised, 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light));
  padding: var(--spacing-lg, 20px);
  min-width: 280px;
}

.date-picker-popup__label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm, 8px);
}

.date-picker-popup__input {
  width: 100%;
  background: var(--neu-bg);
  border: none;
  border-radius: var(--neu-radius-sm, 8px);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 14px);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  outline: none;
  margin-bottom: var(--spacing-md, 14px);
  box-sizing: border-box;
}

.date-picker-popup__input:focus {
  box-shadow: inset 5px 5px 10px var(--neu-shadow-dark),
              inset -5px -5px 10px var(--neu-shadow-light),
              0 0 0 3px var(--color-primary-light);
}

.date-picker-popup__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 8px);
}

/* 遮罩层 */
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.input-section__actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 错误提示 */
.error-message {
  color: var(--color-error, #e74c3c);
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  background: rgba(231, 76, 60, 0.08);
}

/* 区块标题 */
.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 结果区 */
.result-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-row {
  display: flex;
  gap: var(--spacing-md);
}

.result-row--triple {
  gap: var(--spacing-sm);
}

.result-row--triple .result-card {
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-md);
}

.result-row--triple .result-card__header {
  margin-bottom: var(--spacing-xs);
}

.result-row--triple .result-card__value {
  font-size: var(--font-size-base);
}

.result-row .result-card {
  flex: 1;
  min-width: 0;
}

/* 单个结果卡片 */
.result-card {
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--neu-shadow-raised);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.result-card--empty {
  cursor: default;
  opacity: 0.65;
}

.result-card:not(.result-card--empty):hover {
  transform: translateY(-2px);
  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
}

.result-card--copied {
  box-shadow: var(--neu-shadow-pressed);
}

.result-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.result-card__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.result-card__icon {
  font-size: var(--font-size-sm);
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.result-card:not(.result-card--empty):hover .result-card__icon {
  opacity: 1;
}

.result-card--copied .result-card__icon {
  opacity: 1;
  color: var(--color-success);
  font-weight: 700;
}

.result-card__value {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.4;
}

.result-card--empty .result-card__value {
  color: var(--text-muted);
  font-style: italic;
}
</style>
