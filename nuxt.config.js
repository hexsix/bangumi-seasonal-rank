export default {
  // 目标: 静态站点生成
  target: 'static',

  // 全局页面头部
  head: {
    title: 'Bangumi 动画季度排行榜',
    htmlAttrs: {
      lang: 'zh-CN'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Bangumi 动画季度排行榜展示' },
      { name: 'msapplication-TileColor', content: '#2b5797' },
      { name: 'theme-color', content: '#ffffff' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' }
    ]
  },

  // 全局 CSS
  css: [
  ],

  // 插件配置
  plugins: [
    '~/plugins/public-files.js'
  ],

  // 自动导入组件
  components: true,

  // Nuxt 模块
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/tailwindcss'
  ],

  // Axios配置
  axios: {
    baseURL: '/', // 设置baseURL为相对路径
    browserBaseURL: '/' // 确保浏览器端也使用相对路径
  },

  // 构建配置
  build: {
  },
  
  // 静态文件配置
  static: {
    prefix: false
  },

  // 路由配置
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'season',
        path: '/season/:id',
        component: resolve(__dirname, 'pages/season/[id].vue')
      })
    }
  },

  // 生成配置
  generate: {
    fallback: true, // 添加 fallback 页面
    routes: async () => {
      // 生成从 2020 年到 2030 年的所有季度路由
      const routes = []
      for (let year = 2020; year <= 2030; year++) {
        for (let month = 1; month <= 12; month += 3) {
          const season = `${year}${month.toString().padStart(2, '0')}`
          routes.push(`/season/${season}`)
        }
      }
      return routes
    }
  }
}
