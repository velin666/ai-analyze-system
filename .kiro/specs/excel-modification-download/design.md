# Design Document

## Overview

本系统实现Excel表格的智能修改功能。用户上传Excel文件并提供修改需求后，系统通过AI分析生成修改建议，然后自动生成修改后的Excel文件供下载。

核心技术栈：
- 前端：Vue 3 + TypeScript + Nuxt 3
- 后端：Nuxt Server API + Python
- Excel处理：openpyxl库
- AI分析：Coze工作流

## Architecture

系统采用前后端分离架构，分为以下层次：

```
┌─────────────────────────────────────────┐
│         前端 (Vue 3 + Nuxt 3)           │
│  - document-analysis.vue                │
│  - Excel上传和提示词输入                 │
│  - 分析结果展示                          │
│  - 下载按钮触发                          │
└──────────────┬──────────────────────────┘
               │ HTTP API
┌──────────────┴──────────────────────────┐
│      Nuxt Server API (TypeScript)       │
│  - /api/coze/workflow-excel.post.ts     │
│  - /api/files/modify-excel.post.ts      │
│  - 调用Coze工作流                        │
│  - 调用Python脚本                        │
└──────────────┬──────────────────────────┘
               │ Child Process
┌──────────────┴──────────────────────────┐
│      Python脚本 (modify_excel.py)       │
│  - 解析AI返回结果（Markdown表格）        │
│  - 读取原始Excel文件                     │
│  - 表头定位和列匹配                      │
│  - 数据写入和文件生成                    │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 前端组件 (document-analysis.vue)

**职责：**
- 提供Excel文件上传界面
- 提供WorkRequirements输入框
- 调用AI分析API
- 展示分析结果
- 提供下载修改后Excel的按钮

**关键方法：**
```typescript
// 分析Excel文件
async analyzeWithCozeWorkflow(): Promise<void>

// 下载修改后的Excel
async downloadModifiedExcel(analysisResult: any): Promise<void>
```

### 2. Coze工作流API (/api/coze/workflow-excel.post.ts)

**职责：**
- 接收文件URL和WorkRequirements
- 调用Coze工作流进行AI分析
- 返回分析结果

**接口定义：**
```typescript
// 请求
interface WorkflowExcelRequest {
  fileUrl: string
  workRequirements: string
  tableSummary?: string
}

// 响应
interface WorkflowExcelResponse {
  success: boolean
  result?: {
    content: string  // AI返回的修改建议和表格数据（Markdown格式）
  }
  error?: boolean
  error_message?: string
}
```

### 3. Excel修改API (/api/files/modify-excel.post.ts)

**职责：**
- 接收原文件路径和AI分析结果
- 调用Python脚本执行Excel修改
- 返回修改后文件的下载URL

**接口定义：**
```typescript
// 请求
interface ModifyExcelRequest {
  originalFilePath: string  // 原文件在服务器上的路径
  aiResult: string          // AI返回的分析结果（Markdown格式）
  originalFileName: string  // 原文件名
}

// 响应
interface ModifyExcelResponse {
  success: boolean
  downloadUrl?: string      // 修改后文件的下载URL
  fileName?: string         // 修改后的文件名
  error?: string
}
```

### 4. Python脚本 (modify_excel.py)

**职责：**
- 解析AI返回的Markdown表格数据
- 读取原始Excel文件
- 定位表头并匹配列
- 写入修改后的数据
- 生成新文件

**主要函数：**
```python
def extract_all_markdown_tables(markdown_text: str) -> list:
    """提取所有Markdown表格，返回表格列表"""
    pass

def find_target_table(tables: list, markdown_text: str) -> dict:
    """
    从多个表格中找到目标表格（修正后的表格）
    策略：
    1. 查找包含"修正后"关键词的表格
    2. 如果没有，使用最后一个表格
    3. 如果只有一个表格，直接使用
    """
    pass

def parse_markdown_table(table_text: str) -> dict:
    """解析单个Markdown表格，提取表头和数据行"""
    pass

def find_header_row(worksheet) -> tuple:
    """定位表头行，返回(行号, 表头字典)"""
    pass

def match_columns(ai_headers: list, original_headers: dict) -> dict:
    """匹配AI列与原文件列，返回列映射"""
    pass

def write_modified_data(worksheet, header_row: int, column_mapping: dict, ai_data: list):
    """将AI数据写入Excel"""
    pass

def modify_excel(original_path: str, ai_result: str, output_path: str) -> bool:
    """主函数：执行完整的Excel修改流程"""
    pass
```

## Data Models

### AI分析结果格式

**当前支持格式：Markdown表格**

AI返回的内容可能包含多个表格，我们需要识别并提取"修正后"的表格：

**格式1：简单修正表格（res.md示例）**
```markdown
| 序号 | 名称 | 品牌 | 型号尺寸 | 数量 | 单位 | 备注 |
|------|------|------|----------|------|------|------|
| 4    | 触摸屏 | 三菱 | GT2308-VNBA | 1 | 台 | 替换原西门子 |
| 5    | 模块 | 三菱 | FX5-16ET | 3 | 个 | 替换原西门子 |
```

**格式2：包含错误清单和修正表格（res2.md示例）**
```markdown
### 错误清单
| 错误类型 | 具体位置 | 错误描述 | 修正建议 |
|----------|----------|----------|----------|
| 错字 | 序号12 | ... | ... |

