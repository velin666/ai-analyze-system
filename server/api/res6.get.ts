// TEST_FILE: 测试用API - 读取res6.md内容
import { promises as fs } from 'fs'
import { join } from 'path'

export default defineEventHandler(async () => {
  try {
    const filePath = join(process.cwd(), 'server', 'api', 'res6.md')
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `读取res6.md失败: ${error.message}`
    })
  }
})
