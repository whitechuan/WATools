<template>
  <div class="color-converter-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="color-converter-view__status">
      <div class="color-converter-view__status-inner">
        <span
          :class="{
            'color-converter-view__status-text': true,
            'color-converter-view__status-text--error': statusType === 'error',
            'color-converter-view__status-text--success': statusType === 'success',
            'color-converter-view__status-text--idle': statusType === 'idle',
          }"
        >{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="color-converter-view__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="🎨 颜色转换器" elevation="raised" class="color-converter-view__input-card">
        <div class="color-converter-view__input-section">
          <label class="color-converter-view__label">输入格式</label>
          <NeuSelect
            v-model="format"
            :options="formatOptions"
            placeholder="选择格式"
          />
        </div>
        <div class="color-converter-view__input-section">
          <label class="color-converter-view__label">颜色值</label>
          <div class="color-converter-view__input-with-picker">
            <NeuInput
              v-model="input"
              :placeholder="inputPlaceholder"
              clearable
              @keydown.enter="convert"
            />
            <label class="color-converter-view__color-picker-wrapper" title="点击选择颜色">
              <input
                type="color"
                class="color-converter-view__color-picker-native"
                :value="pickerColor"
                @input="onPickColor"
              />
              <span class="color-converter-view__color-picker-swatch" :style="{ background: pickerColor }"></span>
            </label>
          </div>
        </div>

        <!-- 颜色预览块 -->
        <div
          class="color-converter-view__preview"
          :style="previewStyle"
        >
          <span v-if="result" class="color-converter-view__preview-label">{{ result.hex }}</span>
        </div>

        <template #footer>
          <div class="color-converter-view__actions">
            <NeuButton type="primary" :loading="isLoading" @click="convert">
              转换
            </NeuButton>
            <NeuButton @click="clearAll">清空</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 结果展示 -->
      <div class="color-converter-view__results">
        <NeuCard elevation="raised" class="color-converter-view__result-card">
          <div class="color-converter-view__result-header">
            <span class="color-converter-view__result-title">HEX</span>
            <CopyButton :content="result?.hex || ''" />
          </div>
          <div class="color-converter-view__result-value">{{ result?.hex || '—' }}</div>
        </NeuCard>

        <NeuCard elevation="raised" class="color-converter-view__result-card">
          <div class="color-converter-view__result-header">
            <span class="color-converter-view__result-title">RGB</span>
            <CopyButton :content="result ? `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})` : ''" />
          </div>
          <div class="color-converter-view__result-value">
            {{ result ? `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})` : '—' }}
          </div>
        </NeuCard>

        <NeuCard elevation="raised" class="color-converter-view__result-card">
          <div class="color-converter-view__result-header">
            <span class="color-converter-view__result-title">HSL</span>
            <CopyButton :content="result ? `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)` : ''" />
          </div>
          <div class="color-converter-view__result-value">
            {{ result ? `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)` : '—' }}
          </div>
        </NeuCard>

        <NeuCard elevation="raised" class="color-converter-view__result-card">
          <div class="color-converter-view__result-header">
            <span class="color-converter-view__result-title">RGBA</span>
            <CopyButton :content="result?.rgba || ''" />
          </div>
          <div class="color-converter-view__result-value">{{ result?.rgba || '—' }}</div>
        </NeuCard>

        <NeuCard elevation="raised" class="color-converter-view__result-card">
          <div class="color-converter-view__result-header">
            <span class="color-converter-view__result-title">HSLA</span>
            <CopyButton :content="result?.hsla || ''" />
          </div>
          <div class="color-converter-view__result-value">{{ result?.hsla || '—' }}</div>
        </NeuCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import type { SelectOption } from '@/components/neu/NeuSelect.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { useColorConverter } from '@/composables/useColorConverter'

defineOptions({ name: 'ColorConverterView' })

const {
  input,
  format,
  result,
  isLoading,
  statusText,
  statusType,
  convert,
  clearAll,
} = useColorConverter()

const formatOptions: SelectOption[] = [
  { label: 'HEX', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
  { label: 'HSL', value: 'hsl' },
]

const inputPlaceholder = computed(() => {
  switch (format.value) {
    case 'hex': return '#ff5733 或 ff5733'
    case 'rgb': return '255, 87, 51'
    case 'hsl': return '14, 100%, 60%'
    default: return '输入颜色值'
  }
})

const previewStyle = computed(() => {
  if (!result.value) return {}
  return { background: result.value.hex }
})

// 颜色选择器当前色值
const pickerColor = ref('#000000')

// 当结果更新时同步到 picker
watch(() => result.value?.hex, (hex) => {
  if (hex) pickerColor.value = hex
})

function onPickColor(e: Event) {
  const target = e.target as HTMLInputElement
  const color = target.value
  pickerColor.value = color
  format.value = 'hex'
  input.value = color
  convert()
}
</script>

<style scoped>
.color-converter-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.color-converter-view__status {
  flex-shrink: 0;
}

.color-converter-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.color-converter-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.color-converter-view__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.color-converter-view__status-text--error {
  color: var(--color-error);
}

.color-converter-view__status-text--success {
  color: var(--color-success);
}

.color-converter-view__status-text--idle {
  color: var(--text-muted);
}

/* 双栏布局 */
.color-converter-view__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .color-converter-view__columns {
    grid-template-columns: 1fr;
  }
}

/* 左栏卡片 */
.color-converter-view__input-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.color-converter-view__input-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.color-converter-view__input-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

.color-converter-view__input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.color-converter-view__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

/* 输入行 + 颜色选择器 */
.color-converter-view__input-with-picker {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-converter-view__input-with-picker :deep(.neu-input-wrapper) {
  flex: 1;
}

.color-converter-view__color-picker-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-raised);
  overflow: hidden;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.color-converter-view__color-picker-wrapper:hover {
  transform: translateY(-1px);
  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
}

.color-converter-view__color-picker-wrapper:active {
  transform: translateY(0);
  box-shadow: var(--neu-shadow-pressed);
}

.color-converter-view__color-picker-native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.color-converter-view__color-picker-swatch {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--neu-radius-sm);
  border: 2px solid var(--neu-bg);
}

/* 颜色预览块 */
.color-converter-view__preview {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--neu-shadow-pressed);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--spacing-md);
  transition: background var(--transition-normal);
  flex-shrink: 0;
  max-height: 180px;
}

.color-converter-view__preview-label {
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  backdrop-filter: blur(4px);
}

/* 操作按钮 */
.color-converter-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 右栏结果区 */
.color-converter-view__results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: var(--spacing-md);
}

.color-converter-view__results::-webkit-scrollbar {
  display: none;
}

.color-converter-view__result-card {
  flex-shrink: 0;
}

.color-converter-view__result-card :deep(.neu-card__body) {
  padding: var(--spacing-md) var(--spacing-lg);
}

.color-converter-view__result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.color-converter-view__result-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-converter-view__result-value {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  word-break: break-all;
}


</style>
