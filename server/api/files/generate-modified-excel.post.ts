/**
 * 生成修正后的Excel文件
 * POST /api/files/generate-modified-excel
 */

import { defineEventHandler, readBody, createError } from 'h3'
import * as fs from 'fs'
import * as path from 'path'
import { extractModificationData, getModificationStats } from '~/server/utils/excelModificationExtractor'
import { runExcelModificationScript } from '~/server/utils/pythonRunner'

// 文件存储目录
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const MODIFIED_DIR = path.join(UPLOADS_DIR, 'modified')

export default defineEventHandler(async (event) => {
  try {
    // 读取请求体
    const body = await readBody(event)
    const { fileId, analysisResult, originalFileName } = body

    // 验证参数
    if (!fileId || !analysisResult || !originalFileName) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必要参数: fileId, analysisResult, originalFileName'
      })
    }

    // 验证文件是否为Excel格式
    const fileExt = path.extname(originalFileName).toLowerCase()
    if (!['.xlsx', '.xls'].includes(fileExt)) {
      throw createError({
        statusCode: 400,
        statusMessage: '文件格式不支持，仅支持.xlsx和.xls格式'
      })
    }

    // 提取修正数据
    const modificationData = extractModificationData(analysisResult)
    if (!modificationData || modificationData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'NO_MODIFICATION_DATA',
        data: { message: '分析结果中未包含可修正的数据' }
      })
    }

    // 查找原始文件
    const inputFile = findOriginalFile(fileId)
    if (!inputFile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'INVALID_FILE',
        data: { message: '原始文件不存在或已失效' }
      })
    }

    // 生成输出文件路径
    const modifiedFileName = generateModifiedFileName(originalFileName)
    const modifiedFileId = `modified_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const outputFile = path.join(MODIFIED_DIR, `${modifiedFileId}${fileExt}`)
    
    // 生成日志文件路径
    const logFile = path.join(MODIFIED_DIR, `${modifiedFileId}_log.json`)

    // 确保目录存在
    if (!fs.existsSync(MODIFIED_DIR)) {
      fs.mkdirSync(MODIFIED_DIR, { recursive: true })
    }

    console.log('开始生成修正Excel...')
    console.log('输入文件:', inputFile)
    console.log('输出文件:', outputFile)
    console.log('修正数据条数:', modificationData.length)

    // 调用Python脚本处理
    const scriptResult = await runExcelModificationScript(
      inputFile,
      outputFile,
      modificationData,
      logFile
    )

    if (!scriptResult.success) {
      console.error('Python脚本执行失败:', scriptResult.error)
      throw createError({
        statusCode: 500,
        statusMessage: 'PROCESS_FAILED',
        data: { message: scriptResult.error || 'Excel修正处理失败' }
      })
    }

    // 读取更新日志
    let updateLog: any[] = []
    if (fs.existsSync(logFile)) {
      try {
        const logContent = fs.readFileSync(logFile, 'utf-8')
        updateLog = JSON.parse(logContent)
      } catch (error) {
        console.warn('读取日志文件失败:', error)
      }
    }

    // 获取统计信息
    const stats = getModificationStats(modificationData)

    // 生成下载URL
    const downloadUrl = `/api/files/download-modified/${modifiedFileId}${fileExt}`

    // 返回结果
    return {
      success: true,
      modifiedFileId,
      fileName: modifiedFileName,
      downloadUrl,
      modificationCount: scriptResult.result?.processedRows || modificationData.length,
      updatedCells: scriptResult.result?.updatedCells || 0,
      skippedRows: scriptResult.result?.skippedRows || 0,
      updateLog: updateLog.slice(0, 10), // 只返回前10条日志
      stats,
      processingResult: scriptResult.result
    }
  } catch (error: any) {
    console.error('生成修正Excel失败:', error)
    
    // 如果已经是createError创建的错误,直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    throw createError({
      statusCode: 500,
      statusMessage: '生成修正Excel失败',
      data: { message: error.message || '未知错误' }
    })
  }
})

/**
 * 查找原始文件
 */
function findOriginalFile(fileId: string): string | null {
  // 尝试在uploads目录下查找
  const possiblePaths = [
    path.join(UPLOADS_DIR, fileId),
    path.join(UPLOADS_DIR, `${fileId}.xlsx`),
    path.join(UPLOADS_DIR, `${fileId}.xls`)
  ]

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  // 尝试递归查找 (在uploads的子目录中)
  try {
    const files = findFilesRecursive(UPLOADS_DIR, fileId)
    if (files.length > 0) {
      return files[0]
    }
  } catch (error) {
    console.warn('递归查找文件失败:', error)
  }

  return null
}

/**
 * 递归查找文件
 */
function findFilesRecursive(dir: string, fileName: string): string[] {
  const results: string[] = []
  
  if (!fs.existsSync(dir)) {
    return results
  }

  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      // 跳过modified目录避免循环
      if (file !== 'modified') {
        results.push(...findFilesRecursive(filePath, fileName))
      }
    } else if (file.includes(fileName)) {
      results.push(filePath)
    }
  }
  
  return results
}

/**
 * 生成修正后的文件名
 */
function generateModifiedFileName(originalFileName: string): string {
  const ext = path.extname(originalFileName)
  const baseName = path.basename(originalFileName, ext)
  return `${baseName}(修改后)${ext}`
}
