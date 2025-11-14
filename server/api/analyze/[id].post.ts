import { promises as fs } from 'fs'
import { join } from 'path'
import type { FileInfo } from '~/types'
import { DeepSeekService } from '~/server/utils/deepseek'
import { isCodeFile } from '~/utils/fileUtils'
import { createLogger } from '~/server/utils/logger'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const logger = createLogger('analyze-api')
  const fileId = getRouterParam(event, 'id')

  logger.info('开始文件分析', { fileId })

  if (!fileId) {
    logger.error('文件ID缺失', { fileId })
    throw createError({
      statusCode: 400,
      statusMessage: 'File ID is required'
    })
  }

  try {
    // Load file metadata
    const metaPath = join(UPLOAD_DIR, `${fileId}.meta.json`)
    const metaContent = await fs.readFile(metaPath, 'utf-8')
    const fileInfo = JSON.parse(metaContent) as FileInfo

    // Read file content
    const filePath = join(UPLOAD_DIR, fileInfo.name)
    let content: string

    try {
      // Check if file is text-based and can be analyzed
      if (isTextFile(fileInfo.type) || isCodeFile(fileInfo.originalName)) {
        content = await fs.readFile(filePath, 'utf-8')
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: 'File type not supported for analysis'
        })
      }
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unable to read file content for analysis'
      })
    }

    // Initialize DeepSeek service
    const config = useRuntimeConfig()
    if (!config.deepseekApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'DeepSeek API key not configured'
      })
    }

    const deepSeekService = new DeepSeekService({
      apiKey: config.deepseekApiKey,
      apiUrl: config.public.deepseekApiUrl
    })

    // Perform analysis
    const [analysis, errors] = await Promise.all([
      deepSeekService.analyzeFile(content, fileInfo.originalName, fileInfo.type),
      deepSeekService.detectErrors(content, fileInfo.originalName, fileInfo.type)
    ])

    // Update file info with analysis results
    const updatedFileInfo: FileInfo = {
      ...fileInfo,
      analysis,
      errors
    }

    // Save updated metadata
    await fs.writeFile(metaPath, JSON.stringify(updatedFileInfo, null, 2))

    const duration = Date.now() - startTime
    logger.info('文件分析完成', { 
      fileId, 
      fileName: fileInfo.originalName, 
      fileSize: fileInfo.size,
      duration: `${duration}ms`,
      analysisComplexity: analysis.complexity,
      errorsFound: errors?.length || 0
    })

    return updatedFileInfo

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error('文件分析失败', { 
      fileId, 
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack
    })

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Analysis failed'
    })
  }
})

function isTextFile(mimeType: string): boolean {
  const textTypes = [
    'text/',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-yaml',
    'application/yaml'
  ]

  return textTypes.some(type => mimeType.startsWith(type))
}
