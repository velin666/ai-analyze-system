import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'
import AdmZip from 'adm-zip'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { fileId, pagesPerFile = 30 } = query
  const pages = parseInt(pagesPerFile as string) || 30

  if (!fileId) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少文件ID'
    })
  }

  // 设置Server-Sent Events响应头
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')

  // 发送数据到客户端
  const sendMessage = (type: string, data: any) => {
    const message = `data: ${JSON.stringify({ type, data })}\n\n`
    event.node.res.write(message)
  }

  try {
    // 模拟获取文件信息 - 实际项目中需要从数据库获取
    const inputPath = join(process.cwd(), 'uploads', `${fileId}.docx`)
    const outputDir = join(process.cwd(), 'uploads', `split_${fileId}`)

    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true })

    sendMessage('info', { message: '开始处理文件...' })

    // 构建Python脚本命令
    const scriptPath = join(process.cwd(), 'server', 'api', 'files', 'split_docx_pages.py')

    // 启动Python进程
    const pythonProcess = spawn('python', [
      scriptPath,
      inputPath,
      outputDir,
      pages.toString()
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let totalFiles = 0
    let currentFileIndex = 0

    // 处理Python输出
    pythonProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim()
      const lines = output.split('\n')

      for (const line of lines) {
        if (line.trim()) {
          console.log('Python输出:', line)

          // 解析进度信息
          if (line.startsWith('PROGRESS:')) {
            const parts = line.split(':')
            const progressType = parts[1]

            switch (progressType) {
              case 'TOTAL_FILES':
                totalFiles = parseInt(parts[2])
                sendMessage('progress', {
                  type: 'total_files',
                  total: totalFiles
                })
                break

              case 'FILE_START':
                currentFileIndex = parseInt(parts[2])
                sendMessage('progress', {
                  type: 'file_start',
                  current: currentFileIndex,
                  total: totalFiles
                })
                break

              case 'FILE_STEP':
                const fileIndex = parseInt(parts[2])
                const step = parts[3]
                const percentage = parseInt(parts[4])
                sendMessage('progress', {
                  type: 'file_step',
                  fileIndex,
                  step,
                  percentage
                })
                break

              case 'FILE_COMPLETE':
                const completedIndex = parseInt(parts[2])
                sendMessage('progress', {
                  type: 'file_complete',
                  completed: completedIndex,
                  total: totalFiles
                })
                break

              case 'FILE_ERROR':
                const errorIndex = parseInt(parts[2])
                const errorMsg = parts.slice(3).join(':')
                sendMessage('error', {
                  fileIndex: errorIndex,
                  message: errorMsg
                })
                break

              case 'ALL_FILES_COMPLETE':
                const completedFiles = parseInt(parts[2])
                const totalFilesFromPython = parseInt(parts[3])
                sendMessage('progress', {
                  type: 'all_complete',
                  completed: completedFiles,
                  total: totalFilesFromPython
                })
                sendMessage('info', { message: '所有文件拆分完成，开始创建ZIP...' })
                break
            }
          } else {
            // 普通日志信息
            sendMessage('log', { message: line })
          }
        }
      }
    })

    pythonProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString().trim()
      console.error('Python错误:', error)
      sendMessage('error', { message: error })
    })

    // 等待进程完成
    await new Promise<void>((resolve, reject) => {
      pythonProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Python脚本退出，代码: ${code}`))
        }
      })

      pythonProcess.on('error', (error: Error) => {
        reject(error)
      })

      // 设置5分钟超时
      setTimeout(() => {
        pythonProcess.kill()
        reject(new Error('执行超时'))
      }, 300000)
    })

    // 读取输出文件
    const outputFiles = await fs.readdir(outputDir)
    const docxFiles = outputFiles.filter(file => file.endsWith('.docx'))

    if (docxFiles.length === 0) {
      sendMessage('error', { message: '拆分失败，未生成任何文件' })
      event.node.res.end()
      return
    }

    // 创建ZIP文件
    sendMessage('info', { message: '正在创建ZIP文件...' })
    sendMessage('progress', {
      type: 'zip_start',
      total: docxFiles.length
    })

    const zip = new AdmZip()

    for (let i = 0; i < docxFiles.length; i++) {
      const docxFile = docxFiles[i]
      const filePath = join(outputDir, docxFile)
      zip.addLocalFile(filePath)

      // 发送ZIP创建进度
      const zipProgress = Math.round(((i + 1) / docxFiles.length) * 100)
      sendMessage('progress', {
        type: 'zip_progress',
        current: i + 1,
        total: docxFiles.length,
        percentage: zipProgress,
        fileName: docxFile
      })

      // 模拟一点延迟，让用户能看到进度
      if (docxFiles.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    // 保存ZIP文件
    const zipFileName = `split_${fileId}.zip`
    const zipPath = join(process.cwd(), 'uploads', zipFileName)
    zip.writeZip(zipPath)

    // 生成下载链接
    const downloadUrl = `/api/files/download-split/${fileId}`

    // 发送完成信息
    sendMessage('complete', {
      success: true,
      totalFiles: docxFiles.length,
      pagesPerFile: pages,
      files: docxFiles,
      downloadUrl,
      message: `成功拆分为 ${docxFiles.length} 个文件`
    })

  } catch (error: any) {
    console.error('拆分错误:', error.message)
    sendMessage('error', {
      message: error.message || '拆分失败'
    })
  }

  event.node.res.end()
})
