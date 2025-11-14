// 扩展 Nuxt 配置类型以支持 nuxt3-winston-log
declare module '@nuxt/schema' {
  interface NuxtConfig {
    nuxt3WinstonLog?: {
      maxSize?: string
      maxFiles?: string
      skipRequestMiddlewareHandler?: boolean
      level?: 'error' | 'warn' | 'info' | 'debug'
      format?: 'json' | 'simple'
    }
  }
}

// 确保这个文件被认为是一个模块
export {}
