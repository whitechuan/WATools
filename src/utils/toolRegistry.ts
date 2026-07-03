import type { ToolDescriptor } from '@/types/tools'

export const TOOL_REGISTRY: ToolDescriptor[] = [
  { id: 'time-converter', name: '时间转换', icon: '🕐', path: '/tools/time-converter', description: '多种时间格式互相转换' },
  { id: 'json-formatter', name: 'JSON格式化', icon: '📋', path: '/tools/json-formatter', description: '格式化、压缩和验证JSON' },
  { id: 'jwt-parser', name: 'JWT解析', icon: '🔑', path: '/tools/jwt-parser', description: '解码和验证JWT令牌' },
]
