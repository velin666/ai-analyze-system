import fs from 'fs'
import path from 'path'
import type { LogEntry, LogFilter, LogResponse } from '~/types'
import { createLogger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as LogFilter
    const logger = createLogger('logs-api')
    
    // 获取日志文件列表
    const logsDir = path.join(process.cwd(), 'logs')
    
    if (!fs.existsSync(logsDir)) {
      return {
        logs: [],
        total: 0,
        hasMore: false
      } as LogResponse
    }
    
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .sort((a, b) => b.localeCompare(a)) // 最新的文件在前
    
    const logs: LogEntry[] = []
    const limit = query.limit || 100
    const offset = query.offset || 0
    
    // 解析日志文件
    for (const file of logFiles) {
      if (logs.length >= limit + offset) break
      
      const filePath = path.join(logsDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim())
      
      for (const line of lines.reverse()) { // 最新的日志在前
        if (logs.length >= limit + offset) break
        
        try {
          const logEntry = JSON.parse(line) as LogEntry
          
          // 应用过滤器
          if (query.level && query.level.length > 0 && !query.level.includes(logEntry.level)) {
            continue
          }
          
          if (query.service && logEntry.service !== query.service) {
            continue
          }
          
          if (query.search && !logEntry.message.toLowerCase().includes(query.search.toLowerCase())) {
            continue
          }
          
          if (query.startDate && new Date(logEntry.timestamp) < new Date(query.startDate)) {
            continue
          }
          
          if (query.endDate && new Date(logEntry.timestamp) > new Date(query.endDate)) {
            continue
          }
          
          logs.push(logEntry)
        } catch (error) {
          // 忽略无法解析的日志行
          continue
        }
      }
    }
    
    // 分页
    const paginatedLogs = logs.slice(offset, offset + limit)
    
    return {
      logs: paginatedLogs,
      total: logs.length,
      hasMore: logs.length > offset + limit
    } as LogResponse
    
  } catch (error) {
    const logger = createLogger('logs-api')
    logger.error('获取日志失败', { error: (error as Error).message })
    
    throw createError({
      statusCode: 500,
      statusMessage: '获取日志失败'
    })
  }
})
