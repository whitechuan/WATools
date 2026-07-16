<template>
  <div class="sym-crypto">
    <!-- 顶部状态栏 -->
    <NeuCard elevation="flat" class="sym-crypto__status">
      <div
        class="sym-crypto__status-inner"
        :class="{
          'sym-crypto__status-error': error,
          'sym-crypto__status-success': (encryptResult || decryptResult) && !error,
          'sym-crypto__status-idle': !encryptResult && !decryptResult && !error
        }"
      >
        <NeuTag v-if="(encryptResult || decryptResult) && !error" type="success">✓ 操作完成</NeuTag>
        <span v-if="encryptResult && !error" class="sym-crypto__stat-sep">│</span>
        <span v-if="encryptResult && !error" class="sym-crypto__stat">算法: {{ encryptResult.algorithm }}</span>
        <span v-if="error" class="sym-crypto__error-msg">⚠ {{ error }}</span>
        <span v-if="!encryptResult && !decryptResult && !error" class="sym-crypto__idle-text">🔒 对称加密工具 — 仅供开发测试使用</span>
      </div>
    </NeuCard>

    <!-- 主体双栏 -->
    <div class="sym-crypto__columns">
      <!-- 左栏 - 加密区域 -->
      <NeuCard title="加密" elevation="raised" class="sym-crypto__card">
        <!-- 算法选择 -->
        <div class="sym-crypto__algo-select">
          <label class="sym-crypto__radio">
            <input type="radio" value="aes" v-model="algorithm" />
            <span>AES-256-GCM</span>
          </label>
          <label class="sym-crypto__radio">
            <input type="radio" value="chacha20" v-model="algorithm" />
            <span>ChaCha20-Poly1305</span>
          </label>
        </div>

        <!-- 明文输入 -->
        <NeuTextarea
          v-model="plaintext"
          placeholder="输入要加密的明文..."
          :show-count="true"
          class="sym-crypto__textarea"
        />

        <!-- 密码输入 -->
        <NeuInput
          v-model="password"
          placeholder="输入加密密码..."
          type="password"
          class="sym-crypto__password"
        />

        <!-- 加密结果 -->
        <div v-if="encryptResult" class="sym-crypto__result neu-pressed">
          <div class="sym-crypto__result-item">
            <span class="sym-crypto__result-label">密文:</span>
            <code class="sym-crypto__result-value">{{ encryptResult.ciphertext }}</code>
            <CopyButton :content="encryptResult.ciphertext" />
          </div>
          <div class="sym-crypto__result-item">
            <span class="sym-crypto__result-label">Nonce:</span>
            <code class="sym-crypto__result-value">{{ encryptResult.nonce }}</code>
            <CopyButton :content="encryptResult.nonce" />
          </div>
        </div>

        <template #footer>
          <div class="sym-crypto__actions">
            <NeuButton type="primary" @click="encrypt">
              🔐 加密
            </NeuButton>
            <NeuButton type="danger" @click="clearEncrypt">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 右栏 - 解密区域 -->
      <NeuCard title="解密" elevation="raised" class="sym-crypto__card">
        <!-- 算法选择 -->
        <div class="sym-crypto__algo-select">
          <label class="sym-crypto__radio">
            <input type="radio" value="aes" v-model="decryptAlgorithm" />
            <span>AES-256-GCM</span>
          </label>
          <label class="sym-crypto__radio">
            <input type="radio" value="chacha20" v-model="decryptAlgorithm" />
            <span>ChaCha20-Poly1305</span>
          </label>
        </div>

        <!-- 密文输入 -->
        <NeuTextarea
          v-model="ciphertextInput"
          placeholder="输入Base64编码的密文..."
          :show-count="true"
          class="sym-crypto__textarea"
        />

        <!-- Nonce输入 -->
        <NeuInput
          v-model="nonceInput"
          placeholder="输入Base64编码的Nonce..."
          class="sym-crypto__nonce-input"
        />

        <!-- 密码输入 -->
        <NeuInput
          v-model="decryptPassword"
          placeholder="输入解密密码..."
          type="password"
          class="sym-crypto__password"
        />

        <!-- 解密结果 -->
        <div v-if="decryptResult" class="sym-crypto__result neu-pressed">
          <div class="sym-crypto__result-item">
            <span class="sym-crypto__result-label">明文:</span>
            <code class="sym-crypto__result-value">{{ decryptResult }}</code>
            <CopyButton :content="decryptResult" />
          </div>
        </div>

        <template #footer>
          <div class="sym-crypto__actions">
            <NeuButton type="primary" @click="decrypt">
              🔓 解密
            </NeuButton>
            <NeuButton type="danger" @click="clearDecrypt">
              🗑️ 清空
            </NeuButton>
          </div>
        </template>
      </NeuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSymmetricCrypto } from '@/composables/useSymmetricCrypto'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuTextarea from '@/components/neu/NeuTextarea.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuTag from '@/components/neu/NeuTag.vue'
import CopyButton from '@/components/common/CopyButton.vue'

defineOptions({ name: 'SymmetricCryptoView' })

const {
  plaintext, password, algorithm, encryptResult,
  ciphertextInput, nonceInput, decryptPassword, decryptAlgorithm, decryptResult,
  error, encrypt, decrypt, clearEncrypt, clearDecrypt
} = useSymmetricCrypto()
</script>

<style scoped>
.sym-crypto {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.sym-crypto__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .sym-crypto__columns {
    grid-template-columns: 1fr;
  }
}

.sym-crypto__card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.sym-crypto__card :deep(.neu-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sym-crypto__card :deep(.neu-card__footer) {
  flex-shrink: 0;
}

.sym-crypto__algo-select {
  display: flex;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.sym-crypto__radio {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.sym-crypto__radio input[type="radio"] {
  accent-color: var(--color-primary);
}

.sym-crypto__textarea {
  flex: 1;
  min-height: 80px;
  display: flex;
  flex-direction: column;
}

.sym-crypto__textarea :deep(.neu-textarea-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.sym-crypto__textarea :deep(.neu-textarea-field) {
  flex: 1;
  min-height: 0;
  resize: none;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sym-crypto__textarea :deep(.neu-textarea-field)::-webkit-scrollbar {
  display: none;
}

.sym-crypto__password,
.sym-crypto__nonce-input {
  flex-shrink: 0;
}

.sym-crypto__result {
  flex-shrink: 0;
  padding: var(--spacing-sm);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-pressed);
  background: var(--neu-bg);
  max-height: 140px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sym-crypto__result::-webkit-scrollbar {
  display: none;
}

.sym-crypto__result-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.sym-crypto__result-item:last-child {
  margin-bottom: 0;
}

.sym-crypto__result-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.sym-crypto__result-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  word-break: break-all;
  flex: 1;
}

.sym-crypto__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 状态栏 */
.sym-crypto__status {
  flex-shrink: 0;
}

.sym-crypto__status :deep(.neu-card__body) {
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.sym-crypto__status-inner {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sym-crypto__status-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sym-crypto__stat {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.sym-crypto__stat-sep {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.sym-crypto__status-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sym-crypto__error-msg {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.sym-crypto__status-idle {
  display: flex;
  align-items: center;
}

.sym-crypto__idle-text {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>
