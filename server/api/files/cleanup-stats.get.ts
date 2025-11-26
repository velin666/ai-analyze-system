import { getCleanupStats } from '~/server/utils/fileCleanup'

export default defineEventHandler(async event => {
  try {
    const stats = await getCleanupStats()

    return {
      success: true,
      data: {
        ...stats,
        oldFileSizeFormatted: formatBytes(stats.oldFilesSize),
        totalSizeFormatted: formatBytes(stats.totalSize),
        cleanupThreshold: '24 hours',
        nextCleanup: 'Every 6 hours',
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to get cleanup stats',
    })
  }
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
