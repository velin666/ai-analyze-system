import { spawn } from 'child_process'
import { join } from 'path'
import { promises as fs } from 'fs'
import { createLogger } from '~/server/utils/logger'

const logger = createLogger('modify-excel-by-sequence')
const UPLOAD_DIR = join(process.cwd(), 'uploads')
const MODIFIED_DIR = join(UPLOAD_DIR, 'modified')
const PYTHON_SCRIPT = join(process.cwd(), 'server', 'api', 'files', 'modify_excel_by_sequence.py')

// 确保输出目录存在
async function ensureModifiedDir() {
  try {
    await fs.access(MODIFIED_DIR)
  } catch {
    await fs.mkdir(MODIFIED_DIR, { recursive: true })
  }
}

interface ModifyExcelBySequenceRequest {
  originalFilePath: string
  aiResult: string
  originalFileName: string
}

interface ModifyExcelBySequenceResponse {
  success: boolean
  downloadUrl?: string
  fileName?: string
  statistics?: {
    total_tables: number
    processed_tables: number
    skipped_tables: number
    total_rows: number
    matched_rows: number
    skipped_rows: number
    processing_time: number
  }
  error?: string
  warnings?: string[]
}

export default defineEventHandler(async (event): Promise<ModifyExcelBySequenceResponse> => {
  const startTime = Date.now()
  let requestBody: ModifyExcelBySequenceRequest | null = null
  
  try {
    await ensureModifiedDir()
    
    // 读取请求体
    requestBody = await readBody<ModifyExcelBySequenceRequest>(event)
    
    logger.info('收到Excel修改请求（基于序号列）', {
      originalFilePath: requestBody.originalFilePath,
      originalFileName: requestBody.originalFileName,
      aiResultLength: requestBody.aiResult?.length || 0
    })
    
    // 验证输入参数
    if (!requestBody.originalFilePath) {
      logger.warn('缺少参数: originalFilePath')
      throw createError({
        statusCode: 400,
        statusMessage: '缺少参数: originalFilePath'
      })
    }
    
    if (!requestBody.aiResult) {
      logger.warn('缺少参数: aiResult')
      throw createError({
        statusCode: 400,
        statusMessage: '缺少参数: aiResult'
      })
    }
    
    // 验证文件是否存在
    try {
      await fs.access(requestBody.originalFilePath)
      logger.info('原始文件验证通过', { path: requestBody.originalFilePath })
    } catch {
      logger.error('原始文件不存在', { path: requestBody.originalFilePath })
      throw createError({
        statusCode: 404,
        statusMessage: '原始文件不存在'
      })
    }
    
    // 调用Python脚本
    logger.info('开始调用Python脚本（基于序号匹配）')
    const result = await executePythonScript(
      requestBody.originalFilePath,
      requestBody.aiResult,
      MODIFIED_DIR
    )
    
    if (result.success && result.output_path) {
      // 生成下载URL
      const fileName = result.filename || 'modified.xlsx'
      const baseUrl = getRequestURL(event).origin
      const downloadUrl = `${baseUrl}/api/files/download-modified/${encodeURIComponent(fileName)}`
      
      const duration = Date.now() - startTime
      logger.info('Excel修改成功（基于序号列）', {
        fileName,
        outputPath: result.output_path,
        duration: `${duration}ms`,
        statistics: result.statistics
      })
      
      return {
        success: true,
        downloadUrl,
        fileName,
        statistics: result.statistics,
        warnings: result.warnings
      }
    } else {
      logger.error('Python脚本执行失败', { 
        error: result.error,
        statistics: result.statistics,
        warnings: result.warnings
      })
      return {
        success: false,
        error: result.error || '未知错误',
        statistics: result.statistics,
        warnings: result.warnings
      }
    }
    
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error('Excel修改过程发生错误', {
      error: error.message,
      stack: error.stack,
      originalFilePath: requestBody?.originalFilePath,
      duration: `${duration}ms`
    })
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Excel处理失败'
    })
  }
})

/**
 * 执行Python脚本（基于序号匹配）
 */
function executePythonScript(
  originalPath: string,
  aiResult: string,
  outputDir: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    logger.info('启动Python进程（基于序号匹配）', {
      script: PYTHON_SCRIPT,
      originalPath,
      outputDir,
      aiResultLength: aiResult.length
    })
    
    const pythonProcess = spawn('python', [
      PYTHON_SCRIPT,
      originalPath,
      outputDir
    ], {
      timeout: 30000 // 30秒超时
    })
    
    let stdout = ''
    let stderr = ''
    
    // 通过stdin传递AI结果（避免命令行参数编码问题）
    pythonProcess.stdin.write(aiResult, 'utf8')
    pythonProcess.stdin.end()
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString('utf8')
    })
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString('utf8')
      logger.debug('Python stderr', { stderr: data.toString('utf8') })
    })
    
    pythonProcess.on('close', (code) => {
      logger.info('Python进程结束', { exitCode: code })
      
      if (code === 0) {
        try {
          // 解析Python脚本的JSON输出
          const result = JSON.parse(stdout.trim())
          logger.info('Python输出解析成功', { result })
          resolve(result)
        } catch (e) {
          logger.error('无法解析Python输出', { stdout, error: e })
          reject(new Error(`无法解析Python输出: ${stdout}`))
        }
      } else {
        // 尝试解析错误输出
        try {
          const errorResult = JSON.parse(stdout.trim() || stderr.trim())
          logger.warn('Python脚本返回错误结果', { errorResult })
          resolve(errorResult)
        } catch {
          logger.error('Python脚本执行失败', { code, stderr, stdout })
          reject(new Error(`Python脚本执行失败 (退出码: ${code}): ${stderr || stdout}`))
        }
      }
    })
    
    pythonProcess.on('error', (error) => {
      logger.error('无法启动Python进程', { error: error.message })
      reject(new Error(`无法启动Python进程: ${error.message}`))
    })
  })
}