### 修正后文档（表格形式）
| 序号 | ERP识别码 | 品牌 | 名称 | 型号尺寸 | 数量 | 单位 | 备注 |
|------|-----------|------|------|----------|------|------|------|
| 1 | WGJ-DQ-CPCZ-0000 | SIEMENS | HMI 面板 | ... | 1 | 台 | CMP |
| 2 | WGJ-DQ-CPCZ-0010 | SIEMENS | SMART 标准型CPU模块 | ... | 1 | 台 | PLC |
```

**解析策略：**
1. 扫描AI返回内容，查找所有Markdown表格
2. 优先查找包含"修正后"、"修正后文档"、"修正后的"等关键词的表格
3. 如果找不到关键词，使用最后一个表格（通常是修正后的完整表格）
4. 如果只有一个表格，直接使用该表格

**预留扩展格式（暂不实现）：**
- JSON数组格式
- CSV格式
- HTML表格格式

### 内部数据结构

```python
# 解析后的表格数据
class TableData:
    headers: List[str]      # 表头列表
    rows: List[List[str]]   # 数据行列表

# 列映射
class ColumnMapping:
    ai_index: int           # AI结果中的列索引
    original_index: int     # 原文件中的列索引
    header_name: str        # 列名
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API调用参数传递正确性
*For any* valid Excel file URL and WorkRequirements string, when the system calls the Coze workflow, it should pass both parameters correctly in the request body.
**Validates: Requirements 1.2**

### Property 2: 文件生成和下载触发
*For any* valid AI analysis result and original file, when the user clicks the download button, the system should generate a modified Excel file and trigger a browser download.
**Validates: Requirements 1.5**

### Property 3: AI结果数据提取完整性
*For any* valid AI analysis result in Markdown format, the system should extract a data structure containing both headers and data rows.
**Validates: Requirements 2.1, 2.4**

### Property 4: Markdown表格解析正确性
*For any* valid Markdown table format, the system should parse it into a structured data format with headers and rows arrays.
**Validates: Requirements 2.2**

### Property 5: 解析错误处理
*For any* invalid or malformed Markdown table input, the parsing function should return an error message rather than throwing an exception.
**Validates: Requirements 2.5**

### Property 6: 表头识别正确性
*For any* Excel file with a valid header row, the system should correctly identify the header row number and extract all column header names.
**Validates: Requirements 3.3, 3.4**

### Property 7: 列完全匹配映射
*For any* AI column name that exactly matches an original file column name, the system should establish a mapping relationship between them.
**Validates: Requirements 4.2**

### Property 8: 列模糊匹配映射
*For any* AI column name that is similar to an original file column name (similarity > 0.8), the system should establish a mapping relationship using fuzzy matching.
**Validates: Requirements 4.3**

### Property 9: 列映射表生成
*For any* pair of AI headers and original headers, after matching completes, the system should generate a column index mapping table.
**Validates: Requirements 4.1, 4.5**

### Property 10: 表头前内容保留不变性
*For any* Excel file, after writing modified data, all content before the header row should remain unchanged.
**Validates: Requirements 5.1**

### Property 11: 数据写入位置正确性
*For any* column mapping and AI data rows, the system should write each data value to the correct column position according to the mapping.
**Validates: Requirements 5.2**

### Property 12: 未修改列数据保留不变性
*For any* column that exists in the original file but not in the AI result, the data in that column should remain unchanged after modification.
**Validates: Requirements 5.3**

### Property 13: 文件保存成功性
*For any* valid modified data, the system should successfully save the file to a temporary directory.
**Validates: Requirements 5.4**

### Property 14: 文件命名规则正确性
*For any* original filename, the generated modified file should be named as "原文件名(修改后).xlsx".
**Validates: Requirements 5.5**

### Property 15: Python脚本调用成功返回
*For any* valid original file path and AI result, when the Python script executes successfully, the API should return a download URL.
**Validates: Requirements 6.2, 6.3**

### Property 16: Python脚本调用失败处理
*For any* invalid input or execution error, when the Python script fails, the API should return an error message and appropriate status code.
**Validates: Requirements 6.4**

### Property 17: 全局异常处理和日志记录
*For any* exception that occurs during any step of the process, the system should log detailed information and return a user-friendly error message.
**Validates: Requirements 7.5**

## Error Handling

### 错误类型和处理策略

1. **文件错误**
   - 原文件不存在：返回404错误，提示"原始文件未找到"
   - 文件无法读取：返回500错误，提示"文件读取失败，请检查文件格式"
   - 文件格式不支持：返回400错误，提示"仅支持.xlsx和.xls格式"

2. **解析错误**
   - AI结果格式无法识别：返回400错误，提示"AI返回数据格式无法解析"
   - Markdown表格格式错误：返回400错误，提示"Markdown表格格式不正确"

