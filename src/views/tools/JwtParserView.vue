<template>
  <div class="jwt-parser-view">
    <!-- 区块1: 输入区 -->
    <NeuCard elevation="raised" title="🔑 JWT 解析工具">
      <NeuTextarea
        v-model="token"
        :rows="4"
        placeholder="粘贴 JWT Token..."
      />
      <div class="jwt-parser-view__actions">
        <NeuButton type="primary" :loading="isDecoding" @click="decodeJwt">
          解析
        </NeuButton>
        <NeuButton @click="clear">清空</NeuButton>
      </div>
      <p v-if="decodeError" class="jwt-parser-view__error">{{ decodeError }}</p>
    </NeuCard>

    <!-- 区块2: 状态区 -->
    <NeuCard v-if="decodeResult" elevation="flat">
      <div class="jwt-parser-view__status">
        <NeuTag type="success">Token 有效</NeuTag>
        <NeuTag v-if="decodeResult.is_expired" type="danger">
          已过期{{ decodeResult.expires_at ? ' · ' + decodeResult.expires_at : '' }}
        </NeuTag>
        <NeuTag v-else-if="decodeResult.expires_at" type="success">
          未过期 · {{ decodeResult.expires_at }}
        </NeuTag>
        <NeuTag v-else type="info">无过期信息</NeuTag>
      </div>
    </NeuCard>

    <!-- 区块3: 解码结果 -->
    <NeuCard v-if="decodeResult" elevation="raised">
      <NeuTabs v-model="activeTab" :tabs="tabOptions" />
      <div class="jwt-parser-view__tab-content">
        <!-- Header -->
        <div v-show="activeTab === 'header'">
          <div class="jwt-parser-view__code-block">
            <pre>{{ formatJson(decodeResult.header) }}</pre>
          </div>
          <div class="jwt-parser-view__copy-row">
            <CopyButton :content="formatJson(decodeResult.header)" />
          </div>
        </div>

        <!-- Payload -->
        <div v-show="activeTab === 'payload'">
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
        <div v-show="activeTab === 'signature'">
          <div class="jwt-parser-view__code-block">
            <pre>{{ decodeResult.signature }}</pre>
          </div>
          <div class="jwt-parser-view__copy-row">
            <CopyButton :content="decodeResult.signature" />
          </div>
        </div>
      </div>
    </NeuCard>

    <!-- 区块4: 签名验证 -->
    <NeuCard elevation="raised" title="签名验证（可选）">
      <div class="jwt-parser-view__verify-form">
        <div class="jwt-parser-view__form-row">
          <label class="jwt-parser-view__label">算法</label>
          <NeuSelect v-model="algorithm" :options="algorithmOptions" />
        </div>
        <div class="jwt-parser-view__form-row">
          <label class="jwt-parser-view__label">密钥</label>
          <div class="jwt-parser-view__secret-input">
            <NeuInput
              v-model="secret"
              :type="showSecret ? 'text' : 'password'"
              placeholder="输入密钥 Secret"
            />
            <NeuButton size="sm" @click="showSecret = !showSecret">
              {{ showSecret ? '隐藏' : '显示' }}
            </NeuButton>
          </div>
        </div>
        <NeuButton type="primary" :loading="isVerifying" @click="verifySignature">
          验证签名
        </NeuButton>
        <p v-if="verifyError" class="jwt-parser-view__error">{{ verifyError }}</p>
        <div v-if="verifyResult" class="jwt-parser-view__verify-result">
          <NeuTag v-if="verifyResult.valid" type="success">✓ 签名有效</NeuTag>
          <NeuTag v-else type="danger">✗ 签名无效</NeuTag>
          <p v-if="verifyResult.error" class="jwt-parser-view__verify-msg">{{ verifyResult.error }}</p>
        </div>
      </div>
    </NeuCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import NeuTabs from '@/components/neu/NeuTabs.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'
import { useJwtParse } from '@/composables/useJwtParse'
import type { TabOption } from '@/components/neu/NeuTabs.vue'
import type { SelectOption } from '@/components/neu/NeuSelect.vue'

defineOptions({ name: 'JwtParserView' })

const {
  token,
  decodeResult,
  decodeError,
  isDecoding,
  secret,
  algorithm,
  verifyResult,
  verifyError,
  isVerifying,
  decodeJwt,
  verifySignature,
  loadPreferences,
  clear,
} = useJwtParse()

const activeTab = ref('header')
const showSecret = ref(false)

const tabOptions: TabOption[] = [
  { key: 'header', label: 'Header' },
  { key: 'payload', label: 'Payload' },
  { key: 'signature', label: 'Signature' },
]

const algorithmOptions: SelectOption[] = [
  { label: 'HS256', value: 'HS256' },
  { label: 'HS384', value: 'HS384' },
  { label: 'HS512', value: 'HS512' },
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
  max-width: 800px;
  margin: 0 auto;
}

.jwt-parser-view__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.jwt-parser-view__error {
  margin-top: var(--spacing-sm);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.jwt-parser-view__status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.jwt-parser-view__tab-content {
  margin-top: var(--spacing-md);
}

.jwt-parser-view__code-block {
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  padding: var(--spacing-md);
  overflow-x: auto;
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
}

.jwt-parser-view__time-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
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

.jwt-parser-view__verify-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.jwt-parser-view__form-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.jwt-parser-view__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.jwt-parser-view__secret-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.jwt-parser-view__verify-result {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.jwt-parser-view__verify-msg {
  width: 100%;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
