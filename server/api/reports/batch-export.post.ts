import JSZip from 'jszip'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { reportUrls } = body

    if (!reportUrls || !Array.isArray(reportUrls) || reportUrls.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '报告URL列表缺失或格式错误',
      })
    }

    console.log(`开始批量下载 ${reportUrls.length} 个报告文件`)

    // 创建ZIP压缩包
    const zip = new JSZip()
    const folder = zip.folder('reports')

    // 下载每个报告文件并添加到ZIP
    for (let i = 0; i < reportUrls.length; i++) {
      const url = reportUrls[i]
      console.log(`下载第 ${i + 1}/${reportUrls.length} 个报告: ${url}`)

      try {
        // 下载文件
        const response = await $fetch(url, {
          method: 'GET',
          responseType: 'arrayBuffer',
        })

        // 从URL提取文件名
        const urlParts = url.split('/')
        const urlFileName = urlParts[urlParts.length - 1].split('?')[0]

        // 生成文件名
        const fileName = `report_${i + 1}_${urlFileName}`

        // 添加到ZIP
        folder!.file(fileName, response as ArrayBuffer)
        console.log(`成功添加文件: ${fileName}`)
      } catch (error) {
        console.error(`下载文件失败 ${url}:`, error)
        // 继续处理其他文件
      }
    }

    // 生成ZIP文件
    console.log('开始生成ZIP文件...')
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // 保存ZIP文件到临时目录
    const uploadsDir = join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const zipFileName = `reports_${Date.now()}.zip`
    const zipFilePath = join(uploadsDir, zipFileName)

    // 写入文件
    const writeStream = createWriteStream(zipFilePath)
    writeStream.write(zipBuffer)
    writeStream.end()

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve())
      writeStream.on('error', reject)
    })

    console.log(`ZIP文件已保存: ${zipFilePath}`)

    // 生成下载URL
    const config = useRuntimeConfig()
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    const downloadUrl = `${baseUrl}/api/files/download/${zipFileName}`

    return {
      success: true,
      downloadUrl,
      fileName: zipFileName,
      totalFiles: reportUrls.length,
    }
  } catch (error: any) {
    console.error('批量导出报告失败:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '批量导出失败',
    })
  }
})
