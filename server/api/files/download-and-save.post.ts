// TEST_FILE: 测试用API - 下载远程文件到服务器
import { promises as fs } from 'fs'
import { join } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

interface DownloadRequest {
  url: string
  filename: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<DownloadRequest>(event)
    
    if (!body.url || !body.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必要参数'
      })
    }
    
    // 确保上传目录存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    
    // 下载文件
    const response = await fetch(body.url)
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`)
    }
    
    // 保存文件
    const filePath = join(UPLOAD_DIR, body.filename)
    const fileStream = createWriteStream(filePath)
    
    if (response.body) {
      // @ts-ignore
      await pipeline(response.body, fileStream)
    }
    
    return {
      success: true,
      path: filePath,
      filename: body.filename
    }
  } catch (error: any) {
    console.error('下载文件失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '下载文件失败'
    })
  }
})
