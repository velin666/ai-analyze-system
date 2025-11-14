import fs from 'fs'
import path from 'path'
import { createLogger } from '../../utils/logger'

interface LogFileInfo {
  name: string
  size: number
  lastModified: string
  type: 'info' | 'error' | 'warn' | 'debug'
}

export default defineEventHandler(async (event) => {
  try {
    const logger = createLogger('logs-api')
    const logsDir = path.join(process.cwd(), 'logs')
    
    if (!fs.existsSync(logsDir)) {
      return { files: [] }
    }
    
    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logsDir, file)
        const stats = fs.statSync(filePath)
        
        // 从文件名推断日志类型
        let type: LogFileInfo['type'] = 'info'
        if (file.includes('error')) type = 'error'
        else if (file.includes('warn')) type = 'warn'
        else if (file.includes('debug')) type = 'debug'
        
        return {
          name: file,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          type
        } as LogFileInfo
      })
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    
    return { files }
    
  } catch (error) {
    const logger = createLogger('logs-api')
    logger.error('获取日志文件列表失败', { error: (error as Error).message })
    
    throw createError({
      statusCode: 500,
      statusMessage: '获取日志文件列表失败'
    })
  }
})
