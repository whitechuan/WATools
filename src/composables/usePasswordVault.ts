import { ref, computed, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { getDatabase } from '@/utils/db'
import type { VaultEntry, VaultEncryptedEntry, VaultEncryptResult, PasswordStrengthResult } from '@/types/tools'

export function usePasswordVault() {
  const isLocked = ref(true)
  const isInitialized = ref(false)
  const masterPassword = ref('')
  const masterPasswordHash = ref('')
  const entries = ref<VaultEntry[]>([])
  const searchQuery = ref('')
  const filterCategory = ref('')
  const categories = ref<string[]>([])
  const showAddForm = ref(false)
  const editingEntry = ref<VaultEntry | null>(null)
  const error = ref('')
  const loading = ref(false)
  const lastActivity = ref(Date.now())

  let autoLockTimer: ReturnType<typeof setInterval> | null = null

  // 计算过滤后的条目
  const filteredEntries = computed(() => {
    let result = entries.value
    if (filterCategory.value) {
      result = result.filter(e => e.category === filterCategory.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return result
  })

  // 检查是否已初始化（有主密码hash）
  async function checkInitialized() {
    try {
      const db = await getDatabase()
      const rows = await db.select<Array<{ value: string }>>(
        "SELECT value FROM vault_settings WHERE key = 'master_password_hash'"
      )
      if (rows.length > 0 && rows[0].value) {
        isInitialized.value = true
        masterPasswordHash.value = rows[0].value
      } else {
        isInitialized.value = false
      }
    } catch (e) {
      error.value = String(e)
    }
  }

  // 首次设置主密码
  async function initVault(password: string) {
    try {
      error.value = ''
      loading.value = true

      const hash = await invoke<string>('vault_set_master_password', { password })

      const db = await getDatabase()
      await db.execute(
        "INSERT OR REPLACE INTO vault_settings (key, value) VALUES ('master_password_hash', $1)",
        [hash]
      )

      masterPasswordHash.value = hash
      masterPassword.value = password
      isInitialized.value = true
      isLocked.value = false
      resetActivity()
      startAutoLock()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  // 解锁
  async function unlock(password: string) {
    try {
      error.value = ''
      loading.value = true

      const valid = await invoke<boolean>('vault_verify_master_password', {
        password,
        hash: masterPasswordHash.value,
      })

      if (!valid) {
        error.value = '主密码错误'
        return
      }

      masterPassword.value = password
      isLocked.value = false
      resetActivity()
      startAutoLock()
      await loadEntries()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  // 锁定
  function lock() {
    isLocked.value = true
    masterPassword.value = ''
    entries.value = []
    searchQuery.value = ''
    filterCategory.value = ''
    showAddForm.value = false
    editingEntry.value = null
    error.value = ''
    stopAutoLock()
  }

  // 加载所有条目（解密 password 字段）
  async function loadEntries() {
    try {
      loading.value = true
      const db = await getDatabase()
      const rows = await db.select<VaultEncryptedEntry[]>(
        'SELECT * FROM password_vault ORDER BY updated_at DESC'
      )

      const decrypted: VaultEntry[] = []
      for (const row of rows) {
        try {
          const plaintext = await invoke<string>('vault_decrypt_password', {
            ciphertext: row.password_encrypted,
            nonce: row.nonce,
            masterPassword: masterPassword.value,
          })
          decrypted.push({
            id: row.id,
            title: row.title,
            username: row.username,
            password: plaintext,
            url: row.url,
            category: row.category,
            tags: JSON.parse(row.tags || '[]'),
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
          })
        } catch {
          // 跳过无法解密的记录
        }
      }

      entries.value = decrypted
      updateCategories()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  // 更新分类列表
  function updateCategories() {
    const cats = new Set<string>()
    entries.value.forEach(e => {
      if (e.category) cats.add(e.category)
    })
    categories.value = Array.from(cats).sort()
  }

  // 添加条目
  async function addEntry(entry: {
    title: string
    username: string
    password: string
    url: string
    category: string
    tags: string[]
    notes: string
  }) {
    try {
      error.value = ''
      loading.value = true
      resetActivity()

      const encrypted = await invoke<VaultEncryptResult>('vault_encrypt_password', {
        plaintext: entry.password,
        masterPassword: masterPassword.value,
      })

      const db = await getDatabase()
      await db.execute(
        `INSERT INTO password_vault (title, username, password_encrypted, nonce, url, category, tags, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          entry.title,
          entry.username,
          encrypted.ciphertext,
          encrypted.nonce,
          entry.url,
          entry.category || '默认',
          JSON.stringify(entry.tags),
          entry.notes,
        ]
      )

      await loadEntries()
      showAddForm.value = false
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  // 更新条目
  async function updateEntry(id: number, entry: {
    title: string
    username: string
    password: string
    url: string
    category: string
    tags: string[]
    notes: string
  }) {
    try {
      error.value = ''
      loading.value = true
      resetActivity()

      const encrypted = await invoke<VaultEncryptResult>('vault_encrypt_password', {
        plaintext: entry.password,
        masterPassword: masterPassword.value,
      })

      const db = await getDatabase()
      await db.execute(
        `UPDATE password_vault
         SET title = $1, username = $2, password_encrypted = $3, nonce = $4,
             url = $5, category = $6, tags = $7, notes = $8, updated_at = datetime('now')
         WHERE id = $9`,
        [
          entry.title,
          entry.username,
          encrypted.ciphertext,
          encrypted.nonce,
          entry.url,
          entry.category || '默认',
          JSON.stringify(entry.tags),
          entry.notes,
          id,
        ]
      )

      await loadEntries()
      editingEntry.value = null
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  // 删除条目
  async function deleteEntry(id: number) {
    try {
      error.value = ''
      loading.value = true
      resetActivity()

      const db = await getDatabase()
      await db.execute('DELETE FROM password_vault WHERE id = $1', [id])

      await loadEntries()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  // 检测密码强度
  async function checkStrength(password: string): Promise<PasswordStrengthResult | null> {
    try {
      if (!password) return null
      return await invoke<PasswordStrengthResult>('vault_check_strength', { password })
    } catch {
      return null
    }
  }

  // 复制密码到剪贴板（15秒后清空）
  async function copyPassword(password: string) {
    try {
      await navigator.clipboard.writeText(password)
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText()
          if (current === password) {
            await navigator.clipboard.writeText('')
          }
        } catch {
          // 忽略清空失败
        }
      }, 15000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = password
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    resetActivity()
  }

  // 重置活动时间
  function resetActivity() {
    lastActivity.value = Date.now()
  }

  // 自动锁定逻辑
  function startAutoLock() {
    stopAutoLock()
    autoLockTimer = setInterval(() => {
      if (Date.now() - lastActivity.value > 30 * 60 * 1000) {
        lock()
      }
    }, 60000)
  }

  function stopAutoLock() {
    if (autoLockTimer) {
      clearInterval(autoLockTimer)
      autoLockTimer = null
    }
  }

  onMounted(async () => {
    await checkInitialized()
  })

  onUnmounted(() => {
    stopAutoLock()
  })

  return {
    isLocked,
    isInitialized,
    entries,
    filteredEntries,
    searchQuery,
    filterCategory,
    categories,
    showAddForm,
    editingEntry,
    error,
    loading,
    lastActivity,
    checkInitialized,
    initVault,
    unlock,
    lock,
    loadEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    checkStrength,
    copyPassword,
    resetActivity,
  }
}
