import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'
import AdmZip from 'adm-zip'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const { fileId, pagesPerFile = 30, originalName } = query
  const pages = parseInt(pagesPerFile as string) || 30

  if (!fileId) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少文件ID',
    })
  }

  // 获取原文件名（不含扩展名）
  const baseFileName = originalName 
    ? (originalName as string).replace(/\.docx$/i, '') 
    : fileId as string

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

    // 清理旧的输出目录（如果存在）
    try {
      await fs.rm(outputDir, { recursive: true, force: true })
    } catch (error) {
      // 忽略目录不存在的错误
    }

    // 创建全新的输出目录
    await fs.mkdir(outputDir, { recursive: true })

    sendMessage('info', { message: '开始处理文件...' })

    // 构建Python脚本命令 - 使用跨平台统一脚本
    const scriptPath = join(
      process.cwd(),
      'server',
      'api',
      'files',
      'split_docx_pages_unified.py'
    )

    sendMessage('info', { message: '检测平台并初始化处理器...' })

    // 启动Python进程，传递原始文件名
    const pythonProcess = spawn(
      'python',
      [scriptPath, inputPath, outputDir, pages.toString(), baseFileName],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    )

    let totalFiles = 0
    let currentFileIndex = 0
    let stdoutBuffer = ''
    let stderrBuffer = ''

    // 处理Python输出
    pythonProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim()
      stdoutBuffer += output + '\n'
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
                  total: totalFiles,
                })
                break

              case 'FILE_START':
                currentFileIndex = parseInt(parts[2])
                sendMessage('progress', {
                  type: 'file_start',
                  current: currentFileIndex,
                  total: totalFiles,
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
                  percentage,
                })
                break

              case 'FILE_COMPLETE':
                const completedIndex = parseInt(parts[2])
                sendMessage('progress', {
                  type: 'file_complete',
                  completed: completedIndex,
                  total: totalFiles,
                })
                break

              case 'FILE_ERROR':
                const errorIndex = parseInt(parts[2])
                const errorMsg = parts.slice(3).join(':')
                sendMessage('error', {
                  fileIndex: errorIndex,
                  message: errorMsg,
                })
                break

              case 'ALL_FILES_COMPLETE':
                const completedFiles = parseInt(parts[2])
                const totalFilesFromPython = parseInt(parts[3])
                sendMessage('progress', {
                  type: 'all_complete',
                  completed: completedFiles,
                  total: totalFilesFromPython,
                })
                sendMessage('info', {
                  message: '所有文件拆分完成，开始创建ZIP...',
                })
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
      stderrBuffer += error + '\n'
      console.error('Python错误:', error)
      sendMessage('error', { message: error })
    })

    // 等待进程完成
    await new Promise<void>((resolve, reject) => {
      pythonProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve()
        } else {
          console.error('='.repeat(60))
          console.error('Python 脚本执行失败')
          console.error('='.repeat(60))
          console.error('退出代码:', code)
          console.error(
            '命令:',
            `python ${scriptPath} ${inputPath} ${outputDir} ${pages}`
          )
          console.error('\n标准输出 (stdout):')
          console.error(stdoutBuffer || '(无输出)')
          console.error('\n标准错误 (stderr):')
          console.error(stderrBuffer || '(无错误输出)')
          console.error('='.repeat(60))

          const errorMsg =
            stderrBuffer || stdoutBuffer || `Python脚本退出，代码: ${code}`
          reject(new Error(errorMsg))
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

    // 读取输出文件并获取文件大小
    const outputFiles = await fs.readdir(outputDir)
    const docxFileNames = outputFiles.filter(file => file.endsWith('.docx'))

    if (docxFileNames.length === 0) {
      sendMessage('error', { message: '拆分失败，未生成任何文件' })
      event.node.res.end()
      return
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
    sendMessage('info', { message: '正在创建ZIP文件...' })
    sendMessage('progress', {
      type: 'zip_start',
      total: docxFiles.length,
    })

    const zip = new AdmZip()

    for (let i = 0; i < docxFiles.length; i++) {
      const docxFile = docxFiles[i]
      const filePath = join(outputDir, docxFile.name)
      zip.addLocalFile(filePath)

      // 发送ZIP创建进度
      const zipProgress = Math.round(((i + 1) / docxFiles.length) * 100)
      sendMessage('progress', {
        type: 'zip_progress',
        current: i + 1,
        total: docxFiles.length,
        percentage: zipProgress,
        fileName: docxFile.name,
      })

      // 模拟一点延迟，让用户能看到进度
      if (docxFiles.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    // 保存ZIP文件
    const zipFileName = `split_${fileId}.zip`
    const zipPath = join(process.cwd(), 'uploads', zipFileName)

    // 删除旧的ZIP文件（如果存在）
    try {
      await fs.unlink(zipPath)
    } catch (error) {
      // 忽略文件不存在的错误
    }

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
      message: `成功拆分为 ${docxFiles.length} 个文件`,
    })
  } catch (error: any) {
    console.error('拆分错误:', error.message)
    sendMessage('error', {
      message: error.message || '拆分失败',
    })
  }

  event.node.res.end()
})
