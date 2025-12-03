export default defineNuxtConfig({
  devtools: { enabled: true },
  // ssr: false,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    'nuxt3-winston-log',
  ],
  css: ['~/assets/css/main.css', 'ant-design-vue/dist/reset.css'],
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      'JetBrains Mono': [400, 500, 600],
    },
    download: false, // 禁用字体下载，使用 CDN 链接
    inject: true,
  },
  nuxt3WinstonLog: {
    maxSize: '1024m',
    maxFiles: '30d',
    skipRequestMiddlewareHandler: true,
    level: 'info',
    format: 'json',
  },

  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekApiUrl:
      process.env.DEEPSEEK_API_URL ||
      'https://api.deepseek.com/v1/chat/completions',
    cozeApiKey: process.env.COZE_API_KEY,
    cozeApiUrl:
      process.env.COZE_API_URL || 'https://api.coze.cn/v1/workflow/run',
    cozeWorkflowId: process.env.COZE_WORKFLOW_ID,
    cozePatToken: process.env.COZE_PAT_TOKEN,
    cozeSpaceId: process.env.COZE_SPACE_ID,
    public: {
      appName: '工地资料管理系统',
    },
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
    experimental: {
      wasm: true,
    },
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With',
      },
    },
  },
  typescript: {
    strict: true,
  },
  app: {
    head: {
      charset: 'utf-16',
      title: 'AI文档分析系统',
      meta: [{ name: 'I系统', content: 'AI system' }],
    },
  },
  vite: {
    optimizeDeps: {
      include: ['dayjs'],
    },
    ssr: {
      noExternal: ['ant-design-vue'],
    },
  },
})
