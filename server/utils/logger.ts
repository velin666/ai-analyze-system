// 临时的日志工具，如果 nuxt3-winston-log 不可用的话
export const createLogger = (service: string) => {
  return {
    info: (message: string, meta?: any) => {
      console.log(`[${service}] INFO: ${message}`, meta || '')
    },
    error: (message: string, meta?: any) => {
      console.error(`[${service}] ERROR: ${message}`, meta || '')
    },
    warn: (message: string, meta?: any) => {
      console.warn(`[${service}] WARN: ${message}`, meta || '')
    },
    debug: (message: string, meta?: any) => {
      console.debug(`[${service}] DEBUG: ${message}`, meta || '')
    }
  }
}
