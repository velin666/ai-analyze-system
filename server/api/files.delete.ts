import { promises as fs } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  try {
    // Get all files in upload directory
    const files = await fs.readdir(UPLOAD_DIR)
    
    // Delete all files
    const deletePromises = files.map(async (file) => {
      const filePath = join(UPLOAD_DIR, file)
      try {
        await fs.unlink(filePath)
      } catch (error) {
        console.warn(`Could not delete file ${filePath}:`, error)
      }
    })
    
    await Promise.all(deletePromises)
    
    return {
      success: true,
      message: 'All files deleted successfully',
      deletedCount: files.length
    }
    
  } catch (error: any) {
    console.error('Clear all files error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clear files'
    })
  }
})
