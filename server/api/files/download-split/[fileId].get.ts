import { createReadStream, promises as fs } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  const fileId = getRouterParam(event, 'fileId')

  if (!fileId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File ID is required'
    })
  }

  try {
    // Check if zip file exists
    const zipPath = join(UPLOAD_DIR, `split_${fileId}.zip`)
    await fs.access(zipPath)

    // Get file stats
    const stats = await fs.stat(zipPath)

    // Set headers for file download
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', `attachment; filename="split_documents.zip"`)
    setHeader(event, 'Content-Length', stats.size)

    // Stream the file
    return sendStream(event, createReadStream(zipPath))

  } catch (error: any) {
    console.error('Download error:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'ZIP file not found or expired'
    })
  }
})
