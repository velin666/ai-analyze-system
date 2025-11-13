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
    
    // Delete actual file
    const filePath = join(UPLOAD_DIR, fileInfo.name)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.warn(`Could not delete file ${filePath}:`, error)
    }
    
    // Delete metadata file
    await fs.unlink(metaPath)
    
    return {
      success: true,
      message: 'File deleted successfully'
    }
    
  } catch (error: any) {
    console.error('Delete error:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    })
  }
})
