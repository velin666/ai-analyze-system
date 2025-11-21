# DOCX 转 XML 工具使用文档

## 功能说明

本工具用于将上传的 DOCX 文件转换为 XML 格式。DOCX 文件本质上是一个包含多个 XML 文件的 ZIP 压缩包。

## 安装依赖

```bash
npm install adm-zip xml2js
npm install -D @types/adm-zip @types/xml2js
```

或使用 pnpm：

```bash
pnpm install adm-zip xml2js
pnpm install -D @types/adm-zip @types/xml2js
```

## API 端点

### POST `/api/files/convert-docx`

将已上传的 DOCX 文件转换为不同格式。

#### 请求参数

```typescript
{
  fileId: string,      // 文件ID（上传时返回的ID）
  format?: string      // 输出格式：'xml' | 'xml-formatted' | 'json' | 'text'
}
```

#### 格式说明

1. **xml** (默认)

   - 返回结构化的 XML 内容对象
   - 包含 document、styles、header、footer 等各个部分
   - 适合需要分别处理不同部分的场景

2. **xml-formatted**

   - 返回包含所有 XML 文件的完整字符串
   - 每个文件用注释分隔
   - 适合导出或保存完整 XML

3. **json**

   - 将主文档 XML 解析为 JSON 对象
   - 便于 JavaScript 处理
   - 保留 XML 结构

4. **text**
   - 提取纯文本内容
   - 去除所有格式和标签
   - 适合文本分析

#### 响应示例

**格式：xml**

```json
{
  "success": true,
  "format": "xml",
  "data": {
    "document": "<?xml version=\"1.0\"...>",
    "styles": "<?xml version=\"1.0\"...>",
    "allXmlFiles": {
      "word/document.xml": "...",
      "word/styles.xml": "...",
      ...
    }
  }
}
```

**格式：text**

```json
{
  "success": true,
  "format": "text",
  "data": "这是从DOCX文件中提取的纯文本内容..."
}
```

## 前端使用示例

### Vue 3 Composition API

```vue
<template>
  <div>
    <input type="file" @change="handleFileUpload" accept=".docx" />
    <button @click="convertToXml" :disabled="!fileId">转换为XML</button>
    <pre v-if="xmlContent">{{ xmlContent }}</pre>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const fileId = ref<string>('')
  const xmlContent = ref<any>(null)

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      fileId.value = data.id
    } catch (error) {
      console.error('上传失败:', error)
    }
  }

  async function convertToXml() {
    if (!fileId.value) return

    try {
      const response = await fetch('/api/files/convert-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId.value,
          format: 'xml', // 可选: 'xml', 'xml-formatted', 'json', 'text'
        }),
      })

      const data = await response.json()
      xmlContent.value = data.data

      // 如果需要下载XML文件
      if (data.format === 'xml-formatted') {
        downloadXml(data.data)
      }
    } catch (error) {
      console.error('转换失败:', error)
    }
  }

  function downloadXml(xmlString: string) {
    const blob = new Blob([xmlString], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.xml'
    a.click()
    URL.revokeObjectURL(url)
  }
</script>
```

### TypeScript 直接调用

```typescript
// 上传文件
async function uploadDocx(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  return data.id
}

// 转换为XML
async function convertDocxToXml(fileId: string, format = 'xml') {
  const response = await fetch('/api/files/convert-docx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId, format }),
  })

  return await response.json()
}

// 使用示例
const fileInput = document.querySelector(
  'input[type="file"]'
) as HTMLInputElement
fileInput.addEventListener('change', async e => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 上传
  const fileId = await uploadDocx(file)

  // 转换为JSON格式
  const result = await convertDocxToXml(fileId, 'json')
  console.log('转换结果:', result.data)

  // 转换为文本
  const textResult = await convertDocxToXml(fileId, 'text')
  console.log('提取的文本:', textResult.data)
})
```

## 服务端直接使用

如果需要在服务端直接使用转换功能：

```typescript
import {
  extractXmlFromDocx,
  extractTextFromDocx,
} from '~/server/utils/docxConverter'

// 提取XML
const xmlContent = await extractXmlFromDocx('/path/to/document.docx')
console.log('主文档XML:', xmlContent.document)
console.log('样式XML:', xmlContent.styles)

// 提取文本
const text = await extractTextFromDocx('/path/to/document.docx')
console.log('文本内容:', text)
```

## DOCX 文件结构说明

DOCX 文件包含以下主要 XML 文件：

- **word/document.xml** - 主文档内容
- **word/styles.xml** - 样式定义
- **word/header1.xml** - 页眉
- **word/footer1.xml** - 页脚
- **word/\_rels/document.xml.rels** - 文档关系（图片、链接等）
- **[Content_Types].xml** - 内容类型定义
- **docProps/core.xml** - 文档属性（作者、创建时间等）

## 注意事项

1. 确保上传的文件是有效的 DOCX 文件（Office 2007+格式）
2. 旧版 DOC 格式不支持，需要先转换为 DOCX
3. 提取的文本可能不包含复杂格式（表格、图片等）
4. XML 解析可能消耗较多内存，建议限制文件大小

## 错误处理

常见错误及解决方法：

- **File ID is required** - 未提供 fileId 参数
- **File not found** - 文件不存在或已被删除
- **File must be a DOCX document** - 文件不是 DOCX 格式
- **Failed to extract XML from DOCX** - 文件损坏或格式不正确

## 扩展功能建议

可以基于此工具扩展以下功能：

1. 批量转换多个文件
2. 提取图片和嵌入对象
3. 保留格式信息（字体、颜色、对齐等）
4. 转换为 Markdown 或 HTML 格式
5. 对比两个文档的差异
