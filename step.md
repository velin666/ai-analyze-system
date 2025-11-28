以下是基于 Nuxt3 实现 Coze 工作流调用的完整方案，适配你提供的工作流 ID（7573337879529062440），包含服务器端 API 封装和客户端组件：
一、项目结构 plaintextnuxt-coze-demo/
├── server/
│ └── api/
│ ├── upload-file.post.ts # 文件上传接口
│ └── trigger-workflow.post.ts # 工作流触发接口
├── components/
│ └── CozeUploader.vue # 上传组件
├── .env # 环境变量
└── nuxt.config.ts # 配置文件

二、环境配置

创建.env 文件
env# .env
COZE_PAT_TOKEN=pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP \*\*\*\* # 替换为实际 PAT 令牌
COZE_WORKFLOW_ID=7573337879529062440 # 工作流 ID
COZE_SPACE_ID=7571834108440510479 # 空间 ID

配置 Nuxt3（nuxt.config.ts）
typescriptexport default defineNuxtConfig({
runtimeConfig: {
coze: {
patToken: process.env.COZE_PAT_TOKEN,
workflowId: process.env.COZE_WORKFLOW_ID,
spaceId: process.env.COZE_SPACE_ID
},
public: {
// 客户端可访问的配置
}
}
})

三、服务器端 API 实现

1. 文件上传接口（server/api/upload-file.post.ts）typescriptimport { readMultipartFormData } from 'h3'
   import FormData from 'form-data'
   import axios from 'axios'

export default defineEventHandler(async (event) => {
// 获取 Nuxt 配置
const config = useRuntimeConfig()

// 读取客户端上传的文件
const formData = await readMultipartFormData(event)
if (!formData) {
throw createError({ statusCode: 400, statusMessage: '未找到文件' })
}

const file = formData.find(item => item.name === 'file')
if (!file) {
throw createError({ statusCode: 400, statusMessage: '文件参数缺失' })
}

// 调用 Coze 文件上传 API
const cozeFormData = new FormData()
cozeFormData.append('file', Buffer.from(file.data), {
filename: file.filename || 'upload.pdf'
})

try {
const response = await axios.post('https://api.coze.cn/v1/files/upload', cozeFormData, {
headers: {
'Authorization': `Bearer ${config.coze.patToken}`,
...cozeFormData.getHeaders()
},
maxBodyLength: 500 _ 1024 _ 1024 // 500MB 限制
})

    if (response.data.code !== 0) {
      throw createError({
        statusCode: 500,
        statusMessage: `Coze上传失败: ${response.data.msg}`
      })
    }

    return { fileId: response.data.data.id }

} catch (error) {
console.error('文件上传错误:', error)
throw createError({
statusCode: 500,
statusMessage: '文件上传失败，请重试'
})
}
})

2. 工作流触发接口（server/api/trigger-workflow.post.ts）typescriptimport axios from 'axios'

export default defineEventHandler(async (event) => {
const config = useRuntimeConfig()
const body = await readBody(event)

if (!body.fileId) {
throw createError({ statusCode: 400, statusMessage: 'fileId 参数缺失' })
}

try {
const response = await axios.post('https://api.coze.cn/v1/workflow/run', {
workflow_id: config.coze.workflowId,
space_id: config.coze.spaceId,
parameters: {
knowledge: { file_id: body.fileId } // 与工作流节点参数匹配
}
}, {
headers: {
'Authorization': `Bearer ${config.coze.patToken}`,
'Content-Type': 'application/json'
}
})

    if (response.data.code !== 0) {
      throw createError({
        statusCode: 500,
        statusMessage: `工作流执行失败: ${response.data.msg}`
      })
    }

    return response.data.data

} catch (error) {
console.error('工作流调用错误:', error)
throw createError({
statusCode: 500,
statusMessage: '工作流执行失败，请重试'
})
}
})

四、客户端上传组件（components/CozeUploader.vue）vue<script setup lang="ts">
const { status, data: fileId, error } = await useAsyncData('uploadFile', () => ({ fileId: null }))
const workflowStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const workflowResult = ref(null)

// 文件上传处理
const handleFileUpload = async (e: Event) => {
const file = (e.target as HTMLInputElement).files?.[0]
if (!file) return

// 步骤 1: 上传文件到服务器端 API
status.value = 'pending'
try {
const formData = new FormData()
formData.append('file', file)

    const uploadResponse = await $fetch('/api/upload-file', {
      method: 'POST',
      body: formData
    })

    // 步骤2: 触发工作流
    workflowStatus.value = 'loading'
    const workflowResponse = await $fetch('/api/trigger-workflow', {
      method: 'POST',
      body: { fileId: uploadResponse.fileId }
    })

    workflowResult.value = workflowResponse
    workflowStatus.value = 'success'
    alert('文件已成功上传到知识库！')

} catch (err) {
console.error('上传失败:', err)
workflowStatus.value = 'error'
} finally {
status.value = 'success'
}
}

<template>
  <div class="upload-container">
    <input 
      type="file" 
      @change="handleFileUpload" 
      accept=".pdf,.doc,.docx,.txt"  <!-- 支持的文件格式 -->
    />

    <div v-if="workflowStatus === 'loading'">
      <p>正在处理文件，请稍候...


    <div v-if="workflowStatus === 'success'">
      <h3>处理成功！
      <pre>{{ workflowResult }}


    <div v-if="workflowStatus === 'error'">
      <p class="error">处理失败，请重试

<style scoped>
.upload-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
.error {
  color: #ef4444;
}

五、页面使用（pages/index.vue）vue<template>
  <div>
    <h1>Coze知识库文件上传
    <CozeUploader />
  

六、关键特性说明

安全设计

令牌存储在服务器端，客户端无法直接访问
通过Nuxt3的API路由代理所有Coze请求


错误处理

服务器端使用h3的createError统一错误处理
客户端显示友好的状态提示


文件类型限制

客户端通过accept属性限制上传格式
服务器端可进一步验证文件MIME类型


工作流参数传递

严格匹配工作流节点的参数名（knowledge.file_id）
空间ID通过环境变量传递，支持多环境配置



七、部署与扩展

部署建议

使用Vercel或Netlify部署Nuxt3应用
生产环境启用HTTPS确保传输安全


功能扩展

添加文件大小限制（server/api/upload-file.post.ts）
实现批量上传（循环调用上传接口）
添加上传进度条（使用XMLHttpRequest替代fetch）



八、常见问题排查

**401错误 **：检查PAT令牌是否有效，需包含uploadFile和workflow:run权限
**工作流无响应 **：确认工作流已发布并启用"API访问"权限
文件格式错误：Coze知识库支持格式为PDF/DOC/DOCX/TXT，其他格式会被拒绝
