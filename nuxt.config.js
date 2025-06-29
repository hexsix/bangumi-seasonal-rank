export default {
  target: 'server',

  ssr: true,

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

  // 自动导入组件
  components: true,

  // Nuxt 模块
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/tailwindcss'
  ],

  // Axios配置
  axios: {
    baseURL: 'https://api.rinshankaiho.fun', // 使用新的API base URL
    browserBaseURL: 'https://api.rinshankaiho.fun' // 确保浏览器端也使用新的API URL
  },

  // 构建配置
  build: {
  },
  
  // 静态文件配置
  static: {
    prefix: false
  }
}
