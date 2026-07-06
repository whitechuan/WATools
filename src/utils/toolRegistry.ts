import type { ToolDescriptor } from '@/types/tools'

export const TOOL_REGISTRY: ToolDescriptor[] = [
  { id: 'time-converter', name: '时间转换', icon: '🕐', path: '/tools/time-converter', description: '多种时间格式互相转换' },
  { id: 'json-formatter', name: 'JSON格式化', icon: '📋', path: '/tools/json-formatter', description: '格式化、压缩和验证JSON' },
  { id: 'jwt-parser', name: 'JWT解析', icon: '🔑', path: '/tools/jwt-parser', description: '解码和验证JWT令牌' },
  { id: 'url-codec', name: 'URL编解码', icon: '🔗', path: '/tools/url-codec', description: 'URL编码、解码和解析' },
  { id: 'hash-calculator', name: 'Hash计算器', icon: '#️⃣', path: '/tools/hash-calculator', description: '计算文本的MD5/SHA哈希值' },
  { id: 'uuid-generator', name: 'UUID生成器', icon: '🆔', path: '/tools/uuid-generator', description: '生成UUID v4/v7标识符' },
  { id: 'color-converter', name: '颜色转换', icon: '🎨', path: '/tools/color-converter', description: 'HEX/RGB/HSL颜色格式互相转换' },
  { id: 'regex-tester', name: '正则测试器', icon: '🎯', path: '/tools/regex-tester', description: '测试正则表达式匹配和捕获组' },
  { id: 'text-diff', name: '文本Diff', icon: '📝', path: '/tools/text-diff', description: '对比两段文本的差异' },
  { id: 'http-client', name: 'HTTP请求器', icon: '🌐', path: '/tools/http-client', description: '发送HTTP请求并查看响应' },
  { id: 'base64-codec', name: 'Base64编解码', icon: '🔤', path: '/tools/base64-codec', description: 'Base64编码和解码转换' },
  { id: 'cron-parser', name: 'Cron解析器', icon: '⏲️', path: '/tools/cron-parser', description: '解析Cron表达式并查看执行时间' },
]
