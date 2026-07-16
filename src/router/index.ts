import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tools/time-converter'
    },
    {
      path: '/tools',
      children: [
        {
          path: 'time-converter',
          name: 'TimeConverter',
          component: () => import('@/views/tools/TimeConverterView.vue'),
          meta: { title: '时间转换', icon: '🕐' }
        },
        {
          path: 'json-formatter',
          name: 'JsonFormatter',
          component: () => import('@/views/tools/JsonFormatterView.vue'),
          meta: { title: 'JSON格式化', icon: '📋' }
        },
        {
          path: 'jwt-parser',
          name: 'JwtParser',
          component: () => import('@/views/tools/JwtParserView.vue'),
          meta: { title: 'JWT解析', icon: '🔑' }
        },
        {
          path: 'hash-calculator',
          name: 'HashCalculator',
          component: () => import('@/views/tools/HashCalculatorView.vue'),
          meta: { title: 'Hash计算器', icon: '#️⃣' }
        },
        {
          path: 'url-codec',
          name: 'UrlCodec',
          component: () => import('@/views/tools/UrlCodecView.vue'),
          meta: { title: 'URL编解码', icon: '🔗' }
        },
        {
          path: 'text-diff',
          name: 'TextDiff',
          component: () => import('@/views/tools/TextDiffView.vue'),
          meta: { title: '文本Diff', icon: '📝' }
        },
        {
          path: 'uuid-generator',
          name: 'UuidGenerator',
          component: () => import('@/views/tools/UuidGeneratorView.vue'),
          meta: { title: 'UUID生成器', icon: '🆔' }
        },
        {
          path: 'color-converter',
          name: 'ColorConverter',
          component: () => import('@/views/tools/ColorConverterView.vue'),
          meta: { title: '颜色转换', icon: '🎨' }
        },
        {
          path: 'regex-tester',
          name: 'RegexTester',
          component: () => import('@/views/tools/RegexTesterView.vue'),
          meta: { title: '正则测试器', icon: '🎯' }
        },
        {
          path: 'base64-codec',
          name: 'Base64Codec',
          component: () => import('@/views/tools/Base64CodecView.vue'),
          meta: { title: 'Base64编解码', icon: '🔤' }
        },
        {
          path: 'cron-parser',
          name: 'CronParser',
          component: () => import('@/views/tools/CronParserView.vue'),
          meta: { title: 'Cron解析器', icon: '⏲️' }
        },
        {
          path: 'http-client',
          name: 'HttpClient',
          component: () => import('@/views/tools/HttpClientView.vue'),
          meta: { title: 'HTTP请求器', icon: '🌐' }
        },
        {
          path: 'html-entity',
          name: 'HtmlEntity',
          component: () => import('@/views/tools/HtmlEntityView.vue'),
          meta: { title: 'HTML实体编解码', icon: '🏷️' }
        },
        {
          path: 'base32-codec',
          name: 'Base32Codec',
          component: () => import('@/views/tools/Base32CodecView.vue'),
          meta: { title: 'Base32编解码', icon: '🔡' }
        },
        {
          path: 'text-stats',
          name: 'TextStats',
          component: () => import('@/views/tools/TextStatsView.vue'),
          meta: { title: '文本统计/处理', icon: '📊' }
        },
        {
          path: 'ascii-convert',
          name: 'AsciiConvert',
          component: () => import('@/views/tools/AsciiConvertView.vue'),
          meta: { title: 'ASCII转换', icon: '🔢' }
        },
        {
          path: 'markdown-preview',
          name: 'MarkdownPreview',
          component: () => import('@/views/tools/MarkdownPreviewView.vue'),
          meta: { title: 'Markdown预览', icon: '📖' }
        },
        {
          path: 'number-base',
          name: 'NumberBase',
          component: () => import('@/views/tools/NumberBaseView.vue'),
          meta: { title: '进制转换', icon: '🧮' }
        },
        {
          path: 'hex-codec',
          name: 'HexCodec',
          component: () => import('@/views/tools/HexCodecView.vue'),
          meta: { title: 'Hex编解码', icon: '🔣' }
        },
        {
          path: 'hmac-calculator',
          name: 'HmacCalculator',
          component: () => import('@/views/tools/HmacCalculatorView.vue'),
          meta: { title: 'HMAC计算', icon: '🔐' }
        },
        {
          path: 'symmetric-crypto',
          name: 'SymmetricCrypto',
          component: () => import('@/views/tools/SymmetricCryptoView.vue'),
          meta: { title: '对称加密', icon: '🔒' }
        },
        {
          path: 'asymmetric-crypto',
          name: 'AsymmetricCrypto',
          component: () => import('@/views/tools/AsymmetricCryptoView.vue'),
          meta: { title: 'RSA非对称加密', icon: '🔐' }
        },
        {
          path: 'password-generator',
          name: 'PasswordGenerator',
          component: () => import('@/views/tools/PasswordGeneratorView.vue'),
          meta: { title: '密码生成器', icon: '🔑' }
        },
        {
          path: 'password-vault',
          name: 'PasswordVault',
          component: () => import('@/views/tools/PasswordVaultView.vue'),
          meta: { title: '密码库', icon: '🔐' }
        }
      ]
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/settings/SettingsView.vue'),
      meta: { title: '设置', icon: '⚙️' }
    }
  ]
})

export default router
