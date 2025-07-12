// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@unocss/nuxt'
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.rinshankaiho.fun'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  css: ['~/assets/styles/global.css'],
  app: {
    head: {
      title: 'Bangumi 新番排行榜',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Bangumi.tv动画季度排行榜展示网站' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})