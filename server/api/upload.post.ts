import { createReadStream, promises as fs } from 'fs'
import { join } from 'path'
import formidable from 'formidable'
import { lookup } from 'mime-types'
import type { FileInfo } from '~/types'
import { generateFileId, getFileCategory } from '~/utils/fileUtils'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export default defineEventHandler(async (event) => {
  try {
    await ensureUploadDir()
    
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
    })

    const [fields, files] = await form.parse(event.node.req)
    
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    if (!uploadedFile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const fileId = generateFileId()
    const originalName = uploadedFile.originalFilename || 'unnamed'
    const mimeType = uploadedFile.mimetype || lookup(originalName) || 'application/octet-stream'
    const size = uploadedFile.size || 0
    
    // Move file to organized storage
    const fileExtension = originalName.split('.').pop() || ''
    const newFileName = `${fileId}.${fileExtension}`
    const newFilePath = join(UPLOAD_DIR, newFileName)
    
    await fs.rename(uploadedFile.filepath, newFilePath)
    
    // Create file info
    const fileInfo: FileInfo = {
      id: fileId,
      name: newFileName,
      originalName,
      size,
      type: mimeType,
      category: getFileCategory(mimeType),
      uploadedAt: new Date(),
      path: newFilePath
    }
    
    // Save file metadata (in a real app, you'd use a database)
    const metadataPath = join(UPLOAD_DIR, `${fileId}.meta.json`)
    await fs.writeFile(metadataPath, JSON.stringify(fileInfo, null, 2))
    
    return fileInfo
    
  } catch (error: any) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Upload failed'
    })
  }
})
