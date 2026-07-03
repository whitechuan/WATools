<template>
  <div class="settings-view">
    <h1 class="settings-view__title">设置</h1>

    <!-- 主题选择 -->
    <NeuCard title="🎨 主题选择" elevation="raised" class="settings-view__section">
      <ThemeSelector />
    </NeuCard>

    <!-- 编辑器设置 -->
    <NeuCard title="📝 编辑器设置" elevation="raised" class="settings-view__section">
      <div class="settings-view__row">
        <label class="settings-view__label">字体大小</label>
        <div class="settings-view__control">
          <NeuSelect
            :model-value="settings.fontSize"
            :options="fontSizeOptions"
            @update:model-value="onFontSizeChange"
          />
        </div>
      </div>
    </NeuCard>

    <!-- 工具默认设置 -->
    <NeuCard title="🔧 工具默认设置" elevation="raised" class="settings-view__section">
      <div class="settings-view__row">
        <label class="settings-view__label">JSON 缩进</label>
        <div class="settings-view__control">
          <NeuSelect
            :model-value="settings.jsonIndentSize"
            :options="indentOptions"
            @update:model-value="onIndentChange"
          />
        </div>
      </div>

      <div class="settings-view__row">
        <label class="settings-view__label">自动验证</label>
        <div class="settings-view__control">
          <NeuSwitch
            :model-value="settings.jsonAutoValidate"
            @update:model-value="onAutoValidateChange"
          />
        </div>
      </div>

      <div class="settings-view__row">
        <label class="settings-view__label">时间格式</label>
        <div class="settings-view__control">
          <NeuSelect
            :model-value="settings.timeDefaultFormat"
            :options="timeFormatOptions"
            @update:model-value="onTimeFormatChange"
          />
        </div>
      </div>

      <div class="settings-view__row">
        <label class="settings-view__label">JWT 算法</label>
        <div class="settings-view__control">
          <NeuSelect
            :model-value="settings.jwtDefaultAlgorithm"
            :options="jwtAlgorithmOptions"
            @update:model-value="onJwtAlgorithmChange"
          />
        </div>
      </div>
    </NeuCard>

    <!-- 数据管理 -->
    <NeuCard title="📊 数据管理" elevation="raised" class="settings-view__section">
      <div class="settings-view__row">
        <label class="settings-view__label">操作历史</label>
        <span class="settings-view__info">{{ historyStore.historyCount }} 条记录</span>
      </div>

      <div class="settings-view__actions">
        <NeuButton type="danger" size="sm" @click="handleClearHistory">
          清空历史
        </NeuButton>
        <NeuButton type="default" size="sm" @click="handleExport">
          导出设置
        </NeuButton>
        <NeuButton type="default" size="sm" @click="handleImport">
          导入设置
        </NeuButton>
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import NeuSwitch from '@/components/neu/NeuSwitch.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import ThemeSelector from '@/components/common/ThemeSelector.vue'
import { useSettingsStore } from '@/stores/settings'
import { useHistoryStore } from '@/stores/history'
import type { SelectOption } from '@/components/neu/NeuSelect.vue'

defineOptions({ name: 'SettingsView' })

const settings = useSettingsStore()
const historyStore = useHistoryStore()

// ===== 选项定义 =====
const fontSizeOptions: SelectOption[] = [
  { label: '12px', value: 12 },
  { label: '13px', value: 13 },
  { label: '14px', value: 14 },
  { label: '15px', value: 15 },
  { label: '16px', value: 16 },
  { label: '18px', value: 18 },
  { label: '20px', value: 20 },
  { label: '22px', value: 22 },
  { label: '24px', value: 24 },
]

const indentOptions: SelectOption[] = [
  { label: '2 空格', value: 2 },
  { label: '4 空格', value: 4 },
]

const timeFormatOptions: SelectOption[] = [
  { label: '自动检测', value: 'auto' },
  { label: 'Unix 时间戳', value: 'unix' },
  { label: 'ISO 8601', value: 'iso8601' },
]

const jwtAlgorithmOptions: SelectOption[] = [
  { label: 'HS256', value: 'HS256' },
  { label: 'HS384', value: 'HS384' },
  { label: 'HS512', value: 'HS512' },
  { label: 'RS256', value: 'RS256' },
]

// ===== 事件处理 =====
function onFontSizeChange(val: string | number) {
  settings.updateSetting('fontSize', Number(val))
}

function onIndentChange(val: string | number) {
  settings.updateSetting('jsonIndentSize', Number(val))
}

function onAutoValidateChange(val: boolean) {
  settings.updateSetting('jsonAutoValidate', val)
}

function onTimeFormatChange(val: string | number) {
  settings.updateSetting('timeDefaultFormat', String(val))
}

function onJwtAlgorithmChange(val: string | number) {
  settings.updateSetting('jwtDefaultAlgorithm', String(val))
}

async function handleClearHistory() {
  await historyStore.clear()
}

function handleExport() {
  // TODO: 实现导出设置到文件
  const data = settings.exportSettings()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'watools-settings.json'
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  // TODO: 实现从文件导入设置
}

// ===== 初始化 =====
onMounted(async () => {
  if (!settings.loaded) {
    await settings.loadSettings()
  }
  await historyStore.loadHistoryCount()
})
</script>

<style scoped>
.settings-view {
  max-width: 720px;
  margin: 0 auto;
}

.settings-view__title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.settings-view__section {
  margin-bottom: var(--spacing-lg);
}

.settings-view__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}

.settings-view__row + .settings-view__row {
  border-top: 1px solid var(--neu-bg-dark);
}

.settings-view__label {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.settings-view__control {
  width: 180px;
  flex-shrink: 0;
}

.settings-view__info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.settings-view__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
}
</style>
