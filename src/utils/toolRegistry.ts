import type { ToolDescriptor, ToolCategoryMeta, ToolCategory } from '@/types/tools'

export const TOOL_CATEGORIES: ToolCategoryMeta[] = [
  { id: 'memo', label: '备忘录', icon: '📝', order: 1 },
  { id: 'time', label: '时间/日期', icon: '🕐', order: 2 },
  { id: 'format', label: '数据格式', icon: '📋', order: 3 },
  { id: 'encoding', label: '编码/解码', icon: '🔤', order: 4 },
  { id: 'text', label: '文本处理', icon: '📝', order: 5 },
  { id: 'generator', label: '生成器', icon: '🆔', order: 6 },
  { id: 'network', label: '网络', icon: '🌐', order: 7 },
  { id: 'security', label: '安全/加密', icon: '🔐', order: 8 },
  
]

export const TOOL_REGISTRY: ToolDescriptor[] = [
  // 备忘录
  { id: 'password-vault', name: '密码库', icon: '🔐', path: '/tools/password-vault', description: '本地加密密码管理器', category: 'memo' },
  // 时间/日期
  { id: 'time-converter', name: '时间转换', icon: '🕐', path: '/tools/time-converter', description: '多种时间格式互相转换', category: 'time' },
  { id: 'cron-parser', name: 'Cron解析器', icon: '⏲️', path: '/tools/cron-parser', description: '解析Cron表达式并查看执行时间', category: 'time' },
  // 数据格式
  { id: 'json-formatter', name: 'JSON格式化', icon: '📋', path: '/tools/json-formatter', description: '格式化、压缩和验证JSON', category: 'format' },
  { id: 'jwt-parser', name: 'JWT解析', icon: '🔑', path: '/tools/jwt-parser', description: '解码和验证JWT令牌', category: 'format' },
  // 编码/解码
  { id: 'base64-codec', name: 'Base64编解码', icon: '🔤', path: '/tools/base64-codec', description: 'Base64编码和解码转换', category: 'encoding' },
  { id: 'url-codec', name: 'URL编解码', icon: '🔗', path: '/tools/url-codec', description: 'URL编码、解码和解析', category: 'encoding' },
  { id: 'hash-calculator', name: 'Hash计算器', icon: '#️⃣', path: '/tools/hash-calculator', description: '计算文本的MD5/SHA哈希值', category: 'encoding' },
  { id: 'html-entity', name: 'HTML实体编解码', icon: '🏷️', path: '/tools/html-entity', description: 'HTML特殊字符与实体互相转换', category: 'encoding' },
  { id: 'base32-codec', name: 'Base32编解码', icon: '🔡', path: '/tools/base32-codec', description: 'Base32编码和解码转换', category: 'encoding' },
  // 文本处理
  { id: 'regex-tester', name: '正则测试器', icon: '🎯', path: '/tools/regex-tester', description: '测试正则表达式匹配和捕获组', category: 'text' },
  { id: 'text-diff', name: '文本Diff', icon: '📝', path: '/tools/text-diff', description: '对比两段文本的差异', category: 'text' },
  { id: 'text-stats', name: '文本统计/处理', icon: '📊', path: '/tools/text-stats', description: '字数统计 + 大小写转换 + 去重/排序/去空行', category: 'text' },
  { id: 'ascii-convert', name: 'ASCII转换', icon: '🔢', path: '/tools/ascii-convert', description: 'ASCII码与文本互相转换', category: 'text' },
  { id: 'markdown-preview', name: 'Markdown预览', icon: '📖', path: '/tools/markdown-preview', description: '实时编辑预览Markdown，导出HTML', category: 'text' },
  { id: 'number-base', name: '进制转换', icon: '🧮', path: '/tools/number-base', description: '二/八/十/十六进制互转', category: 'encoding' },
  // 生成器
  { id: 'uuid-generator', name: 'UUID生成器', icon: '🆔', path: '/tools/uuid-generator', description: '生成UUID v4/v7标识符', category: 'generator' },
  { id: 'color-converter', name: '颜色转换', icon: '🎨', path: '/tools/color-converter', description: 'HEX/RGB/HSL颜色格式互相转换', category: 'generator' },
  // 网络
  { id: 'http-client', name: 'HTTP请求器', icon: '🌐', path: '/tools/http-client', description: '发送HTTP请求并查看响应', category: 'network' },
  // 安全/加密
  { id: 'hex-codec', name: 'Hex编解码', icon: '💾', path: '/tools/hex-codec', description: 'Hex与文本/二进制互转', category: 'security' },
  { id: 'hmac-calculator', name: 'HMAC计算', icon: '🔏', path: '/tools/hmac-calculator', description: '计算HMAC-SHA256/SHA512', category: 'security' },
  { id: 'symmetric-crypto', name: '对称加密', icon: '🔒', path: '/tools/symmetric-crypto', description: 'AES-GCM/ChaCha20加密解密', category: 'security' },
  { id: 'asymmetric-crypto', name: 'RSA加密', icon: '🔑', path: '/tools/asymmetric-crypto', description: 'RSA密钥生成、加解密与签名', category: 'security' },
  { id: 'password-generator', name: '密码生成器', icon: '🛡️', path: '/tools/password-generator', description: '密码强度检测与随机密码生成', category: 'security' },
]

export interface ToolGroup {
  category: ToolCategoryMeta
  tools: ToolDescriptor[]
}

export function getGroupedTools(): ToolGroup[] {
  const grouped = new Map<ToolCategory, ToolDescriptor[]>()

  TOOL_REGISTRY.forEach(tool => {
    if (!grouped.has(tool.category)) {
      grouped.set(tool.category, [])
    }
    grouped.get(tool.category)!.push(tool)
  })

  return TOOL_CATEGORIES
    .filter(cat => grouped.has(cat.id))
    .map(cat => ({ category: cat, tools: grouped.get(cat.id)! }))
}
