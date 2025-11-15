export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt3-winston-log'
  ],
  css: ['~/assets/css/main.css'],
  googleFonts: {
    families: {
      'Inter': [400, 500, 600, 700],
      'JetBrains Mono': [400, 500, 600]
    }
  },
  nuxt3WinstonLog: {
    maxSize: '1024m',
    maxFiles: '30d',
    skipRequestMiddlewareHandler: true,
    level: 'info',
    format: 'json'
  },
  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekApiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    public: {
      appName: '工地资料管理系统'
    }
  },
  nitro: {
    prerender: {
      routes: ['/']
    },
    experimental: {
      wasm: true
    }
  },
  typescript: {
    strict: true
  }
})
