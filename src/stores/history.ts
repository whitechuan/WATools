import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import { getDatabase } from '@/utils/db'
import type { HistoryEntry } from '@/composables/useDatabase'

export const useHistoryStore = defineStore('history', () => {
  const { addHistory, getHistory, clearHistory } = useDatabase()

  const historyCount = ref(0)
  const recentHistory = ref<HistoryEntry[]>([])

  /** 加载历史条数统计 */
  async function loadHistoryCount() {
    try {
      const db = await getDatabase()
      const result = await db.select<{ cnt: number }[]>(
        'SELECT COUNT(*) as cnt FROM tool_history'
      )
      historyCount.value = result.length > 0 ? result[0].cnt : 0
    } catch {
      historyCount.value = 0
    }
  }

  /** 添加历史记录 */
  async function add(toolId: string, input: string, output?: string) {
    await addHistory(toolId, input, output)
    historyCount.value++
  }

  /** 获取某个工具的历史 */
  async function get(toolId: string, limit = 20): Promise<HistoryEntry[]> {
    const items = await getHistory(toolId, limit)
    recentHistory.value = items
    return items
  }

  /** 清空历史记录 */
  async function clear(toolId?: string) {
    await clearHistory(toolId)
    if (!toolId) {
      historyCount.value = 0
      recentHistory.value = []
    } else {
      await loadHistoryCount()
    }
  }

  return {
    historyCount,
    recentHistory,
    loadHistoryCount,
    add,
    get,
    clear,
  }
})
