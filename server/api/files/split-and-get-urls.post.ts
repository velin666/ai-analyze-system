import { join } from 'path'
import { promises as fs } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

/**
 * 获取拆分后的文件URL列表
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { fileId } = body

    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少文件ID',
      })
    }

    // 读取拆分文件目录
    const outputDir = join(UPLOAD_DIR, `split_${fileId}`)
    
    try {
      await fs.access(outputDir)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: '拆分文件不存在，请先执行文档拆分',
      })
    }

    // 读取所有拆分的DOCX文件
    const outputFiles = await fs.readdir(outputDir)
    const docxFiles = outputFiles.filter(file => file.endsWith('.docx')).sort()

    if (docxFiles.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '未找到拆分文件',
      })
    }

    // 为每个拆分文件生成可访问的URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    const fileUrls = docxFiles.map((fileName) => {
      // 使用相对路径: split_${fileId}/${fileName}
      const encodedPath = encodeURIComponent(`split_${fileId}/${fileName}`)
      return `${baseUrl}/api/files/download-split-file/${fileId}/${encodeURIComponent(fileName)}`
    })

    console.log(`获取到 ${fileUrls.length} 个拆分文件的URL`)

    return {
      success: true,
      totalFiles: docxFiles.length,
      files: docxFiles,
      fileUrls,
    }
  } catch (error: any) {
    console.error('获取拆分文件URL失败:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '获取拆分文件URL失败',
    })
  }
})
