<template>
  <div class="asym-crypto">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="asym-crypto__status">
      <div
        class="asym-crypto__status-inner"
        :class="{
          'asym-crypto__status-error': error,
          'asym-crypto__status-success': !error && (keyPair || ciphertext || signature || verifyResult !== null),
          'asym-crypto__status-idle': !error && !keyPair && !ciphertext && !signature && verifyResult === null
        }"
      >
        <NeuTag v-if="!error && verifyResult !== null" :type="verifyResult ? 'success' : 'danger'">
          {{ verifyResult ? '✓ 签名验证通过' : '✗ 签名验证失败' }}
        </NeuTag>
        <NeuTag v-else-if="!error && (keyPair || ciphertext || signature)" type="success">✓ 操作完成</NeuTag>
        <span v-if="error" class="asym-crypto__error-msg">⚠ {{ error }}</span>
        <span v-if="!error && !keyPair && !ciphertext && !signature && verifyResult === null" class="asym-crypto__idle-text">
          🔐 RSA非对称加密工具 — 仅供开发测试使用，请勿用于生产环境密钥管理
        </span>
      </div>
    </NeuCard>

    <!-- Tab 切换 -->
    <div class="asym-crypto__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="asym-crypto__tab"
        :class="{ 'asym-crypto__tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="asym-crypto__content">
      <!-- 密钥生成 Tab -->
      <div v-show="activeTab === 'keygen'" class="asym-crypto__panel">
        <NeuCard title="RSA 密钥对生成" elevation="raised" class="asym-crypto__keygen-card">
          <div class="asym-crypto__keygen-options">
            <span class="asym-crypto__label">密钥长度:</span>
            <label class="asym-crypto__radio">
              <input type="radio" :value="2048" v-model="keySize" />
              <span>2048 bit</span>
            </label>
            <label class="asym-crypto__radio">
              <input type="radio" :value="4096" v-model="keySize" />
              <span>4096 bit</span>
            </label>
          </div>

          <div v-if="keyPair" class="asym-crypto__keypair-result">
            <div class="asym-crypto__pem-block">
              <div class="asym-crypto__pem-header">
                <span class="asym-crypto__pem-label">公钥 (PEM)</span>
                <CopyButton :content="keyPair.public_key_pem" />
              </div>
              <pre class="asym-crypto__pem-content neu-pressed">{{ keyPair.public_key_pem }}</pre>
            </div>
            <div class="asym-crypto__pem-block">
              <div class="asym-crypto__pem-header">
                <span class="asym-crypto__pem-label">私钥 (PEM)</span>
                <CopyButton :content="keyPair.private_key_pem" />
              </div>
              <pre class="asym-crypto__pem-content neu-pressed">{{ keyPair.private_key_pem }}</pre>
            </div>
          </div>

          <template #footer>
            <div class="asym-crypto__actions">
              <NeuButton type="primary" @click="generateKeyPair" :disabled="generating">
                {{ generating ? '⏳ 生成中...' : '🔑 生成密钥对' }}
              </NeuButton>
            </div>
          </template>
        </NeuCard>
      </div>

      <!-- 加密/解密 Tab -->
      <div v-show="activeTab === 'encrypt'" class="asym-crypto__panel">
        <div class="asym-crypto__columns">
          <!-- 加密区域 -->
          <NeuCard title="加密（公钥）" elevation="raised" class="asym-crypto__card">
            <NeuTextarea
              v-model="publicKeyPem"
              placeholder="粘贴RSA公钥 (PEM格式)..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <NeuTextarea
              v-model="plaintext"
              placeholder="输入要加密的明文..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <template #footer>
              <div class="asym-crypto__actions">
                <NeuButton type="primary" @click="encrypt">🔒 加密</NeuButton>
              </div>
            </template>
          </NeuCard>

          <!-- 解密区域 -->
          <NeuCard title="解密（私钥）" elevation="raised" class="asym-crypto__card">
            <NeuTextarea
              v-model="privateKeyPem"
              placeholder="粘贴RSA私钥 (PEM格式)..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <NeuTextarea
              v-model="ciphertext"
              placeholder="输入Base64编码的密文..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <template #footer>
              <div class="asym-crypto__actions">
                <NeuButton type="primary" @click="decrypt">🔓 解密</NeuButton>
              </div>
            </template>
          </NeuCard>
        </div>
      </div>

      <!-- 签名/验证 Tab -->
      <div v-show="activeTab === 'sign'" class="asym-crypto__panel">
        <div class="asym-crypto__columns">
          <!-- 签名区域 -->
          <NeuCard title="签名（私钥）" elevation="raised" class="asym-crypto__card">
            <NeuTextarea
              v-model="signMessage"
              placeholder="输入要签名的消息..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <NeuTextarea
              v-model="signPrivateKey"
              placeholder="粘贴RSA私钥 (PEM格式)..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <div v-if="signature" class="asym-crypto__result neu-pressed">
              <div class="asym-crypto__result-item">
                <span class="asym-crypto__result-label">签名:</span>
                <code class="asym-crypto__result-value">{{ signature }}</code>
                <CopyButton :content="signature" />
              </div>
            </div>
            <template #footer>
              <div class="asym-crypto__actions">
                <NeuButton type="primary" @click="sign">✍️ 签名</NeuButton>
              </div>
            </template>
          </NeuCard>

          <!-- 验证区域 -->
          <NeuCard title="验证（公钥）" elevation="raised" class="asym-crypto__card">
            <NeuTextarea
              v-model="verifyMessage"
              placeholder="输入原始消息..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <NeuTextarea
              v-model="verifySignature"
              placeholder="输入Base64编码的签名..."
              :show-count="true"
              class="asym-crypto__textarea asym-crypto__textarea--short"
            />
            <NeuTextarea
              v-model="verifyPublicKey"
              placeholder="粘贴RSA公钥 (PEM格式)..."
              :show-count="true"
              class="asym-crypto__textarea"
            />
            <template #footer>
              <div class="asym-crypto__actions">
                <NeuButton type="primary" @click="verify">✅ 验证</NeuButton>
              </div>
            </template>
          </NeuCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsymmetricCrypto } from '@/composables/useAsymmetricCrypto'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'AsymmetricCryptoView' })

