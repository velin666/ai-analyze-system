import { promises as fs } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  try {
    const fileId = getRouterParam(event, 'id')
    
    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File ID is required'
      })
    }

    // Read metadata
    const metadataPath = join(UPLOAD_DIR, `${fileId}.meta.json`)
    
    try {
      await fs.access(metadataPath)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'))
    const filePath = metadata.path

    // Read file
    const fileContent = await fs.readFile(filePath)

    // Set headers
    setResponseHeaders(event, {
      'Content-Type': metadata.type || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(metadata.originalName)}"`,
      'Content-Length': metadata.size.toString(),
    })

    return fileContent
  } catch (error: any) {
    console.error('Download error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Download failed'
    })
  }
})
