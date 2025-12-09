/**
 * Excel修正数据提取工具
 * 从AI分析结果中提取修正数据数组
 */

/**
 * 从AI分析结果中提取修正数据
 * @param analysisResult AI分析结果对象
 * @returns 修正数据数组或null
 */
export function extractModificationData(analysisResult: any): any[] | null {
  if (!analysisResult || !analysisResult.content) {
    return null
  }

  const content = analysisResult.content

  try {
    // 步骤1: 文本清理
    let cleanedContent = cleanText(content)

    // 步骤2: 提取JSON数组
    const jsonArrays = extractJsonArrays(cleanedContent)

    if (jsonArrays.length === 0) {
      return null
    }

    // 步骤3: 合并所有数组
    const allData: any[] = []
    for (const arr of jsonArrays) {
      if (Array.isArray(arr)) {
        allData.push(...arr)
      }
    }

    // 步骤4: 验证数据
    const validData = allData.filter(item => validateModificationObject(item))

    return validData.length > 0 ? validData : null
  } catch (error) {
    console.error('提取修正数据失败:', error)
    return null
  }
}

/**
 * 文本清理 - 移除Markdown标记、URL链接等
 */
function cleanText(text: string): string {
  // 移除Markdown链接 [text](url)
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
  
  // 移除**加粗**标记
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  
  // 移除其他Markdown格式
  text = text.replace(/^\s*[-*+#]\s+/gm, '')
  
  return text
}

/**
 * 提取所有JSON数组片段
 */
function extractJsonArrays(text: string): any[] {
  const arrays: any[] = []
  
  // 正则匹配JSON数组 (支持多行和嵌套)
  // 匹配 [ ... ] 格式
  const arrayRegex = /\[\s*\{[\s\S]*?\}\s*\]/g
  
  let match
  while ((match = arrayRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed)) {
        arrays.push(parsed)
      }
    } catch (e) {
      // 尝试修复常见的JSON格式问题
      try {
        const fixed = fixJsonFormat(match[0])
        const parsed = JSON.parse(fixed)
        if (Array.isArray(parsed)) {
          arrays.push(parsed)
        }
      } catch (e2) {
        // 忽略无法解析的片段
        console.warn('无法解析JSON片段:', match[0].substring(0, 100))
      }
    }
  }
  
  return arrays
}

/**
 * 修复常见的JSON格式问题
 */
function fixJsonFormat(jsonStr: string): string {
  // 替换中文冒号为英文冒号
  jsonStr = jsonStr.replace(/:/g, ':')
  
  // 替换中文逗号为英文逗号
  jsonStr = jsonStr.replace(/,/g, ',')
  
  // 替换中文引号为英文引号
  jsonStr = jsonStr.replace(/"/g, '"').replace(/"/g, '"')
  
  return jsonStr
}

/**
 * 验证修正对象是否有效
 */
function validateModificationObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  // 统计非空字段数量
  let validFields = 0
  for (const key in obj) {
    const value = obj[key]
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      validFields++
    }
  }

  // 至少需要2个非空字段
  return validFields >= 2
}

/**
 * 检查分析结果是否包含修正数据
 */
export function hasModificationData(analysisResult: any): boolean {
  const data = extractModificationData(analysisResult)
  return data !== null && data.length > 0
}

/**
 * 获取修正统计信息
 */
export function getModificationStats(modificationData: any[]): {
  totalCount: number
  fieldStats: Record<string, number>
} {
  const fieldStats: Record<string, number> = {}
  
  for (const item of modificationData) {
    for (const key in item) {
      if (item[key] !== null && item[key] !== undefined && String(item[key]).trim() !== '') {
        fieldStats[key] = (fieldStats[key] || 0) + 1
      }
    }
  }
  
  return {
    totalCount: modificationData.length,
    fieldStats
  }
}
