<template>
  <div class="password-vault-view" @click="resetActivity" @keydown="resetActivity">
    <!-- 锁定状态 -->
    <div v-if="isLocked" class="password-vault-view__lock-screen">
      <!-- 未初始化：设置主密码 -->
      <NeuCard v-if="!isInitialized" title="🔐 设置主密码" elevation="raised" class="password-vault-view__lock-card">
        <div class="password-vault-view__form">
          <NeuInput
            v-model="newPassword"
            type="password"
            placeholder="设置主密码（至少8位）"
            class="password-vault-view__input"
          />
          <NeuInput
            v-model="confirmPassword"
            type="password"
            placeholder="确认主密码"
            class="password-vault-view__input"
          />
          <!-- 强度指示 -->
          <div v-if="initStrength" class="password-vault-view__strength">
            <div class="password-vault-view__strength-label">
              强度: {{ scoreLabels[initStrength.score] }}
            </div>
            <div class="password-vault-view__progress-bar">
              <div
                class="password-vault-view__progress-fill"
                :style="{ width: ((initStrength.score + 1) / 5 * 100) + '%', backgroundColor: scoreColors[initStrength.score] }"
              ></div>
            </div>
          </div>
          <div v-if="error" class="password-vault-view__error">{{ error }}</div>
        </div>
        <template #footer>
          <div class="password-vault-view__actions">
            <NeuButton type="primary" :loading="loading" @click="handleInit">设置主密码</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 已初始化：解锁 -->
      <NeuCard v-else title="🔒 密码库已锁定" elevation="raised" class="password-vault-view__lock-card">
        <div class="password-vault-view__form">
          <NeuInput
            v-model="unlockPassword"
            type="password"
            placeholder="输入主密码解锁..."
            class="password-vault-view__input"
            @keyup.enter="handleUnlock"
          />
          <div v-if="error" class="password-vault-view__error">{{ error }}</div>
        </div>
        <template #footer>
          <div class="password-vault-view__actions">
            <NeuButton type="primary" :loading="loading" @click="handleUnlock">解锁</NeuButton>
          </div>
        </template>
      </NeuCard>

      <div class="password-vault-view__lock-hint">
        主密码用于加密所有密码记录，遗忘后无法恢复
      </div>
    </div>

    <!-- 解锁状态 -->
    <template v-else>
      <!-- 顶部工具栏 -->
      <NeuCard elevation="flat" class="password-vault-view__toolbar">
        <div class="password-vault-view__toolbar-inner">
          <div class="password-vault-view__toolbar-left">
            <NeuInput
              v-model="searchQuery"
              placeholder="搜索标题、用户名、URL..."
              class="password-vault-view__search"
            />
            <NeuSelect
              v-model="filterCategory"
              :options="categoryOptions"
              placeholder="全部分类"
              class="password-vault-view__filter"
            />
          </div>
          <div class="password-vault-view__toolbar-right">
            <span class="password-vault-view__count">{{ filteredEntries.length }} 条记录</span>
            <NeuButton size="sm" type="primary" @click="handleShowAdd">＋ 添加</NeuButton>
            <NeuButton size="sm" @click="lock">🔒 锁定</NeuButton>
          </div>
        </div>
      </NeuCard>

      <!-- 添加/编辑表单 -->
      <NeuCard
        v-if="showAddForm || editingEntry"
        :title="editingEntry ? '✏️ 编辑记录' : '＋ 添加记录'"
        elevation="raised"
        class="password-vault-view__form-card"
      >
        <div class="password-vault-view__entry-form">
          <div class="password-vault-view__form-row">
            <NeuInput v-model="formData.title" placeholder="标题 *" class="password-vault-view__input" />
            <NeuInput v-model="formData.username" placeholder="用户名" class="password-vault-view__input" />
          </div>
          <div class="password-vault-view__form-row">
            <div class="password-vault-view__password-field">
              <NeuInput
                v-model="formData.password"
                :type="showFormPassword ? 'text' : 'password'"
                placeholder="密码 *"
                class="password-vault-view__input"
              />
              <button class="password-vault-view__toggle-btn" @click="showFormPassword = !showFormPassword">
                {{ showFormPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <NeuInput v-model="formData.url" placeholder="URL" class="password-vault-view__input" />
          </div>
          <!-- 密码强度条 -->
          <div v-if="formStrength" class="password-vault-view__strength">
            <div class="password-vault-view__strength-label">
              强度: {{ scoreLabels[formStrength.score] }}
            </div>
            <div class="password-vault-view__progress-bar">
              <div
                class="password-vault-view__progress-fill"
                :style="{ width: ((formStrength.score + 1) / 5 * 100) + '%', backgroundColor: scoreColors[formStrength.score] }"
              ></div>
            </div>
          </div>
          <div class="password-vault-view__form-row">
            <NeuInput v-model="formData.category" placeholder="分类（如：社交、工作）" class="password-vault-view__input" />
            <NeuInput v-model="formData.tagsInput" placeholder="标签（逗号分隔）" class="password-vault-view__input" />
          </div>
          <NeuInput v-model="formData.notes" placeholder="备注" class="password-vault-view__input password-vault-view__input--full" />
        </div>
        <template #footer>
          <div class="password-vault-view__actions">
            <NeuButton type="primary" :loading="loading" @click="handleSave">保存</NeuButton>
            <NeuButton @click="handleCancelForm">取消</NeuButton>
          </div>
        </template>
      </NeuCard>

      <!-- 密码列表 -->
      <div class="password-vault-view__list">
        <div v-if="filteredEntries.length === 0" class="password-vault-view__empty">
          <span>📭 暂无密码记录</span>
          <span class="password-vault-view__empty-hint">点击"添加"按钮创建第一条记录</span>
        </div>
        <NeuCard
          v-for="entry in filteredEntries"
          :key="entry.id"
          elevation="raised"
          class="password-vault-view__entry-card"
        >
          <div class="password-vault-view__entry">
            <div class="password-vault-view__entry-header">
              <span class="password-vault-view__entry-title">{{ entry.title }}</span>
              <span class="password-vault-view__entry-category">{{ entry.category }}</span>
            </div>
            <div class="password-vault-view__entry-username">
              <span class="password-vault-view__field-label">用户名:</span>
              {{ entry.username || '-' }}
            </div>
            <div class="password-vault-view__entry-password">
              <span class="password-vault-view__field-label">密码:</span>
              <span class="password-vault-view__password-value">
                {{ visiblePasswords[entry.id] ? entry.password : '●●●●●●●●' }}
              </span>
            </div>
            <div v-if="entry.url" class="password-vault-view__entry-url">
              <span class="password-vault-view__field-label">URL:</span>
              {{ entry.url }}
            </div>
            <div class="password-vault-view__entry-actions">
              <button class="password-vault-view__icon-btn" @click="togglePassword(entry.id)" :title="visiblePasswords[entry.id] ? '隐藏' : '显示'">
                {{ visiblePasswords[entry.id] ? '🙈' : '👁️' }}
              </button>
              <button class="password-vault-view__icon-btn" @click="handleCopy(entry.password)" title="复制密码">
                📋
              </button>
              <button class="password-vault-view__icon-btn" @click="handleEdit(entry)" title="编辑">
                ✏️
              </button>
              <button class="password-vault-view__icon-btn password-vault-view__icon-btn--danger" @click="handleDelete(entry.id)" title="删除">
                🗑️
              </button>
            </div>
          </div>
        </NeuCard>
      </div>

      <!-- 复制提示 -->
      <transition name="fade">
        <div v-if="showCopied" class="password-vault-view__toast">已复制（15秒后自动清空剪贴板）</div>
      </transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import NeuCard from '@/components/neu/NeuCard.vue'
import NeuButton from '@/components/neu/NeuButton.vue'
import NeuInput from '@/components/neu/NeuInput.vue'
import NeuSelect from '@/components/neu/NeuSelect.vue'
import { usePasswordVault } from '@/composables/usePasswordVault'
import type { VaultEntry, PasswordStrengthResult } from '@/types/tools'

defineOptions({ name: 'PasswordVaultView' })

const {
  isLocked, isInitialized, filteredEntries, searchQuery, filterCategory,
  categories, showAddForm, editingEntry, error, loading,
  initVault, unlock, lock, addEntry, updateEntry,
  deleteEntry, checkStrength, copyPassword, resetActivity,
} = usePasswordVault()

// 本地状态
const newPassword = ref('')
const confirmPassword = ref('')
const unlockPassword = ref('')
const showFormPassword = ref(false)
const showCopied = ref(false)
const visiblePasswords = ref<Record<number, boolean>>({})
const initStrength = ref<PasswordStrengthResult | null>(null)
const formStrength = ref<PasswordStrengthResult | null>(null)

const scoreLabels = ['极弱', '弱', '一般', '强', '极强']
const scoreColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

const formData = reactive({
  title: '',
  username: '',
  password: '',
  url: '',
  category: '',
  tagsInput: '',
  notes: '',
})

const categoryOptions = computed(() => {
  const opts = [{ label: '全部分类', value: '' }]
  categories.value.forEach(c => opts.push({ label: c, value: c }))
  return opts
})

// 防抖搜索
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // searchQuery 已直接绑定 computed
  }, 300)
})

