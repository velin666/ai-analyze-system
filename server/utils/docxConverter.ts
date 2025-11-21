import { readFile } from 'fs/promises'
import { parseStringPromise } from 'xml2js'
import AdmZip from 'adm-zip'

/**
 * DOCX转XML工具类
 * DOCX文件本质是一个包含XML文件的ZIP压缩包
 */

export interface DocxXmlContent {
  // 文档主内容
  document?: string
  // 样式定义
  styles?: string
  // 页眉
  header?: string
  // 页脚
  footer?: string
  // 文档关系
  rels?: string
  // 所有XML文件
  allXmlFiles?: Record<string, string>
}

/**
 * 从DOCX文件提取XML内容
 * @param filePath DOCX文件路径
 * @returns 包含各种XML内容的对象
 */
export async function extractXmlFromDocx(filePath: string): Promise<DocxXmlContent> {
  try {
    // 读取DOCX文件（实际是ZIP压缩包）
    const zip = new AdmZip(filePath)
    const zipEntries = zip.getEntries()

    const result: DocxXmlContent = {
      allXmlFiles: {}
    }

    // 遍历ZIP文件中的所有条目
    for (const entry of zipEntries) {
      if (!entry.isDirectory && entry.entryName.endsWith('.xml')) {
        const content = entry.getData().toString('utf8')

        // 根据文件路径分类存储
        if (entry.entryName === 'word/document.xml') {
          result.document = content
        } else if (entry.entryName === 'word/styles.xml') {
          result.styles = content
        } else if (entry.entryName.includes('header')) {
          result.header = content
        } else if (entry.entryName.includes('footer')) {
          result.footer = content
        } else if (entry.entryName.endsWith('.rels')) {
          result.rels = content
        }

        // 存储所有XML文件
        result.allXmlFiles![entry.entryName] = content
      }
    }

    return result
  } catch (error) {
    throw new Error(`Failed to extract XML from DOCX: ${error}`)
  }
}

/**
 * 将XML字符串解析为JavaScript对象
 * @param xmlString XML字符串
 * @returns 解析后的JavaScript对象
 */
export async function parseXmlToObject(xmlString: string): Promise<any> {
  try {
    return await parseStringPromise(xmlString, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true
    })
  } catch (error) {
    throw new Error(`Failed to parse XML: ${error}`)
  }
}

/**
 * 从DOCX提取纯文本内容
 * @param filePath DOCX文件路径
 * @returns 纯文本内容
 */
export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const xmlContent = await extractXmlFromDocx(filePath)

    if (!xmlContent.document) {
      throw new Error('No document.xml found in DOCX file')
    }

    // 解析document.xml
    const parsed = await parseXmlToObject(xmlContent.document)

    // 提取文本内容（简化版）
    const texts: string[] = []

    function extractText(obj: any) {
      if (!obj) return

      if (typeof obj === 'string') {
        texts.push(obj)
        return
      }

      if (Array.isArray(obj)) {
        obj.forEach(item => extractText(item))
        return
      }

      if (typeof obj === 'object') {
        // w:t标签包含实际文本
        if (obj['w:t']) {
          texts.push(obj['w:t'])
        }

        // 递归处理所有属性
        Object.values(obj).forEach(value => extractText(value))
      }
    }

    extractText(parsed)

    return texts.join(' ')
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error}`)
  }
}

/**
 * 将DOCX转换为格式化的XML字符串
 * @param filePath DOCX文件路径
 * @param includeAll 是否包含所有XML文件
 * @returns 格式化的XML字符串
 */
export async function convertDocxToFormattedXml(
  filePath: string,
  includeAll: boolean = false
): Promise<string> {
  const xmlContent = await extractXmlFromDocx(filePath)

  if (includeAll && xmlContent.allXmlFiles) {
    // 返回所有XML文件，用分隔符分开
    return Object.entries(xmlContent.allXmlFiles)
      .map(([name, content]) => {
        return `<!-- ${name} -->\n${content}\n`
      })
      .join('\n\n')
  }

  // 只返回主文档XML
  return xmlContent.document || ''
}
