import { createLogger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const logger = createLogger('test-api')
  
  try {
    // 测试不同级别的日志
    logger.info('测试日志功能 - 信息级别', { 
      timestamp: new Date().toISOString(),
      testType: 'info'
    })
    
    logger.warn('测试日志功能 - 警告级别', { 
      timestamp: new Date().toISOString(),
      testType: 'warning'
    })
    
    logger.debug('测试日志功能 - 调试级别', { 
      timestamp: new Date().toISOString(),
      testType: 'debug'
    })
    
    // 模拟一个错误日志
    try {
      throw new Error('这是一个测试错误')
    } catch (error) {
      logger.error('测试日志功能 - 错误级别', { 
        timestamp: new Date().toISOString(),
        testType: 'error',
        error: (error as Error).message,
        stack: (error as Error).stack
      })
    }
    
    return {
      success: true,
      message: '测试日志已生成',
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    logger.error('测试日志API失败', { 
      error: (error as Error).message 
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: '测试日志失败'
    })
  }
})
