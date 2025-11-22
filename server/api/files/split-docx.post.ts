import { join } from 'path'
import { promises as fs } from 'fs'
import { splitDocxXmlByPages } from '~/server/utils/docxConverter'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { fileId, pagesPerFile = 30 } = body

    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File ID is required'
      })
    }

    // 验证pagesPerFile参数
    const pages = parseInt(pagesPerFile as string)
    if (isNaN(pages) || pages < 1 || pages > 1000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid pagesPerFile value (must be 1-1000)'
      })
    }

    // 读取文件元数据
    const metadataPath = join(UPLOAD_DIR, `${fileId}.meta.json`)
    let metadata
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(metadataContent)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    // 验证文件类型
    if (!metadata.originalName.toLowerCase().endsWith('.docx')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File must be a DOCX document'
      })
    }

    const filePath = metadata.path

    // 拆分文档
    const xmlChunks = await splitDocxXmlByPages(filePath, pages)

    return {
      success: true,
      totalChunks: xmlChunks.length,
      pagesPerFile: pages,
      chunks: xmlChunks
    }

  } catch (error: any) {
    console.error('DOCX split error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Split failed'
    })
  }
})
