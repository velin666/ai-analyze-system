import { promises as fs } from 'fs'
import { join } from 'path'
import { createLogger } from './logger'

const logger = createLogger('file-cleanup')

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Clean up files older than 24 hours from the uploads directory
 */
export async function cleanupOldFiles(): Promise<void> {
  try {
    logger.info('Starting cleanup of old files')

    // Check if uploads directory exists
    try {
      await fs.access(UPLOAD_DIR)
    } catch {
      logger.info('Uploads directory does not exist, skipping cleanup')
      return
    }

    const now = new Date()
    const cutoffTime = new Date(now.getTime() - CLEANUP_INTERVAL_MS)

    const files = await fs.readdir(UPLOAD_DIR)
    let deletedCount = 0
    let errorCount = 0

    for (const filename of files) {
      const filePath = join(UPLOAD_DIR, filename)

      try {
        const stats = await fs.stat(filePath)

        // Skip directories
        if (stats.isDirectory()) {
          continue
        }

        // Check if file is older than 24 hours
        if (stats.mtime < cutoffTime) {
          await fs.unlink(filePath)
          deletedCount++
          logger.info(`Deleted old file: ${filename}`)

          // Also delete corresponding metadata file if it exists
          if (!filename.endsWith('.meta.json')) {
            const metaFilename = filename.replace(/\.[^.]+$/, '') + '.meta.json'
            const metaFilePath = join(UPLOAD_DIR, metaFilename)

            try {
              await fs.access(metaFilePath)
              await fs.unlink(metaFilePath)
              logger.info(`Deleted metadata file: ${metaFilename}`)
            } catch {
              // Metadata file doesn't exist, ignore
            }
          }
        }
      } catch (error: any) {
        logger.error(`Error processing file ${filename}:`, error.message)
        errorCount++
      }
    }

    logger.info(
      `Cleanup completed. Deleted ${deletedCount} files. Errors: ${errorCount}`
    )
  } catch (error: any) {
    logger.error('Failed to cleanup old files:', error.message)
  }
}

/**
 * Start the file cleanup scheduler
 */
export function startFileCleanupScheduler(): void {
  logger.info('Starting file cleanup scheduler (runs every 6 hours)')

  // Run cleanup immediately on start
  cleanupOldFiles()

  // Schedule cleanup every 6 hours
  setInterval(() => {
    cleanupOldFiles()
  }, 6 * 60 * 60 * 1000) // 6 hours
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStats(): Promise<{
  totalFiles: number
  oldFiles: number
  totalSize: number
  oldFilesSize: number
}> {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    return {
      totalFiles: 0,
      oldFiles: 0,
      totalSize: 0,
      oldFilesSize: 0,
    }
  }

  const now = new Date()
  const cutoffTime = new Date(now.getTime() - CLEANUP_INTERVAL_MS)

  const files = await fs.readdir(UPLOAD_DIR)
  let totalFiles = 0
  let oldFiles = 0
  let totalSize = 0
  let oldFilesSize = 0

  for (const filename of files) {
    const filePath = join(UPLOAD_DIR, filename)

    try {
      const stats = await fs.stat(filePath)

      if (stats.isFile()) {
        totalFiles++
        totalSize += stats.size

        if (stats.mtime < cutoffTime) {
          oldFiles++
          oldFilesSize += stats.size
        }
      }
    } catch {
      // Ignore errors for individual files
    }
  }

  return {
    totalFiles,
    oldFiles,
    totalSize,
    oldFilesSize,
  }
}
