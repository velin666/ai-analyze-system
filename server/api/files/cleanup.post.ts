import { cleanupOldFiles } from '~/server/utils/fileCleanup'

export default defineEventHandler(async event => {
  try {
    await cleanupOldFiles()

    return {
      success: true,
      message: 'File cleanup completed successfully',
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to cleanup files',
    })
  }
})