// 监听设置密码强度
let initStrengthTimer: ReturnType<typeof setTimeout> | null = null
watch(newPassword, (val) => {
  if (initStrengthTimer) clearTimeout(initStrengthTimer)
  initStrengthTimer = setTimeout(async () => {
    initStrength.value = await checkStrength(val)
  }, 300)
})

// 监听表单密码强度
let formStrengthTimer: ReturnType<typeof setTimeout> | null = null
watch(() => formData.password, (val) => {
  if (formStrengthTimer) clearTimeout(formStrengthTimer)
  formStrengthTimer = setTimeout(async () => {
    formStrength.value = await checkStrength(val)
  }, 300)
})

// 设置主密码
async function handleInit() {
  if (newPassword.value.length < 8) {
    error.value = '主密码至少需要8个字符'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次密码输入不一致'
    return
  }
  await initVault(newPassword.value)
  newPassword.value = ''
  confirmPassword.value = ''
}

// 解锁
async function handleUnlock() {
  if (!unlockPassword.value) {
    error.value = '请输入主密码'
    return
  }
  await unlock(unlockPassword.value)
  unlockPassword.value = ''
}

// 显示添加表单
function handleShowAdd() {
  resetFormData()
  editingEntry.value = null
  showAddForm.value = true
  showFormPassword.value = false
  formStrength.value = null
}

