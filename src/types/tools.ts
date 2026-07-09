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

// 工具分类
export type ToolCategory = 'time' | 'format' | 'encoding' | 'text' | 'generator' | 'network'

export interface ToolCategoryMeta {
  id: ToolCategory
  label: string
  icon: string
  order: number
}

// 工具描述
export interface ToolDescriptor {
  id: string
  name: string
  icon: string
  path: string
  description: string
  category: ToolCategory
}

// ===== Base64 编解码 =====
export interface Base64Result {
  output: string
  size_before: number
  size_after: number
}

// ===== Hash 计算器 =====
export interface HashResult {
  md5: string
  sha1: string
  sha256: string
  sha512: string
}

// ===== URL 编解码 =====
export interface UrlEncodeResult {
  encoded: string
}

export interface UrlDecodeResult {
  decoded: string
}

export interface UrlParseResult {
  scheme: string
  host: string
  port: string
  path: string
  query: string
  fragment: string
  query_params: Array<{ key: string; value: string }>
}

// ===== UUID 生成器 =====
export interface UuidResult {
  values: string[]
  version: string
}

// ===== 正则测试器 =====
export interface RegexMatch {
  text: string
  start: number
  end: number
  groups: Array<{ name: string | null; value: string }>
}

export interface RegexResult {
  is_valid: boolean
  matches: RegexMatch[]
  match_count: number
  error: string | null
}

// ===== 颜色转换器 =====
export interface ColorResult {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  rgba: string
  hsla: string
}

// ===== Cron 解析器 =====
export interface CronResult {
  is_valid: boolean
  description: string
  next_runs: string[]
  error: string | null
}

// ===== 文本 Diff =====
export interface DiffLine {
  tag: 'equal' | 'insert' | 'delete'
  old_index: number | null
  new_index: number | null
  value: string
}

export interface DiffResult {
  lines: DiffLine[]
  stats: { additions: number; deletions: number; unchanged: number }
}

// ===== HTTP 请求器 =====
export interface HttpHeader {
  key: string
  value: string
}

export interface HttpResponse {
  status: number
  status_text: string
  headers: HttpHeader[]
  body: string
  elapsed_ms: number
  size_bytes: number
}

// ===== HTML实体编解码 =====
export interface HtmlEntityResult {
  output: string
}

// ===== Base32编解码 =====
export interface Base32Result {
  output: string
}

// ===== 文本统计 =====
export interface TextStatsResult {
  characters: number
  characters_no_space: number
  words: number
  lines: number
  paragraphs: number
  bytes: number
}

// ===== ASCII码转换 =====
export interface AsciiResult {
  output: string
}

// ===== 进制转换器 =====
export interface NumberBaseResult {
  binary: string
  octal: string
  decimal: string
  hex: string
}
