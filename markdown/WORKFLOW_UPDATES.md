# 文档分析功能更新说明

## 更新日期

2024-12-03

## 更新内容

### 1. 后端修改 - workflow.post.ts

**文件位置**: `server/api/coze/workflow.post.ts`

**主要更改**:

- 从批量处理改为单个文件处理
- 接收参数从 `fileUrls[]` 改为单个 `fileUrl`
- 添加 Error 事件检测和处理
- 当收到 `event: Error` 时，返回包含错误信息的响应

**返回格式**:

- 成功: `{ success: true, fileUrl, result }`
- 失败: `{ success: false, error: true, error_code, error_message, debug_url }`

### 2. 批量导出 API

**文件位置**: `server/api/reports/batch-export.post.ts`

**功能**:

- 接收报告 URL 数组
- 下载所有报告文件
- 打包成 ZIP 文件
- 返回 ZIP 下载 URL

**接口**:

```
POST /api/reports/batch-export
Body: { reportUrls: string[] }
Response: { success: true, downloadUrl, fileName, totalFiles }
```

### 3. 前端修改 - document-analysis.vue

**文件位置**: `pages/main/document-analysis.vue`

#### 3.1 新增响应式数据

- `analysisResults`: 存储所有文件的分析结果数组
- `currentPage`: 当前页码
- `pageSize`: 每页显示数量

#### 3.2 新增函数

**Toast 提示函数**:

```javascript
showToast(message, type) // type: 'success' | 'error' | 'warning'
```

**URL 提取函数**:

```javascript
extractUrls(content) // 从content中提取所有.docx文件URL
```

**导出函数**:

- `exportSingleReport(url, fileName)`: 下载单个报告
- `batchExportReports()`: 批量导出所有报告为 ZIP

#### 3.3 修改的函数

**analyzeWithCozeWorkflow**:

- 在前端循环调用 API，每次处理一个文件
- 检测 Error 事件并通过 toast 提示用户
- 记录每个文件的分析结果（包括成功和失败）
- 显示进度：`正在分析第 X/Y 个文件...`

#### 3.4 UI 更新

**分页展示**:

- 显示所有文件的分析结果
- 每个文件卡片显示：
  - 文件索引和状态标签（成功/失败）
  - 错误信息（如果失败）
  - Content 内容（如果成功）
  - 提取的报告 URL 列表
  - 每个 URL 的下载按钮

**批量导出按钮**:

- 仅当有报告 URL 时显示
- 显示报告数量
- 点击后在后台打包成 ZIP 并下载

**分页控件**:

- 上一页/下一页按钮
- 页码显示

## 使用流程

1. **上传文档**: 用户上传单个或拆分的文档
2. **开始分析**: 点击"开始 AI 分析"按钮
3. **循环处理**: 前端依次调用 API 处理每个文件
4. **错误提示**: 如遇 Error 事件，弹出 toast 提示错误信息
5. **查看结果**: 分页查看每个文件的分析结果
6. **导出报告**:
   - 单个导出: 点击每个 URL 旁的"下载"按钮
   - 批量导出: 点击"批量导出报告"按钮，下载 ZIP 文件

## Error 事件处理

当 Coze Workflow 返回 Error 事件时：

```
event: Error
data: {"error_code":5000,"error_message":"错误描述","debug_url":"..."}
```

系统会：

1. 在后端识别 Error 事件
2. 返回包含错误信息的响应
3. 前端显示 toast 错误提示
4. 记录失败结果到 analysisResults 数组
5. 继续处理下一个文件

## 依赖说明

- `jszip`: 用于批量导出时创建 ZIP 文件（已在 package.json 中）
- `vue-toastification`: 可选，用于更好的 toast 提示（已在 package.json 中）

## 注意事项

1. 前端目前使用原生 alert 作为 toast 提示，可以替换为 vue-toastification 组件
2. 批量导出的 ZIP 文件保存在`uploads/`目录，会被自动清理系统处理
3. URL 提取正则表达式匹配`.docx`结尾的 URL
4. 分页大小默认为 10，可以调整`pageSize`变量
