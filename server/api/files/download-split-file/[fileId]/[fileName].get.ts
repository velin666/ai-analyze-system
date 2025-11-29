import { promises as fs } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  try {
    const fileId = getRouterParam(event, 'fileId')
    const fileName = getRouterParam(event, 'fileName')
    
    if (!fileId || !fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File ID and file name are required'
      })
    }

    // 构建文件路径
    const filePath = join(UPLOAD_DIR, `split_${fileId}`, fileName)

    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    // 读取文件
    const fileContent = await fs.readFile(filePath)
    const stat = await fs.stat(filePath)

    // 设置响应头
    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': stat.size.toString(),
    })

    return fileContent
  } catch (error: any) {
    console.error('Download split file error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Download failed'
    })
  }
})
