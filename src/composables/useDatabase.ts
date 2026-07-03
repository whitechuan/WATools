import { getDatabase } from '@/utils/db'

export interface HistoryEntry {
  id: number
  tool_id: string
  input: string
  output: string | null
  created_at: string
}

export function useDatabase() {
  // ===== 用户设置 =====
  async function getSetting(key: string, defaultValue?: string): Promise<string | null> {
    const db = await getDatabase()
    const result = await db.select<{ value: string }[]>(
      'SELECT value FROM user_settings WHERE key = $1', [key]
    )
    return result.length > 0 ? result[0].value : (defaultValue ?? null)
  }

  async function setSetting(key: string, value: string): Promise<void> {
    const db = await getDatabase()
    await db.execute(
      `INSERT INTO user_settings (key, value, updated_at) VALUES ($1, $2, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = datetime('now')`,
      [key, value]
    )
  }

  // ===== 工具偏好 =====
  async function getToolPreference(toolId: string, key: string): Promise<string | null> {
    const db = await getDatabase()
    const result = await db.select<{ value: string }[]>(
      'SELECT value FROM tool_preferences WHERE tool_id = $1 AND key = $2',
      [toolId, key]
    )
    return result.length > 0 ? result[0].value : null
  }

  async function setToolPreference(toolId: string, key: string, value: string): Promise<void> {
    const db = await getDatabase()
    await db.execute(
      `INSERT INTO tool_preferences (tool_id, key, value) VALUES ($1, $2, $3)
       ON CONFLICT(tool_id, key) DO UPDATE SET value = $3`,
      [toolId, key, value]
    )
  }

  // ===== 操作历史 =====
  async function addHistory(toolId: string, input: string, output?: string): Promise<void> {
    const db = await getDatabase()
    await db.execute(
      'INSERT INTO tool_history (tool_id, input, output) VALUES ($1, $2, $3)',
      [toolId, input, output ?? null]
    )
    // 保留最近50条
    await db.execute(
      `DELETE FROM tool_history WHERE tool_id = $1 AND id NOT IN (
        SELECT id FROM tool_history WHERE tool_id = $1 ORDER BY created_at DESC LIMIT 50
      )`, [toolId]
    )
  }

  async function getHistory(toolId: string, limit = 20): Promise<HistoryEntry[]> {
    const db = await getDatabase()
    return await db.select<HistoryEntry[]>(
      'SELECT * FROM tool_history WHERE tool_id = $1 ORDER BY created_at DESC LIMIT $2',
      [toolId, limit]
    )
  }

  async function clearHistory(toolId?: string): Promise<void> {
    const db = await getDatabase()
    if (toolId) {
      await db.execute('DELETE FROM tool_history WHERE tool_id = $1', [toolId])
    } else {
      await db.execute('DELETE FROM tool_history')
    }
  }

  return {
    getSetting, setSetting,
    getToolPreference, setToolPreference,
    addHistory, getHistory, clearHistory
  }
}