// 编辑
function handleEdit(entry: VaultEntry) {
  formData.title = entry.title
  formData.username = entry.username
  formData.password = entry.password
  formData.url = entry.url
  formData.category = entry.category
  formData.tagsInput = entry.tags.join(', ')
  formData.notes = entry.notes
  editingEntry.value = entry
  showAddForm.value = false
  showFormPassword.value = false
}

// 保存
async function handleSave() {
  if (!formData.title.trim()) {
    error.value = '标题不能为空'
    return
  }
  if (!formData.password.trim()) {
    error.value = '密码不能为空'
    return
  }

  const data = {
    title: formData.title.trim(),
    username: formData.username.trim(),
    password: formData.password,
    url: formData.url.trim(),
    category: formData.category.trim() || '默认',
    tags: formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    notes: formData.notes.trim(),
  }

  if (editingEntry.value) {
    await updateEntry(editingEntry.value.id, data)
  } else {
    await addEntry(data)
  }
  resetFormData()
}

// 取消表单
function handleCancelForm() {
  showAddForm.value = false
  editingEntry.value = null
  resetFormData()
  error.value = ''
}

function resetFormData() {
  formData.title = ''
  formData.username = ''
  formData.password = ''
  formData.url = ''
  formData.category = ''
  formData.tagsInput = ''
  formData.notes = ''
  formStrength.value = null
}

