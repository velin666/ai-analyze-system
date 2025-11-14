import fs from 'fs'
import path from 'path'
import { createLogger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { filename } = body
    const logger = createLogger('logs-api')
    
    if (!filename) {
      throw createError({
        statusCode: 400,
        statusMessage: '文件名不能为空'
      })
    }
    
    const logsDir = path.join(process.cwd(), 'logs')
    const filePath = path.join(logsDir, filename)
    
    // 安全检查：确保文件在 logs 目录内
    if (!filePath.startsWith(logsDir)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的文件路径'
      })
    }
    
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        statusMessage: '日志文件不存在'
      })
    }
    
    fs.unlinkSync(filePath)
    logger.info('日志文件删除成功', { filename })
    
    return { success: true, message: '日志文件删除成功' }
    
  } catch (error) {
    const logger = createLogger('logs-api')
    logger.error('删除日志文件失败', { error: (error as Error).message })
    
    throw createError({
      statusCode: 500,
      statusMessage: '删除日志文件失败'
    })
  }
})
