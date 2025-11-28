export default defineEventHandler(async event => {
  try {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const cozePatToken = config.cozePatToken || process.env.COZE_PAT_TOKEN
    const executeId = query.executeId as string

    if (!cozePatToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Coze PAT Token 未配置',
      })
    }

    if (!executeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'executeId 参数缺失',
      })
    }

    // 调用 Coze 工作流状态查询 API
    const response = await $fetch(
      `https://api.coze.cn/v1/workflow/run/histories/${executeId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cozePatToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // @ts-ignore
    if (response.code !== 0) {
      throw createError({
        statusCode: 500,
        // @ts-ignore
        statusMessage: `查询工作流状态失败: ${response.msg}`,
      })
    }

    // @ts-ignore
    const workflowData = response.data

    return {
      success: true,
      executeId: executeId,
      status: workflowData.execute_status, // running, succeeded, failed
      output: workflowData.output,
      debugUrl: workflowData.debug_url,
      errorMessage: workflowData.error_message,
      data: workflowData,
    }
  } catch (error: any) {
    console.error('查询工作流状态错误:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '查询工作流状态失败',
    })
  }
})
