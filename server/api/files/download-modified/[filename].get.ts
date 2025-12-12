import { createReadStream, promises as fs } from 'fs'
import { join } from 'path'
import { lookup } from 'mime-types'

const MODIFIED_DIR = join(process.cwd(), 'uploads', 'modified')

export default defineEventHandler(async (event) => {
  try {
    const filename = getRouterParam(event, 'filename')
    
    if (!filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing filename'
      })
    }
    
    // 解码文件名
    const decodedFilename = decodeURIComponent(filename)
    const filePath = join(MODIFIED_DIR, decodedFilename)
    
    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }
    
    // 获取文件信息
    const stats = await fs.stat(filePath)
    const mimeType = lookup(decodedFilename) || 'application/octet-stream'
    
    // 设置响应头
    setResponseHeaders(event, {
      'Content-Type': mimeType,
      'Content-Length': stats.size.toString(),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(decodedFilename)}"`,
      'Cache-Control': 'no-cache'
    })
    
    // 返回文件流
    return createReadStream(filePath)
    
  } catch (error: any) {
    console.error('Download error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Download failed'
    })
  }
})
