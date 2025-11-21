import { join } from 'path'
import { promises as fs } from 'fs'
import {
  extractXmlFromDocx,
  parseXmlToObject,
  extractTextFromDocx,
  convertDocxToFormattedXml
} from '~/server/utils/docxConverter'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { fileId, format = 'xml' } = body

    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File ID is required'
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

    // 根据请求的格式返回不同内容
    switch (format) {
      case 'xml': {
        // 返回原始XML内容
        const xmlContent = await extractXmlFromDocx(filePath)
        return {
          success: true,
          format: 'xml',
          data: xmlContent
        }
      }

      case 'xml-formatted': {
        // 返回格式化的完整XML字符串
        const formattedXml = await convertDocxToFormattedXml(filePath, true)
        return {
          success: true,
          format: 'xml-formatted',
          data: formattedXml
        }
      }

      case 'json': {
        // 将主文档XML解析为JSON对象
        const xmlContent = await extractXmlFromDocx(filePath)
        if (!xmlContent.document) {
          throw createError({
            statusCode: 500,
            statusMessage: 'No document content found'
          })
        }
        const jsonData = await parseXmlToObject(xmlContent.document)
        return {
          success: true,
          format: 'json',
          data: jsonData
        }
      }

      case 'text': {
        // 提取纯文本内容
        const text = await extractTextFromDocx(filePath)
        return {
          success: true,
          format: 'text',
          data: text
        }
      }

      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid format. Supported: xml, xml-formatted, json, text'
        })
    }

  } catch (error: any) {
    console.error('DOCX conversion error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Conversion failed'
    })
  }
})
