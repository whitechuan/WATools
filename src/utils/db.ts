import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:watools.db')
    await runMigrations(db)
  }
  return db
}

async function runMigrations(db: Database) {
  // 用户设置表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // 操作历史表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tool_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_id TEXT NOT NULL,
      input TEXT NOT NULL,
      output TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // 工具偏好表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tool_preferences (
      tool_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (tool_id, key)
    )
  `)

  // 创建索引
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_history_tool ON tool_history(tool_id)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_history_time ON tool_history(created_at DESC)`)

  // 密码库相关表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vault_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS password_vault (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      username TEXT DEFAULT '',
      password_encrypted TEXT NOT NULL,
      nonce TEXT NOT NULL,
      url TEXT DEFAULT '',
      category TEXT DEFAULT '默认',
      tags TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_vault_category ON password_vault(category)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_vault_title ON password_vault(title)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_vault_updated ON password_vault(updated_at DESC)`)
}
