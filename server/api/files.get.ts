import { promises as fs } from 'fs'
import { join } from 'path'
import type { FileInfo } from '~/types'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  try {
    // Read all metadata files
    const files = await fs.readdir(UPLOAD_DIR)
    const metaFiles = files.filter(f => f.endsWith('.meta.json'))
    
    const fileInfos: FileInfo[] = []
    
    for (const metaFile of metaFiles) {
      try {
        const metaPath = join(UPLOAD_DIR, metaFile)
        const metaContent = await fs.readFile(metaPath, 'utf-8')
        const fileInfo = JSON.parse(metaContent) as FileInfo
        
        // Check if actual file still exists
        const actualFilePath = join(UPLOAD_DIR, fileInfo.name)
        try {
          await fs.access(actualFilePath)
          fileInfos.push(fileInfo)
        } catch {
          // File doesn't exist, remove metadata
          await fs.unlink(metaPath)
        }
      } catch (error) {
        console.error(`Error reading metadata file ${metaFile}:`, error)
      }
    }
    
    return {
      files: fileInfos.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    }
    
  } catch (error: any) {
    console.error('Error listing files:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list files'
    })
  }
})