// 显示/隐藏密码
function togglePassword(id: number) {
  visiblePasswords.value[id] = !visiblePasswords.value[id]
  resetActivity()
}

// 复制密码
async function handleCopy(password: string) {
  await copyPassword(password)
  showCopied.value = true
  setTimeout(() => { showCopied.value = false }, 2000)
}

// 删除
async function handleDelete(id: number) {
  if (confirm('确定要删除这条记录吗？删除后无法恢复。')) {
    await deleteEntry(id)
  }
}
</script>

<style scoped>
.password-vault-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

/* 锁定屏 */
.password-vault-view__lock-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: var(--spacing-lg);
}

.password-vault-view__lock-card {
  width: 100%;
  max-width: 400px;
}

.password-vault-view__lock-hint {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-align: center;
}

/* 表单 */
.password-vault-view__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.password-vault-view__error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.password-vault-view__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 工具栏 */
.password-vault-view__toolbar {
  flex-shrink: 0;
}

.password-vault-view__toolbar :deep(.neu-card__body) {
  padding: var(--spacing-sm) var(--spacing-md);
}

.password-vault-view__toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.password-vault-view__toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 0;
}

.password-vault-view__search {
  flex: 1;
  min-width: 150px;
  max-width: 280px;
}

.password-vault-view__filter {
  min-width: 120px;
}

.password-vault-view__toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.password-vault-view__count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

/* 表单卡片 */
.password-vault-view__form-card {
  flex-shrink: 0;
}

.password-vault-view__entry-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.password-vault-view__form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

@media (max-width: 600px) {
  .password-vault-view__form-row {
    grid-template-columns: 1fr;
  }
}

.password-vault-view__password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-vault-view__password-field .password-vault-view__input {
  width: 100%;
  padding-right: 36px;
}

.password-vault-view__toggle-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px;
}

.password-vault-view__input {
  width: 100%;
}

.password-vault-view__input--full {
  grid-column: 1 / -1;
}

/* 强度条 */
.password-vault-view__strength {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.password-vault-view__strength-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.password-vault-view__progress-bar {
  height: 6px;
  background: var(--neu-bg);
  border-radius: 3px;
  box-shadow: var(--neu-shadow-pressed);
  overflow: hidden;
}

.password-vault-view__progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

/* 密码列表 */
.password-vault-view__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.password-vault-view__list::-webkit-scrollbar {
  display: none;
}

/* 空状态 */
.password-vault-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
  gap: var(--spacing-sm);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.password-vault-view__empty-hint {
  font-size: var(--font-size-xs);
}

/* 条目卡片 */
.password-vault-view__entry-card {
  flex-shrink: 0;
}

.password-vault-view__entry-card :deep(.neu-card__body) {
  padding: var(--spacing-sm) var(--spacing-md);
}

.password-vault-view__entry {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.password-vault-view__entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.password-vault-view__entry-title {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.password-vault-view__entry-category {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 108, 99, 255), 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.password-vault-view__entry-username,
.password-vault-view__entry-password,
.password-vault-view__entry-url {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.password-vault-view__field-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-width: 48px;
}

.password-vault-view__password-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  letter-spacing: 1px;
}

.password-vault-view__entry-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  border-top: 1px solid rgba(var(--color-primary-rgb, 108, 99, 255), 0.08);
}

.password-vault-view__icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: var(--neu-radius-sm);
  transition: background-color var(--transition-fast);
}

.password-vault-view__icon-btn:hover {
  background: rgba(var(--color-primary-rgb, 108, 99, 255), 0.08);
}

.password-vault-view__icon-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 复制提示 */
.password-vault-view__toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-raised);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--neu-radius-lg);
  font-size: var(--font-size-sm);
  color: var(--color-success);
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
