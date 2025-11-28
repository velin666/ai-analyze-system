import { readMultipartFormData } from 'h3'
import FormData from 'form-data'

export default defineEventHandler(async event => {
  try {
    // 获取 Nuxt 配置
    const config = useRuntimeConfig()
    const cozePatToken = config.cozePatToken || process.env.COZE_PAT_TOKEN

    if (!cozePatToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Coze PAT Token 未配置',
      })
    }

    // 读取客户端上传的文件
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: '未找到文件',
      })
    }

    const file = formData.find(item => item.name === 'file')
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: '文件参数缺失',
      })
    }

    // 调用 Coze 文件上传 API
    const cozeFormData = new FormData()
    cozeFormData.append('file', Buffer.from(file.data), {
      filename: file.filename || 'upload.pdf',
    })

    const response = await $fetch('https://api.coze.cn/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cozePatToken}`,
        ...cozeFormData.getHeaders(),
      },
      body: cozeFormData,
      // @ts-ignore
      duplex: 'half',
    })

    // @ts-ignore
    if (response.code !== 0) {
      throw createError({
        statusCode: 500,
        // @ts-ignore
        statusMessage: `Coze上传失败: ${response.msg}`,
      })
    }

    return {
      success: true,
      // @ts-ignore
      fileId: response.data.id,
      // @ts-ignore
      filename: file.filename,
    }
  } catch (error: any) {
    console.error('文件上传错误:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '文件上传失败，请重试',
    })
  }
})
