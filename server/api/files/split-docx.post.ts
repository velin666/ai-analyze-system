import { join } from 'path'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'
import AdmZip from 'adm-zip'

const execAsync = promisify(exec)
const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { fileId, pagesPerFile = 30 } = body

    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少文件ID',
      })
    }

    console.log(
      `开始拆分DOCX文档，文件ID: ${fileId}, 每个文件页数: ${pagesPerFile}`
    )

    // 模拟获取文件信息 (实际项目中需要从数据库获取)
    const inputPath = join(UPLOAD_DIR, `${fileId}.docx`)
    const outputDir = join(UPLOAD_DIR, `split_${fileId}`)

    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true })

    // 构建Python脚本命令 - 使用跨平台统一脚本
    const scriptPath = join(
      process.cwd(),
      'server',
      'api',
      'files',
      'split_docx_pages_unified.py'
    )
    const command = `python "${scriptPath}" "${inputPath}" "${outputDir}" ${pagesPerFile}`

    console.log(`执行命令: ${command}`)

    // 执行Python脚本
    let stdout = ''
    let stderr = ''

    try {
      const result = await execAsync(command, {
        timeout: 300000, // 5分钟超时
      })
      stdout = result.stdout
      stderr = result.stderr

      console.log('Python 脚本输出:', stdout)
      if (stderr) {
        console.warn('Python 脚本警告:', stderr)
      }
    } catch (error: any) {
      console.error('='.repeat(60))
      console.error('Python 脚本执行失败')
      console.error('='.repeat(60))
      console.error('命令:', command)
      console.error('错误:', error.message)
      if (error.stdout) {
        console.error('\n标准输出 (stdout):')
        console.error(error.stdout)
      }
      if (error.stderr) {
        console.error('\n标准错误 (stderr):')
        console.error(error.stderr)
      }
      console.error('='.repeat(60))
      throw error
    }

    // 读取输出目录中的文件并获取文件大小
    const outputFiles = await fs.readdir(outputDir)
    const docxFileNames = outputFiles.filter(file => file.endsWith('.docx'))

    if (docxFileNames.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: '拆分失败，未生成任何文件',
      })
    }

    // 获取文件信息（名称和大小）
    const docxFiles = await Promise.all(
      docxFileNames.map(async fileName => {
        const filePath = join(outputDir, fileName)
        const stats = await fs.stat(filePath)
        return {
          name: fileName,
          size: stats.size,
        }
      })
    )

    // 创建ZIP文件
    const zip = new AdmZip()
    for (const docxFile of docxFiles) {
      const filePath = join(outputDir, docxFile.name)
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
      message: `成功拆分为 ${docxFiles.length} 个文件`,
    }
  } catch (error: any) {
    console.error('DOCX split error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '拆分失败',
    })
  }
})
