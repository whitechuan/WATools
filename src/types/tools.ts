// 时间转换结果
export interface TimeConversionResult {
  unix_seconds: number
  unix_millis: number
  iso8601: string
  rfc2822: string
  local_time: string
  utc_time: string
  relative: string
}

// JSON验证结果
export interface JsonValidationResult {
  valid: boolean
  error_message: string | null
  error_position: number | null
  suggestions: string[]
}

// JSON格式化结果
export interface JsonFormatResult {
  formatted: string
  stats: JsonStats
}

export interface JsonStats {
  lines: number
  keys: number
  max_depth: number
  size_bytes: number
}

// JWT解码结果
export interface JwtDecodeResult {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
  is_expired: boolean
  expires_at: string | null
  issued_at: string | null
}

// JWT验证结果
export interface JwtVerifyResult {
  valid: boolean
  error: string | null
}

// 历史记录条目
export interface HistoryEntry {
  id: number
  tool_id: string
  input: string
  output: string | null
  created_at: string
}

// 工具描述
export interface ToolDescriptor {
  id: string
  name: string
  icon: string
  path: string
  description: string
}
