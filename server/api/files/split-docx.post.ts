import { join } from 'path'
import { promises as fs } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import AdmZip from 'adm-zip'

const execAsync = promisify(exec)
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

    // 创建输出目录
    const outputDir = join(UPLOAD_DIR, `split_${fileId}`)
    await fs.mkdir(outputDir, { recursive: true })

    // 调用Python脚本进行拆分
    const pythonScript = join(process.cwd(), 'server', 'api', 'files', 'split_docx_pages.py')
    const command = `python "${pythonScript}" "${filePath}" "${outputDir}" ${pages}`

    console.log('执行命令:', command)

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000 // 5分钟超时
      })
      if (stderr) {
        console.warn('Python stderr:', stderr)
      }
      console.log('Python stdout:', stdout)
    } catch (execError: any) {
      console.error('Python执行错误:', execError)
      throw createError({
        statusCode: 500,
        statusMessage: `拆分失败: ${execError.message}`
      })
    }

    // 读取拆分后的文件
    const files = await fs.readdir(outputDir)
    const docxFiles = files.filter(f => f.endsWith('.docx'))

    if (docxFiles.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: '拆分后未找到DOCX文件'
      })
    }

    // 创建zip文件
    const zip = new AdmZip()
    for (const file of docxFiles) {
      const fileFullPath = join(outputDir, file)
      zip.addLocalFile(fileFullPath)
    }

    const zipBuffer = zip.toBuffer()
    const zipPath = join(UPLOAD_DIR, `split_${fileId}.zip`)
    await fs.writeFile(zipPath, zipBuffer)

    // 返回结果
    return {
      success: true,
      totalFiles: docxFiles.length,
      pagesPerFile: pages,
      files: docxFiles,
      downloadUrl: `/api/files/download-split/${fileId}`,
      fileId: fileId
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
