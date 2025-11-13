import { promises as fs } from 'fs'
import { join } from 'path'
import type { FileInfo } from '~/types'
import { DeepSeekService } from '~/server/utils/deepseek'
import { isCodeFile } from '~/utils/fileUtils'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  const fileId = getRouterParam(event, 'id')
  
  if (!fileId) {
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

    return updatedFileInfo

  } catch (error: any) {
    console.error('Analysis error:', error)
    
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
