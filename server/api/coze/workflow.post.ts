// 解析Coze流式响应中的JSON数据
function parseStreamResponse(streamData: string): any {
  try {
    // Coze流式响应格式：SSE (Server-Sent Events)
    // 格式：id: xxx\nevent: xxx\ndata: {...}\n\n
    const lines = streamData.split('\n')
    let currentEvent = ''
    let messageData: any = null
    let allMessages: any[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 解析 event 行
      if (line.startsWith('event:')) {
        currentEvent = line.substring(6).trim()
      }

      // 解析 data 行
      if (line.startsWith('data:')) {
        const jsonStr = line.substring(5).trim()
        if (jsonStr && jsonStr !== '[DONE]') {
          try {
            const data = JSON.parse(jsonStr)

            // 只处理 Message 事件
            if (currentEvent === 'Message') {
              messageData = data
              allMessages.push(data)
            }
          } catch (e) {
            console.warn('解析JSON失败:', jsonStr)
          }
        }
      }
    }

    // 返回最后一个Message事件的数据，优先返回content
    if (messageData) {
      return {
        success: true,
        content: messageData.content || '',
        node_title: messageData.node_title,
        node_type: messageData.node_type,
        usage: messageData.usage,
        raw: messageData,
        allMessages,
      }
    }

    return {
      success: false,
      content: '',
      raw: streamData,
      message: '未找到Message事件',
    }
  } catch (error) {
    console.error('解析流式响应失败:', error)
    return {
      success: false,
      content: '',
      raw: streamData,
      error: String(error),
    }
  }
}

export default defineEventHandler(async event => {
  try {
    // Coze API配置
    const cozeApiToken =
      'pat_xWDrCp0SDw4cpegl3e9Af3ZO2ss8gi5SwNCd0P6NHoxYd5f8c00UrLMZ7uGuO8gu'
    const cozeApiUrl = 'https://api.coze.cn/v1/workflow/stream_run'

    // 接收单个文件URL
    const body = await readBody(event)
    const { fileUrl, tableSummary } = body

    if (!fileUrl || typeof fileUrl !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: '文件URL参数缺失或格式错误',
      })
    }

    console.log(`处理文件: ${fileUrl}`)

    // 调用Coze Workflow API
    const response = await $fetch<ReadableStream>(cozeApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cozeApiToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        workflow_id: '7573337879529062440',
        parameters: {
          bit1: 0,
          docx: fileUrl,
          table_summary: tableSummary || '文档分析',
        },
      },
    })

    console.log('Coze Workflow API响应开始...')

    // 处理流式数据
    const reader = response.pipeThrough(new TextDecoderStream()).getReader()
    let fullResponse = ''
    let hasError = false
    let errorInfo: any = null

    while (true) {
      const { value, done } = await reader.read()

      if (done) break

      fullResponse += value
      console.log('收到流式数据块:', value)

      // 检查是否有Error事件
      if (value.includes('event: Error')) {
        hasError = true
        // 提取error信息
        const lines = value.split('\n')
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('data:')) {
            try {
              const errorData = JSON.parse(lines[i].substring(5).trim())
              errorInfo = errorData
              break
            } catch (e) {
              console.error('解析错误数据失败:', e)
            }
          }
        }
      }
    }

    // 如果有错误，返回错误信息
    if (hasError && errorInfo) {
      return {
        success: false,
        error: true,
        error_code: errorInfo.error_code,
        error_message: errorInfo.error_message,
        debug_url: errorInfo.debug_url,
      }
    }

    // 解析流式响应中的JSON数据
    const parsedResult = parseStreamResponse(fullResponse)

    // 返回分析结果
    return {
      success: parsedResult.success,
      fileUrl,
      result: parsedResult,
    }
  } catch (error: any) {
    console.error('Coze Workflow API调用失败:', error)

    // 返回详细错误信息
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || error.statusMessage || 'Workflow调用失败',
    })
  }
})
