import { createReadStream, promises as fs } from 'fs'
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
    
    // Check if file exists
    const filePath = join(UPLOAD_DIR, fileInfo.name)
    await fs.access(filePath)
    
    // Set headers for file download
    setHeader(event, 'Content-Type', fileInfo.type)
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileInfo.originalName}"`)
    setHeader(event, 'Content-Length', fileInfo.size)
    
    // Stream the file
    return sendStream(event, createReadStream(filePath))
    
  } catch (error: any) {
    console.error('Download error:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    })
  }
})
