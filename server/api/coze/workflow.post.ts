export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { workflow_id, parameters } = body

    if (!workflow_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'workflow_id不能为空'
      })
    }

    if (!parameters) {
      throw createError({
        statusCode: 400,
        statusMessage: 'parameters不能为空'
      })
    }

    // Coze API配置
    const cozeApiToken = 'cztei_hb0jiElxbrOyBJYn0wbBKZMTfUJTUcWltqtjLoOvQo51G6pBILr8MVnF4ws2dS66D'
    const cozeApiUrl = 'https://api.coze.cn/v1/workflow/run'

    console.log('调用Coze Workflow API:', {
      workflow_id,
      xml_length: parameters.xml_content?.length || 0,
      table_summary: parameters.table_summary
    })

    // 调用Coze Workflow API
    const response = await $fetch(cozeApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeApiToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        workflow_id,
        parameters
      }
    })

    console.log('Coze Workflow API响应:', response)

    return {
      success: true,
      data: response
    }

  } catch (error: any) {
    console.error('Coze Workflow API调用失败:', error)
    
    // 返回详细错误信息
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || error.statusMessage || 'Workflow调用失败'
    })
  }
})
