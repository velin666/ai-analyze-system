# Coze 工作流文档分析功能使用说明

本文档说明如何使用 Coze 工作流实现文档轮询上传和 AI 分析功能。

## 功能概述

该功能实现了以下流程：

1. 用户上传文档（支持 PDF、DOC、DOCX、TXT 格式）
2. 文件自动上传到 Coze API
3. 触发 Coze 工作流进行文档分析
4. 前端轮询工作流状态
5. 展示分析结果

## 环境配置

### 1. 配置环境变量

在项目根目录创建 `.env` 文件（参考 `.env.example`），添加以下配置：

```bash
# Coze API Configuration
COZE_PAT_TOKEN=your_coze_pat_token_here          # Coze PAT 令牌
COZE_WORKFLOW_ID=7573337879529062440             # 工作流 ID
COZE_SPACE_ID=7571834108440510479                # 空间 ID

# 保留原有配置
COZE_API_KEY=your_coze_api_key_here
COZE_API_URL=https://api.coze.cn/v1/workflow/run
```

### 2. 获取 Coze 凭证

#### 获取 PAT Token

1. 登录 [Coze](https://www.coze.cn/)
2. 进入个人设置 -> API 密钥
3. 创建新的 PAT 令牌
4. 确保令牌拥有以下权限：
   - `uploadFile` - 文件上传权限
   - `workflow:run` - 工作流执行权限

#### 获取 Workflow ID

1. 在 Coze 中创建或打开你的工作流
2. 确保工作流已发布并启用"API 访问"权限
3. 在工作流设置中找到工作流 ID

#### 获取 Space ID

1. 在 Coze 工作区中查看空间设置
2. 复制空间 ID

## API 接口说明

### 1. 文件上传接口

**接口地址：** `POST /api/coze/upload-file`

**功能：** 上传文件到 Coze API

**请求参数：**

- `file`: 文件对象（multipart/form-data）

**响应示例：**

```json
{
  "success": true,
  "fileId": "file_123456",
  "filename": "document.pdf"
}
```

### 2. 工作流触发接口

**接口地址：** `POST /api/coze/trigger-workflow`

**功能：** 触发 Coze 工作流

**请求参数：**

```json
{
  "fileId": "file_123456"
}
```

**响应示例：**

```json
{
  "success": true,
  "executeId": "execute_789012",
  "data": {
    "execute_id": "execute_789012",
    "workflow_id": "7573337879529062440"
  }
}
```

### 3. 工作流状态查询接口

**接口地址：** `GET /api/coze/workflow-status?executeId={executeId}`

**功能：** 查询工作流执行状态

**请求参数：**

- `executeId`: 工作流执行 ID

**响应示例：**

```json
{
  "success": true,
  "executeId": "execute_789012",
  "status": "succeeded",  // running | succeeded | failed
  "output": {
    "missing_fields": [...],
    "text_errors": [...],
    "format_issues": [...],
    "summary": "文档分析完成"
  },
  "debugUrl": "https://www.coze.cn/workflow/debug/...",
  "errorMessage": null
}
```

## 前端使用

### 1. 文件上传分析

前端页面：`/main/document-analysis`

**使用步骤：**

1. 点击"选择文件"或拖拽文件到上传区域
2. 选择支持的文件格式（DOC、DOCX、PDF、TXT）
3. 点击"开始 AI 分析"按钮
4. 等待分析完成（自动轮询状态）
5. 查看分析结果

**核心代码：**

```typescript
// 文件上传到 Coze
const formData = new FormData()
formData.append('file', selectedFile.value)

const uploadResponse = await $fetch('/api/coze/upload-file', {
  method: 'POST',
  body: formData,
})

// 触发工作流
const workflowResponse = await $fetch('/api/coze/trigger-workflow', {
  method: 'POST',
  body: { fileId: uploadResponse.fileId },
})

// 轮询状态
await pollWorkflowStatus(workflowResponse.executeId)
```

### 2. 轮询机制

**轮询配置：**

- 最大轮询次数：60 次
- 轮询间隔：3 秒
- 总超时时间：3 分钟

**状态说明：**

- `running`: 工作流正在执行
- `succeeded`: 工作流执行成功
- `failed`: 工作流执行失败

## 工作流输出格式

工作流应该返回以下格式的 JSON 数据：

```json
{
  "missing_fields": [
    {
      "page_number": 1,
      "line_number": 15,
      "description": "缺少项目负责人签名"
    }
  ],
  "text_errors": [
    {
      "page_number": 1,
      "line_number": 10,
      "description": "拼写错误",
      "suggestion": "建议修改"
    }
  ],
  "format_issues": [
    {
      "page_number": 1,
      "line_number": 5,
      "description": "格式问题",
      "suggestion": "格式建议"
    }
  ],
  "missing_images": [
    {
      "page_number": 2,
      "description": "缺失图片说明"
    }
  ],
  "summary": "文档整体分析总结",
  "quality_score": 85
}
```

## 错误处理

### 常见错误及解决方案

1. **401 错误 - 未授权**

   - 检查 `COZE_PAT_TOKEN` 是否正确
   - 确认 PAT 令牌拥有必要权限

2. **工作流无响应**

   - 确认工作流已发布
   - 确认工作流启用了"API 访问"权限
   - 检查 `COZE_WORKFLOW_ID` 是否正确

3. **文件格式错误**

   - Coze 支持的格式：PDF、DOC、DOCX、TXT
   - 检查文件大小是否超过限制（默认 500MB）

4. **工作流执行超时**
   - 默认超时时间为 3 分钟
   - 可以调整 `pollWorkflowStatus` 中的参数增加超时时间

## 功能扩展

### 1. 添加文件大小限制

在 `upload-file.post.ts` 中添加：

```typescript
const maxFileSize = 100 * 1024 * 1024 // 100MB
if (file.data.length > maxFileSize) {
  throw createError({
    statusCode: 400,
    statusMessage: '文件大小超过限制（最大 100MB）',
  })
}
```

### 2. 添加进度条

使用 XMLHttpRequest 替代 fetch 实现上传进度：

```typescript
const xhr = new XMLHttpRequest()
xhr.upload.addEventListener('progress', e => {
  if (e.lengthComputable) {
    const percent = (e.loaded / e.total) * 100
    // 更新进度条
  }
})
```

### 3. 批量上传

循环调用上传接口：

```typescript
for (const file of files) {
  const formData = new FormData()
  formData.append('file', file)
  await $fetch('/api/coze/upload-file', {
    method: 'POST',
    body: formData,
  })
}
```

## 部署建议

1. **生产环境**

   - 启用 HTTPS 确保传输安全
   - 使用环境变量管理敏感信息
   - 设置合理的请求超时时间

2. **性能优化**

   - 实现文件上传缓存
   - 添加请求队列避免并发过多
   - 优化轮询间隔减少服务器压力

3. **监控日志**
   - 记录所有 API 调用
   - 监控工作流执行状态
   - 设置异常告警

## 测试步骤

1. 确保环境变量配置正确
2. 启动开发服务器：`npm run dev`
3. 访问 `/main/document-analysis` 页面
4. 上传测试文件
5. 观察控制台日志和网络请求
6. 验证分析结果显示

## 文件清单

- `server/api/coze/upload-file.post.ts` - 文件上传接口
- `server/api/coze/trigger-workflow.post.ts` - 工作流触发接口
- `server/api/coze/workflow-status.get.ts` - 状态查询接口
- `pages/main/document-analysis.vue` - 前端页面
- `.env.example` - 环境变量示例
- `nuxt.config.ts` - Nuxt 配置

## 技术支持

如遇问题，请检查：

1. Coze API 文档：https://www.coze.cn/docs
2. 项目日志文件
3. 浏览器控制台错误信息
