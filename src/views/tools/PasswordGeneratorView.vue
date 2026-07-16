<template>
  <div class="password-generator-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="password-generator-view__status">
      <div class="password-generator-view__status-inner">
        <span
          class="password-generator-view__status-text"
          :class="{
            'password-generator-view__status-text--error': !!error,
            'password-generator-view__status-text--success': !error && generatedPassword,
            'password-generator-view__status-text--idle': !error && !generatedPassword,
          }"
        >
          {{ error || (generatedPassword ? '✅ 密码已生成' : '⌨️ 配置选项后点击生成') }}
        </span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="password-generator-view__columns">
      <!-- 左栏 - 密码生成器 -->
      <NeuCard title="🔑 密码生成器" elevation="raised" class="password-generator-view__gen-card">
        <div class="password-generator-view__options">
          <!-- 长度滑块 -->
          <div class="password-generator-view__slider-group">
            <label class="password-generator-view__label">
              密码长度: <strong>{{ length }}</strong>
            </label>
            <div class="password-generator-view__slider-wrapper">
              <span class="password-generator-view__slider-min">8</span>
              <input
                type="range"
                v-model.number="length"
                :min="8"
                :max="64"
                class="password-generator-view__slider"
              />
              <span class="password-generator-view__slider-max">64</span>
            </div>
          </div>

          <!-- 字符类型勾选 -->
          <div class="password-generator-view__checkboxes">
            <label class="password-generator-view__checkbox">
              <input type="checkbox" v-model="uppercase" />
              <span>大写字母 (A-Z)</span>
            </label>
            <label class="password-generator-view__checkbox">
              <input type="checkbox" v-model="lowercase" />
              <span>小写字母 (a-z)</span>
            </label>
            <label class="password-generator-view__checkbox">
              <input type="checkbox" v-model="digits" />
              <span>数字 (0-9)</span>
            </label>
            <label class="password-generator-view__checkbox">
              <input type="checkbox" v-model="symbols" />
              <span>符号 (!@#$%...)</span>
            </label>
          </div>

          <!-- 生成结果 -->
          <div v-if="generatedPassword" class="password-generator-view__result">
            <div class="password-generator-view__result-value">
              {{ generatedPassword }}
            </div>
            <NeuButton size="small" @click="copyPassword">📋 复制</NeuButton>
          </div>
        </div>

        <template #footer>
          <div class="password-generator-view__actions">
            <NeuButton type="primary" :loading="isLoading" @click="generate">
              生成密码
            </NeuButton>
            <NeuButton @click="clearAll">清空</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 密码强度检测 -->
      <NeuCard title="🛡️ 密码强度检测" elevation="raised" class="password-generator-view__strength-card">
        <div class="password-generator-view__strength-content">
          <!-- 输入框 -->
          <NeuInput
            v-model="passwordToCheck"
            placeholder="输入或生成密码后自动检测..."
            class="password-generator-view__input"
          />

          <!-- 强度进度条 -->
          <div v-if="strengthResult" class="password-generator-view__strength-display">
            <div class="password-generator-view__score-label">
              强度评分: {{ scoreLabels[strengthResult.score] }}
            </div>
            <div class="password-generator-view__progress-bar">
              <div
                class="password-generator-view__progress-fill"
                :style="{
                  width: ((strengthResult.score + 1) / 5 * 100) + '%',
                  backgroundColor: scoreColors[strengthResult.score]
                }"
              ></div>
            </div>

            <!-- 破解时间 -->
            <div class="password-generator-view__crack-time">
              <span class="password-generator-view__crack-label">预估破解时间:</span>
              <span class="password-generator-view__crack-value">{{ strengthResult.crack_time }}</span>
            </div>

            <!-- 反馈建议 -->
            <div class="password-generator-view__feedback">
              <div
                v-for="(item, idx) in strengthResult.feedback"
                :key="idx"
                class="password-generator-view__feedback-item"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div v-else class="password-generator-view__placeholder">
            输入密码后点击检测或生成密码自动检测
          </div>
        </div>

        <template #footer>
          <div class="password-generator-view__actions">
            <NeuButton type="primary" @click="checkStrength">
              检测强度
            </NeuButton>
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import { usePasswordGenerator } from '@/composables/usePasswordGenerator'

defineOptions({ name: 'PasswordGeneratorView' })

const {
  length, uppercase, lowercase, digits, symbols, generatedPassword,
  passwordToCheck, strengthResult, error, isLoading,
  generate, checkStrength, copyPassword, clearAll
} = usePasswordGenerator()

const scoreLabels = ['极弱', '弱', '一般', '强', '极强']
const scoreColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
</script>

<style scoped>
.password-generator-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.password-generator-view__status {
  flex-shrink: 0;
}

.password-generator-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.password-generator-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.password-generator-view__status-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.password-generator-view__status-text--error {
  color: var(--color-error);
}

.password-generator-view__status-text--success {
  color: var(--color-success);
}

.password-generator-view__status-text--idle {
  color: var(--text-muted);
}

/* 双栏布局 */
.password-generator-view__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .password-generator-view__columns {
    grid-template-columns: 1fr;
  }
}

/* 卡片通用 */
.password-generator-view__gen-card,
.password-generator-view__strength-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.password-generator-view__gen-card :deep(.neu-card__body),
.password-generator-view__strength-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.password-generator-view__gen-card :deep(.neu-card__body)::-webkit-scrollbar,
.password-generator-view__strength-card :deep(.neu-card__body)::-webkit-scrollbar {
  display: none;
}

/* 选项区域 */
.password-generator-view__options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 滑块 */
.password-generator-view__slider-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.password-generator-view__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.password-generator-view__label strong {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.password-generator-view__slider-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.password-generator-view__slider-min,
.password-generator-view__slider-max {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-width: 20px;
  text-align: center;
}

.password-generator-view__slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--neu-bg);
  border-radius: 3px;
  box-shadow: var(--neu-shadow-pressed);
  outline: none;
  cursor: pointer;
}

.password-generator-view__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  cursor: pointer;
}

.password-generator-view__slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  cursor: pointer;
  border: none;
}

/* 勾选框 */
.password-generator-view__checkboxes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.password-generator-view__checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  transition: background-color var(--transition-fast);
}

.password-generator-view__checkbox:hover {
  background-color: rgba(var(--color-primary-rgb, 108, 99, 255), 0.05);
}

.password-generator-view__checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

/* 生成结果 */
.password-generator-view__result {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.password-generator-view__result-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.6;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* 操作按钮 */
.password-generator-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 强度检测内容 */
.password-generator-view__strength-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.password-generator-view__input {
  width: 100%;
}

/* 强度展示 */
.password-generator-view__strength-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.password-generator-view__score-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.password-generator-view__progress-bar {
  height: 8px;
  background: var(--neu-bg);
  border-radius: 4px;
  box-shadow: var(--neu-shadow-pressed);
  overflow: hidden;
}

.password-generator-view__progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

/* 破解时间 */
.password-generator-view__crack-time {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
}

.password-generator-view__crack-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.password-generator-view__crack-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 500;
}

/* 反馈建议 */
.password-generator-view__feedback {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.password-generator-view__feedback-item {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  background: rgba(var(--color-primary-rgb, 108, 99, 255), 0.03);
  line-height: 1.5;
}

.password-generator-view__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-xl) 0;
}
</style>