const tabs = [
  { key: 'keygen', label: '密钥生成', icon: '🔑' },
  { key: 'encrypt', label: '加密/解密', icon: '🔒' },
  { key: 'sign', label: '签名/验证', icon: '✍️' },
]

const activeTab = ref('keygen')

const {
  keySize, keyPair, generating,
  publicKeyPem, privateKeyPem, plaintext, ciphertext,
  signMessage, signPrivateKey, signature,
  verifyMessage, verifySignature, verifyPublicKey, verifyResult,
  error, generateKeyPair, encrypt, decrypt, sign, verify
} = useAsymmetricCrypto()
</script>

<style scoped>
.asym-crypto {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.asym-crypto__tabs {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.asym-crypto__tab {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--neu-radius-sm);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.asym-crypto__tab:hover {
  color: var(--text-primary);
}

.asym-crypto__tab--active {
  box-shadow: var(--neu-shadow-pressed);
  color: var(--color-primary);
  font-weight: 600;
}

.asym-crypto__content {
  flex: 1;
  min-height: 0;
}

.asym-crypto__panel {
  height: 100%;
}

.asym-crypto__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  height: 100%;
}

@media (max-width: 768px) {
  .asym-crypto__columns {
    grid-template-columns: 1fr;
  }
}

.asym-crypto__card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.asym-crypto__card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.asym-crypto__card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

.asym-crypto__keygen-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.asym-crypto__keygen-card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.asym-crypto__keygen-options {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.asym-crypto__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.asym-crypto__radio {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.asym-crypto__radio input[type="radio"] {
  accent-color: var(--color-primary);
}

.asym-crypto__keypair-result {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.asym-crypto__keypair-result::-webkit-scrollbar {
  display: none;
}

.asym-crypto__pem-block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.asym-crypto__pem-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.asym-crypto__pem-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: 500;
}

.asym-crypto__pem-content {
  padding: var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.asym-crypto__pem-content::-webkit-scrollbar {
  display: none;
}

.asym-crypto__textarea {
  flex: 1;
  min-height: 60px;
  display: flex;
  flex-direction: column;
}

.asym-crypto__textarea--short {
  max-height: 80px;
}

.asym-crypto__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.asym-crypto__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.asym-crypto__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

.asym-crypto__result {
  flex-shrink: 0;
  padding: var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  max-height: 100px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.asym-crypto__result::-webkit-scrollbar {
  display: none;
}

.asym-crypto__result-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
}

.asym-crypto__result-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.asym-crypto__result-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  word-break: break-all;
  flex: 1;
}

.asym-crypto__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 状态栏 */
.asym-crypto__status {
  flex-shrink: 0;
}

.asym-crypto__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.asym-crypto__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asym-crypto__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.asym-crypto__status-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.asym-crypto__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.asym-crypto__status-idle {
  display: flex;
  align-items: center;
}

.asym-crypto__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
