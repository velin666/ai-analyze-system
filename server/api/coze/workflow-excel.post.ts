// 解析Coze流式响应中的JSON数据（复用与Word一致）
function parseStreamResponse(streamData: string): any {
  try {
    const lines = streamData.split('\n')
    let currentEvent = ''
    let messageData: any = null
    let allMessages: any[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith('event:')) {
        currentEvent = line.substring(6).trim()
      }

      if (line.startsWith('data:')) {
        const jsonStr = line.substring(5).trim()
        if (jsonStr && jsonStr !== '[DONE]') {
          try {
            const data = JSON.parse(jsonStr)
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

export default defineEventHandler(async (event) => {
  try {
    // 优先从运行时配置/环境变量获取PAT，否则退回默认
    const config = useRuntimeConfig()
    const cozeApiToken =
      config.cozePatToken ||
      process.env.COZE_PAT_TOKEN ||
      'pat_Dr8otUlZVC7BK52HCOAmSWgBa1f5CV7KIqK61H6RCf4tIURWsBufAsAh36zWStrQ'
    const cozeApiUrl = 'https://api.coze.cn/v1/workflow/stream_run'

    const body = await readBody(event)
    const { fileUrl, workRequirements, tableSummary } = body

    if (!fileUrl || typeof fileUrl !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: '文件URL参数缺失或格式错误',
      })
    }

    console.log(`处理Excel文件: ${fileUrl}`)
    console.log(`WorkRequirements: ${workRequirements}`)

    // 调用Coze Workflow API（Excel工作流ID，入参包含WorkRequirements）
    const workflowId = process.env.COZE_WORKFLOW_EXCEL_ID || '7577415655923925027'

    const response = await $fetch(cozeApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cozeApiToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        workflow_id: workflowId,
        parameters: {
          WorkRequirements: workRequirements || '',
          bit1: 0,
          docx: fileUrl,
          table_summary: tableSummary || 'Excel分析',
        },
      },
    })

    console.log('Coze Excel Workflow API响应开始...')

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

      // 检查Error事件
      if (value.includes('event: Error')) {
        hasError = true
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
    console.error('Coze Excel Workflow API调用失败:', error)

    // 返回详细错误信息
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || error.statusMessage || 'Excel Workflow调用失败',
    })
  }
})
