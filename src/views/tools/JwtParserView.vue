<template>
  <div class="jwt-parser-view">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="jwt-parser-view__status">
      <div
        v-if="decodeResult"
        class="jwt-parser-view__status-inner"
      >
        <NeuTag type="success">Token 有效</NeuTag>
        <NeuTag v-if="decodeResult.is_expired" type="danger">
          已过期{{ decodeResult.expires_at ? ' · ' + decodeResult.expires_at : '' }}
        </NeuTag>
        <NeuTag v-else-if="decodeResult.expires_at" type="success">
          未过期 · {{ decodeResult.expires_at }}
        </NeuTag>
        <NeuTag v-else type="info">无过期信息</NeuTag>
      </div>
      <div v-else-if="decodeError" class="jwt-parser-view__status-inner jwt-parser-view__status-error">
        <span class="jwt-parser-view__error-msg">⚠️ {{ decodeError }}</span>
      </div>
      <div v-else class="jwt-parser-view__status-inner jwt-parser-view__status-idle">
        <span class="jwt-parser-view__idle-text">🔑 粘贴 JWT Token 进行解析</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="jwt-parser-view__columns">
      <!-- 左栏 - 输入区 -->
      <NeuCard title="🔑 JWT 解析工具" elevation="raised" class="jwt-parser-view__input-card">
        <NeuTextarea
          v-model="token"
          placeholder="粘贴 JWT Token..."
          class="jwt-parser-view__textarea"
        />
        <template #footer>
          <div class="jwt-parser-view__actions">
            <NeuButton type="primary" :loading="isDecoding" @click="decodeJwt">
              解析
            </NeuButton>
            <NeuButton @click="clear">清空</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 解码结果 -->
      <NeuCard v-if="decodeResult" title="解码结果" elevation="raised" class="jwt-parser-view__output-card">
        <NeuTabs v-model="activeTab" :tabs="tabOptions" />
        <div class="jwt-parser-view__tab-content">
          <!-- Header -->
          <div v-show="activeTab === 'header'" class="jwt-parser-view__tab-pane">
            <div class="jwt-parser-view__code-block">
              <pre>{{ formatJson(decodeResult.header) }}</pre>
            </div>
            <div class="jwt-parser-view__copy-row">
              <CopyButton :content="formatJson(decodeResult.header)" />
            </div>
          </div>

          <!-- Payload -->
          <div v-show="activeTab === 'payload'" class="jwt-parser-view__tab-pane">
            <div class="jwt-parser-view__code-block">
              <pre>{{ formatJson(decodeResult.payload) }}</pre>
            </div>
            <div v-if="payloadTimeFields.length > 0" class="jwt-parser-view__time-info">
              <div v-for="field in payloadTimeFields" :key="field.key" class="jwt-parser-view__time-item">
                <span class="jwt-parser-view__time-label">{{ field.label }}</span>
                <span class="jwt-parser-view__time-value">{{ field.value }}</span>
              </div>
            </div>
            <div class="jwt-parser-view__copy-row">
              <CopyButton :content="formatJson(decodeResult.payload)" />
            </div>
          </div>

          <!-- Signature -->
          <div v-show="activeTab === 'signature'" class="jwt-parser-view__tab-pane">
            <div class="jwt-parser-view__code-block">
              <pre>{{ decodeResult.signature }}</pre>
            </div>
            <div class="jwt-parser-view__copy-row">
              <CopyButton :content="decodeResult.signature" />
            </div>
          </div>
        </div>
      </NeuCard>
      <NeuCard v-else elevation="raised" class="jwt-parser-view__output-card">
        <div class="jwt-parser-view__placeholder">解码结果将在此显示...</div>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTabs from '@/components/neu/NeuTabs.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { useJwtParse } from '@/composables/useJwtParse'
import type { TabOption } from '@/components/neu/NeuTabs.vue'

defineOptions({ name: 'JwtParserView' })

const {
  token,
  decodeResult,
  decodeError,
  isDecoding,
  decodeJwt,
  loadPreferences,
  clear,
} = useJwtParse()

const activeTab = ref('header')

const tabOptions: TabOption[] = [
  { key: 'header', label: 'Header' },
  { key: 'payload', label: 'Payload' },
  { key: 'signature', label: 'Signature' },
]

// 时间戳字段映射
const timeFieldMap: Record<string, string> = {
  exp: '过期时间 (exp)',
  iat: '签发时间 (iat)',
  nbf: '生效时间 (nbf)',
}

const payloadTimeFields = computed(() => {
  if (!decodeResult.value) return []
  const payload = decodeResult.value.payload
  const fields: { key: string; label: string; value: string }[] = []

  for (const [key, label] of Object.entries(timeFieldMap)) {
    if (payload[key] != null && typeof payload[key] === 'number') {
      fields.push({
        key,
        label,
        value: formatTimestamp(payload[key] as number),
      })
    }
  }
  return fields
})

function formatJson(obj: Record<string, any>): string {
  return JSON.stringify(obj, null, 2)
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.jwt-parser-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 状态栏 */
.jwt-parser-view__status {
  flex-shrink: 0;
}

.jwt-parser-view__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.jwt-parser-view__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.jwt-parser-view__status-error {
  display: flex;
  align-items: center;
}

.jwt-parser-view__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.jwt-parser-view__status-idle {
  display: flex;
  align-items: center;
}

.jwt-parser-view__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* 双栏布局 */
.jwt-parser-view__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .jwt-parser-view__columns {
    grid-template-columns: 1fr;
  }
}

/* 左右卡片 flex 填充 */
.jwt-parser-view__input-card,
.jwt-parser-view__output-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.jwt-parser-view__input-card :deep(.neu-card__body),
.jwt-parser-view__output-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.jwt-parser-view__input-card :deep(.neu-card__footer),
.jwt-parser-view__output-card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

/* textarea 自适应 */
.jwt-parser-view__textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.jwt-parser-view__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.jwt-parser-view__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.jwt-parser-view__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 操作按钮 */
.jwt-parser-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 右栏 tab 内容 */
.jwt-parser-view__tab-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: var(--spacing-md);
}

.jwt-parser-view__tab-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.jwt-parser-view__code-block {
  flex: 1;
  min-height: 0;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-md);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.jwt-parser-view__code-block::-webkit-scrollbar {
  display: none;
}

.jwt-parser-view__code-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.6;
}

.jwt-parser-view__copy-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
  flex-shrink: 0;
}

.jwt-parser-view__time-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  flex-shrink: 0;
}

.jwt-parser-view__time-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) 0;
}

.jwt-parser-view__time-item + .jwt-parser-view__time-item {
  border-top: 1px solid var(--neu-bg-dark);
}

.jwt-parser-view__time-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 120px;
}

.jwt-parser-view__time-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: 'Fira Code', 'Cascadia Code', monospace;
}

.jwt-parser-view__placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--font-size-base);
}
</style>
