export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts'
  ],
  css: ['~/assets/css/main.css'],
  googleFonts: {
    families: {
      'Inter': [400, 500, 600, 700],
      'JetBrains Mono': [400, 500, 600]
    }
  },
  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekApiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    public: {
      appName: '工地资料管理系统'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  typescript: {
    strict: true
  }
})
