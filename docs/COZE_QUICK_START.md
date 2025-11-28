# Coze 工作流快速开始指南

## 快速配置（5 分钟）

### 1. 配置环境变量

复制 `.env.example` 到 `.env`，填入你的 Coze 凭证：

```bash
# 必填项
COZE_PAT_TOKEN=pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****  # 替换为你的 PAT Token
COZE_WORKFLOW_ID=7573337879529062440                # 替换为你的工作流 ID
COZE_SPACE_ID=7571834108440510479                   # 替换为你的空间 ID
```

### 2. 启动服务

```bash
# 安装依赖（如果还没安装）
pnpm install

# 启动开发服务器
pnpm dev
```

### 3. 访问页面

浏览器打开：`http://localhost:5200/main/document-analysis`

## 功能测试

### 测试文件上传分析

1. **上传文件**

   - 点击"选择文件"或拖拽文件到上传区域
   - 选择一个 PDF、DOCX 或 TXT 文件
   - 文件会显示在下方

2. **开始分析**

   - 点击"开始 AI 分析"按钮
   - 观察进度条变化：
     - 20% - 文件上传中
     - 40% - 触发工作流
     - 60-90% - 工作流执行中
     - 100% - 分析完成

3. **查看结果**
   - 右侧显示分析结果
   - 包含：漏填项、文字错误、格式问题、缺失图片
   - 可以导出为 JSON 报告

### 测试文本输入分析

1. 在"文本直接输入"区域输入或粘贴文本
2. 点击"开始 AI 分析"
3. 查看分析结果

## 接口测试

### 使用 Postman/cURL 测试

#### 1. 测试文件上传

```bash
curl -X POST http://localhost:5200/api/coze/upload-file \
  -F "file=@/path/to/your/document.pdf"
```

**期望响应：**

```json
{
  "success": true,
  "fileId": "file_xxx",
  "filename": "document.pdf"
}
```

#### 2. 测试工作流触发

```bash
curl -X POST http://localhost:5200/api/coze/trigger-workflow \
  -H "Content-Type: application/json" \
  -d '{"fileId": "file_xxx"}'
```

**期望响应：**

```json
{
  "success": true,
  "executeId": "execute_xxx",
  "data": {...}
}
```

#### 3. 测试状态查询

```bash
curl "http://localhost:5200/api/coze/workflow-status?executeId=execute_xxx"
```

**期望响应：**

```json
{
  "success": true,
  "executeId": "execute_xxx",
  "status": "succeeded",
  "output": {...}
}
```

## 常见问题排查

### 问题 1: "Coze PAT Token 未配置"

**原因：** 环境变量未正确设置

**解决：**

1. 检查 `.env` 文件是否存在
2. 确认 `COZE_PAT_TOKEN` 已填写
3. 重启开发服务器

### 问题 2: "工作流执行失败"

**原因：** 工作流配置问题

**解决：**

1. 登录 Coze 确认工作流已发布
2. 检查工作流是否启用"API 访问"
3. 确认 `COZE_WORKFLOW_ID` 正确

### 问题 3: "工作流执行超时"

**原因：** 工作流执行时间过长

**解决：**

1. 检查工作流节点配置
2. 增加轮询超时时间（修改 `pollWorkflowStatus` 的 `maxAttempts`）
3. 优化工作流性能

### 问题 4: 文件上传失败

**原因：** 文件格式或大小问题

**解决：**

1. 确认文件格式（支持 PDF、DOC、DOCX、TXT）
2. 检查文件大小（默认限制 500MB）
3. 查看浏览器控制台错误信息

## 调试技巧

### 1. 查看服务器日志

开发服务器会输出详细的请求日志：

```bash
# 服务器控制台会显示
文件上传错误: ...
工作流调用错误: ...
查询工作流状态错误: ...
```

### 2. 查看浏览器控制台

打开浏览器开发者工具（F12）：

- **Network 标签**：查看 API 请求和响应
- **Console 标签**：查看前端日志和错误

### 3. 使用 Coze Debug URL

工作流执行后会返回 `debugUrl`，可以在 Coze 平台查看详细执行过程。

## 进阶配置

### 自定义轮询参数

在 `pages/main/document-analysis.vue` 中修改：

```typescript
const pollWorkflowStatus = async (executeId: string) => {
  const maxAttempts = 60 // 最大轮询次数（默认60次）
  const pollInterval = 3000 // 轮询间隔（默认3秒）

  // ... 其他代码
}
```

### 自定义工作流参数

在 `server/api/coze/trigger-workflow.post.ts` 中修改：

```typescript
body: {
  workflow_id: workflowId,
  space_id: spaceId,
  parameters: {
    knowledge: {
      file_id: body.fileId
    },
    // 添加自定义参数
    customParam: 'value'
  }
}
```

## 下一步

- 阅读完整文档：[COZE_WORKFLOW_USAGE.md](./COZE_WORKFLOW_USAGE.md)
- 查看 Coze 官方文档：https://www.coze.cn/docs
- 自定义工作流输出格式
- 添加更多分析功能

## 反馈与支持

如有问题或建议，请：

1. 查看项目文档
2. 检查日志文件
3. 提交 Issue
