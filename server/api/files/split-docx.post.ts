import { join } from 'path'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'
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
        statusMessage: '缺少文件ID'
      })
    }

    console.log(`开始拆分DOCX文档，文件ID: ${fileId}, 每个文件页数: ${pagesPerFile}`)

    // 模拟获取文件信息 (实际项目中需要从数据库获取)
    const inputPath = join(UPLOAD_DIR, `${fileId}.docx`)
    const outputDir = join(UPLOAD_DIR, `split_${fileId}`)

    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true })

    // 构建Python脚本命令
    const scriptPath = join(process.cwd(), 'server', 'api', 'files', 'split_docx_pages.py')
    const command = `python "${scriptPath}" "${inputPath}" "${outputDir}" ${pagesPerFile}`

    console.log(`执行命令: ${command}`)

    // 执行Python脚本
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000 // 5分钟超时
    })

    console.log('Python 脚本输出:', stdout)
    if (stderr) {
      console.warn('Python 脚本警告:', stderr)
    }

    // 读取输出目录中的文件
    const outputFiles = await fs.readdir(outputDir)
    const docxFiles = outputFiles.filter(file => file.endsWith('.docx'))

    if (docxFiles.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: '拆分失败，未生成任何文件'
      })
    }

    // 创建ZIP文件
    const zip = new AdmZip()
    for (const docxFile of docxFiles) {
      const filePath = join(outputDir, docxFile)
      zip.addLocalFile(filePath)
    }

    // 保存ZIP文件
    const zipFileName = `split_${fileId}.zip`
    const zipPath = join(UPLOAD_DIR, zipFileName)
    zip.writeZip(zipPath)

    // 生成下载链接
    const downloadUrl = `/api/files/download-split/${fileId}`

    return {
      success: true,
      totalFiles: docxFiles.length,
      pagesPerFile,
      files: docxFiles,
      downloadUrl,
      message: `成功拆分为 ${docxFiles.length} 个文件`
    }

  } catch (error: any) {
    console.error('DOCX split error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '拆分失败'
    })
  }
})