3. **匹配错误**
   - 无法识别表头：返回400错误，提示"无法在Excel中识别表头行"
   - 列匹配失败：返回400错误，提示"AI返回的列与原文件列无法匹配"
   - 匹配度过低：记录警告日志，跳过该列继续处理

4. **写入错误**
   - 文件写入失败：返回500错误，提示"文件写入失败，请重试"
   - 权限不足：返回500错误，提示"服务器权限不足，无法保存文件"

5. **系统错误**
   - Python脚本执行失败：返回500错误，提示"Excel处理失败"
   - 超时错误：返回504错误，提示"处理超时，请稍后重试"

### 错误日志格式

所有错误都应记录到系统日志，包含以下信息：
```typescript
{
  timestamp: string,
  level: 'error' | 'warning',
  component: string,  // 'frontend' | 'api' | 'python'
  operation: string,  // 'parse' | 'match' | 'write' | 'download'
  error: string,
  details: any,
  userId?: string,
  fileId?: string
}
```

## Testing Strategy

### 单元测试

**前端单元测试 (Vitest)**
- 测试Excel文件上传组件
- 测试WorkRequirements输入验证
- 测试下载按钮状态管理
- 测试API调用参数构造

**后端单元测试 (Vitest)**
- 测试API路由处理
- 测试Python脚本调用逻辑
- 测试错误响应格式

**Python单元测试 (pytest)**
- 测试Markdown表格解析函数
- 测试表头识别函数
- 测试列匹配函数（精确匹配和模糊匹配）
- 测试数据写入函数
- 测试文件命名函数

### 属性测试 (Property-Based Testing)

使用fast-check (TypeScript) 和 Hypothesis (Python) 进行属性测试：

**TypeScript属性测试**
- Property 1: API参数传递正确性
- Property 2: 文件生成和下载触发
- Property 17: 全局异常处理

**Python属性测试**
- Property 3-5: Markdown解析相关属性
- Property 6: 表头识别正确性
- Property 7-9: 列匹配相关属性
- Property 10-14: 数据写入相关属性
- Property 15-16: 脚本执行相关属性

每个属性测试应运行至少100次迭代，确保在各种随机输入下都能保持正确性。

### 集成测试

- 端到端测试：从上传Excel到下载修改后文件的完整流程
- API集成测试：测试Node.js API与Python脚本的集成
- 文件系统测试：测试文件读写和临时文件清理

### 测试数据

准备多种测试Excel文件：
1. 标准格式：表头在第1行
2. 非标准格式：表头在第4行或更后
3. 复杂表头：包含合并单元格
4. 多列表格：10列以上
5. 大数据量：1000行以上
6. 特殊字符：包含中文、符号等

准备多种AI返回的Markdown表格：
1. 标准Markdown表格
2. 列顺序不同的数据
3. 部分列缺失的数据
4. 包含特殊字符的数据
5. 空单元格的处理

## Implementation Notes

### 技术选型说明

1. **openpyxl vs xlrd/xlwt**
   - 选择openpyxl因为它支持.xlsx格式且功能完整
   - 支持读写、样式保留、公式处理

2. **Markdown表格解析**
   - 使用正则表达式解析Markdown表格
   - 处理表格分隔符（`|`）和对齐符号（`-`）
   - 支持单元格内的空格和特殊字符

3. **列匹配算法**
   - 优先使用精确匹配（字符串相等）
   - 次选模糊匹配（使用difflib.SequenceMatcher，相似度>0.8）
   - 考虑去除空格、大小写不敏感匹配

4. **文件存储**
   - 修改后的文件存储在`uploads/modified/`目录
   - 使用原文件ID作为子目录名，避免冲突
   - 定期清理超过24小时的临时文件

5. **性能优化**
   - 对于大文件（>1000行），使用流式处理
   - 缓存表头识别结果
   - 异步处理文件生成，避免阻塞

### 扩展性设计

虽然当前只实现Markdown格式解析，但代码结构应支持未来扩展：

```python
# 解析器接口（预留）
class TableParser:
    def parse(self, content: str) -> TableData:
        pass

class MarkdownTableParser(TableParser):
    def parse(self, content: str) -> TableData:
        # 实现Markdown解析
        pass

# 未来可扩展
class JSONTableParser(TableParser):
    def parse(self, content: str) -> TableData:
        # 预留JSON解析
        pass

class CSVTableParser(TableParser):
    def parse(self, content: str) -> TableData:
        # 预留CSV解析
        pass
```

### 安全考虑

1. **文件上传安全**
   - 验证文件类型和大小
   - 限制文件大小（最大10MB）
   - 使用随机文件名存储

2. **路径遍历防护**
   - 验证文件路径，防止目录遍历攻击
   - 使用绝对路径处理文件

3. **输入验证**
   - 验证AI返回数据的格式
   - 防止注入攻击（命令注入）

4. **权限控制**
   - 确保Python脚本只能访问指定目录
   - 限制文件操作权限
