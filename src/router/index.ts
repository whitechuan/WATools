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
