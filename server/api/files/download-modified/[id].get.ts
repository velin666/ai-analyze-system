/**
 * 下载修正后的Excel文件
 * GET /api/files/download-modified/[id]
 */

import { defineEventHandler, sendStream, createError } from 'h3'
import * as fs from 'fs'
import * as path from 'path'
import { createReadStream } from 'fs'

const MODIFIED_DIR = path.join(process.cwd(), 'uploads', 'modified')

export default defineEventHandler(async (event) => {
  try {
    // 从路由参数获取文件名 (包含扩展名)
    const fileName = event.context.params?.id
    
    if (!fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少文件标识'
      })
    }

    // 构建文件路径
    const filePath = path.join(MODIFIED_DIR, fileName)

    // 验证文件存在
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        statusMessage: '文件不存在或已过期'
      })
    }

    // 验证文件安全性 (防止路径遍历攻击)
    const resolvedPath = path.resolve(filePath)
    const resolvedDir = path.resolve(MODIFIED_DIR)
    if (!resolvedPath.startsWith(resolvedDir)) {
      throw createError({
        statusCode: 403,
        statusMessage: '非法的文件路径'
      })
    }

    // 读取文件信息
    const stats = fs.statSync(filePath)
    const fileExt = path.extname(fileName)
    
    // 设置响应头
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    event.node.res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    event.node.res.setHeader('Content-Length', stats.size)

    // 发送文件流
    const fileStream = createReadStream(filePath)
    return sendStream(event, fileStream)
  } catch (error: any) {
    console.error('下载修正文件失败:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '下载文件失败',
      data: { message: error.message || '未知错误' }
    })
  }
})
