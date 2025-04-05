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
      { hid: 'description', name: 'description', content: 'Bangumi 动画季度排行榜展示' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
  }
} 