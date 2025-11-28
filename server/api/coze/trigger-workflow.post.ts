export default defineEventHandler(async event => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const cozePatToken = config.cozePatToken || process.env.COZE_PAT_TOKEN
    const workflowId = config.cozeWorkflowId || process.env.COZE_WORKFLOW_ID
    const spaceId = config.cozeSpaceId || process.env.COZE_SPACE_ID

    if (!cozePatToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Coze PAT Token 未配置',
      })
    }

    if (!workflowId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Coze Workflow ID 未配置',
      })
    }

    if (!body.fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fileId 参数缺失',
      })
    }

    // 调用 Coze 工作流 API
    const response = await $fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cozePatToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        workflow_id: workflowId,
        space_id: spaceId,
        parameters: {
          knowledge: {
            file_id: body.fileId,
          },
        },
      },
    })

    // @ts-ignore
    if (response.code !== 0) {
      throw createError({
        statusCode: 500,
        // @ts-ignore
        statusMessage: `工作流执行失败: ${response.msg}`,
      })
    }

    return {
      success: true,
      // @ts-ignore
      executeId: response.data.execute_id,
      // @ts-ignore
      data: response.data,
    }
  } catch (error: any) {
    console.error('工作流调用错误:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '工作流执行失败，请重试',
    })
  }
})
