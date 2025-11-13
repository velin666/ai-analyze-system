import { promises as fs } from 'fs'
import { join } from 'path'
import type { FileInfo } from '~/types'

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
    
    // Check if file is text-based
    const isTextFile = fileInfo.type.startsWith('text/') || 
                      fileInfo.type.includes('json') ||
                      fileInfo.type.includes('xml') ||
                      fileInfo.type.includes('javascript') ||
                      fileInfo.type.includes('typescript')
    
    if (!isTextFile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File content cannot be displayed as text'
      })
    }
    
    // Read file content
    const filePath = join(UPLOAD_DIR, fileInfo.name)
    const content = await fs.readFile(filePath, 'utf-8')
    
    return {
      content,
      encoding: 'utf-8',
      size: content.length
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found or cannot be read'
    })
  }
})
