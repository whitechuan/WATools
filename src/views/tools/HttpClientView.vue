<template>
  <div class="http-client">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="http-client__status">
      <div
        class="http-client__status-inner"
        :class="[`http-client__status-${statusType}`]"
      >
        <span v-if="statusType === 'error'" class="http-client__status-error">{{ statusText }}</span>
        <span v-else-if="statusType === 'success'" class="http-client__status-success">{{ statusText }}</span>
        <span v-else class="http-client__status-idle">{{ statusText }}</span>
      </div>
    </NeuCard>

    <!-- 请求区 -->
    <NeuCard title="请求" elevation="raised" class="http-client__request">
      <div class="http-client__url-row">
        <NeuSelect
          v-model="method"
          :options="methodOptions"
          class="http-client__method"
        />
        <NeuInput
          v-model="url"
          placeholder="输入请求 URL，例如 https://httpbin.org/get"
          clearable
          class="http-client__url-input"
          @keyup.enter="send"
        />
        <NeuButton type="primary" :loading="isLoading" @click="send">
          发送
        </NeuButton>
        <NeuButton type="danger" @click="clearAll">
          🗑️ 清空
        </NeuButton>
      </div>

      <NeuTabs
        v-model="requestTab"
        :tabs="requestTabs"
        class="http-client__req-tabs"
      />

      <div class="http-client__req-content">
        <!-- Headers tab -->
        <div v-if="requestTab === 'headers'" class="http-client__headers">
          <div
            v-for="(header, index) in headers"
            :key="index"
            class="http-client__header-row"
          >
            <NeuInput
              v-model="header.key"
              placeholder="Header 名称"
              class="http-client__header-key"
            />
            <NeuInput
              v-model="header.value"
              placeholder="Header 值"
              class="http-client__header-value"
            />
            <NeuButton size="sm" type="danger" @click="removeHeader(index)">
              ✕
            </NeuButton>
          </div>
          <NeuButton size="sm" @click="addHeader">
            + 添加 Header
          </NeuButton>
        </div>

        <!-- Body tab -->
        <div v-if="requestTab === 'body'" class="http-client__body-input">
          <NeuTextarea
            v-model="body"
            placeholder="请求体（JSON / 纯文本）"
            :rows="6"
            class="http-client__body-textarea"
          />
        </div>
      </div>
    </NeuCard>

    <!-- 响应区 -->
    <NeuCard title="响应" elevation="raised" class="http-client__response">
      <NeuTabs
        v-model="responseTab"
        :tabs="responseTabs"
        class="http-client__resp-tabs"
      />

      <div class="http-client__resp-content">
        <!-- Body tab -->
        <div v-if="responseTab === 'body'" class="http-client__resp-body">
          <div v-if="response" class="http-client__body-display neu-pressed">
            <pre class="http-client__body-pre" v-html="formattedBody"></pre>
          </div>
          <span v-else class="http-client__placeholder">响应体将在此显示...</span>
        </div>

        <!-- Headers tab -->
        <div v-if="responseTab === 'headers'" class="http-client__resp-headers">
          <div v-if="response && response.headers.length" class="http-client__headers-list">
            <div
              v-for="(h, index) in response.headers"
              :key="index"
              class="http-client__resp-header-row"
            >
              <span class="http-client__resp-header-key">{{ h.key }}</span>
              <span class="http-client__resp-header-sep">:</span>
              <span class="http-client__resp-header-value">{{ h.value }}</span>
            </div>
          </div>
          <span v-else class="http-client__placeholder">响应头将在此显示...</span>
        </div>
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHttpClient } from '@/composables/useHttpClient'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import NeuTabs from '@/components/neu/NeuTabs.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'

defineOptions({ name: 'HttpClientView' })

const {
  url, method, headers, body, response, isLoading,
  statusText, statusType,
  addHeader, removeHeader, send, clearAll
} = useHttpClient()

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
]

const requestTab = ref('headers')
const responseTab = ref('body')

const requestTabs = [
  { key: 'headers', label: 'Headers', icon: '📋' },
  { key: 'body', label: 'Body', icon: '📝' },
]

const responseTabs = [
  { key: 'body', label: 'Body', icon: '📄' },
  { key: 'headers', label: 'Headers', icon: '📋' },
]

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightJson(jsonStr: string): string {
  return jsonStr.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, str, colon, bool, num) => {
      if (str) {
        if (colon) {
          return `<span class="json-key">${escapeHtml(str)}</span>${colon}`
        }
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

const formattedBody = computed(() => {
  if (!response.value) return ''
  const text = response.value.body
  if (!text) return ''
  // 尝试解析为 JSON 并格式化
  try {
    const parsed = JSON.parse(text)
    const pretty = JSON.stringify(parsed, null, 2)
    return highlightJson(pretty)
  } catch {
    return escapeHtml(text)
  }
})
</script>

<style scoped>
.http-client {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
}

/* 状态栏 */
.http-client__status {
  flex-shrink: 0;
}

.http-client__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.http-client__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.http-client__status-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.http-client__status-success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.http-client__status-idle {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* 请求区 & 响应区各占一半 */
.http-client__request,
.http-client__response {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.http-client__request :deep(.neu-card__body),
.http-client__response :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* URL 行 */
.http-client__url-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-shrink: 0;
}

.http-client__method {
  width: 120px;
  flex-shrink: 0;
}

.http-client__url-input {
  flex: 1;
  min-width: 0;
}

/* Tabs */
.http-client__req-tabs,
.http-client__resp-tabs {
  flex-shrink: 0;
}

/* 请求内容区 */
.http-client__req-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Headers 列表 */
.http-client__headers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.http-client__headers::-webkit-scrollbar {
  display: none;
}

.http-client__header-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.http-client__header-key {
  width: 180px;
  flex-shrink: 0;
}

.http-client__header-value {
  flex: 1;
  min-width: 0;
}

/* Body 输入 */
.http-client__body-input {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.http-client__body-textarea {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.http-client__body-textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.http-client__body-textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.http-client__body-textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

/* 响应内容区 */
.http-client__resp-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.http-client__resp-body,
.http-client__resp-headers {
  flex: 1;
  min-height: 0;
}

.http-client__body-display {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.http-client__body-display::-webkit-scrollbar {
  display: none;
}

.http-client__body-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-primary);
}

.http-client__headers-list {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-md);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.http-client__headers-list::-webkit-scrollbar {
  display: none;
}

.http-client__resp-header-row {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--neu-bg-dark);
}

.http-client__resp-header-key {
  color: var(--color-primary);
  font-weight: 500;
  flex-shrink: 0;
}

.http-client__resp-header-sep {
  color: var(--text-muted);
  flex-shrink: 0;
}

.http-client__resp-header-value {
  color: var(--text-secondary);
  word-break: break-all;
}

.http-client__placeholder {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

/* JSON 语法高亮 */
.http-client__body-pre :deep(.json-key) {
  color: var(--color-primary);
}

.http-client__body-pre :deep(.json-string) {
  color: var(--color-success);
}

.http-client__body-pre :deep(.json-number) {
  color: var(--color-accent);
}

.http-client__body-pre :deep(.json-bool) {
  color: var(--color-secondary);
}
</style>
