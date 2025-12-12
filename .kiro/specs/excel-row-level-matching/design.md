# Design Document

## Overview

本设计文档描述Excel智能行级匹配和替换功能的实现方案。系统将AI返回的多个表格数据，通过表头匹配和行级内容比对，精确替换原Excel文件中的对应行数据。

核心设计理念：
- 表格级处理：逐个处理AI返回的每个表格
- 表头验证：通过表头匹配确定表格适用性
- 行级匹配：通过多列内容比对找到精确的目标行
- 增量替换：仅替换匹配的行，保留其他数据
- 性能优化：使用行指针减少重复扫描

## Architecture

系统采用分层架构：

```
┌─────────────────────────────────────┐
│   API Layer (TypeScript/Nuxt)      │
│   - modify-excel.post.ts            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Processing Layer (Python)         │
│   - modify_excel.py                 │
│     ├─ Table Extraction             │
│     ├─ Header Matching              │
│     ├─ Row Matching                 │
│     └─ Data Replacement             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Storage Layer                     │
│   - Original Excel Files            │
│   - Modified Excel Files            │
└─────────────────────────────────────┘
```

## Components and Interfaces

### 1. TableExtractor

负责从AI结果中提取所有表格。

```python
class TableExtractor:
    @staticmethod
    def extract_all_tables(markdown_text: str) -> List[str]:
        """提取所有Markdown表格"""
        pass
    
    @staticmethod
    def parse_table(table_text: str) -> TableData:
        """解析单个表格为结构化数据"""
        pass
```

### 2. HeaderMatcher

负责表头匹配和列映射。

```python
class HeaderMatcher:
    @staticmethod
    def match_header(ai_headers: List[str], 
                    excel_sheet,
                    match_threshold: float = 0.5) -> Optional[HeaderMatchResult]:
        """匹配表头并返回匹配结果"""
        pass
    
    @staticmethod
    def create_column_mapping(ai_headers: List[str],
                            excel_headers: Dict[int, str]) -> Dict[int, int]:
        """创建列映射关系"""
        pass
```

### 3. RowMatcher

负责行级匹配。

```python
class RowMatcher:
    def __init__(self, match_threshold: int = 2):
        self.match_threshold = match_threshold
        self.current_pointer = 0
    
    def find_matching_row(self,
                         ai_row: List[str],
                         excel_sheet,
                         column_mapping: Dict[int, int],
                         start_row: int,
                         header_row: int) -> Optional[RowMatchResult]:
        """找到匹配的行号"""
        pass
    
    @staticmethod
    def compare_rows(ai_row: List[str],
                    excel_row,
                    column_mapping: Dict[int, int]) -> int:
        """比较两行，返回匹配的列数"""
        pass
```

### 4. DataReplacer

负责数据替换。

```python
class DataReplacer:
    @staticmethod
    def replace_row(excel_sheet,
                   row_number: int,
                   ai_row: List[str],
                   column_mapping: Dict[int, int]) -> None:
        """替换指定行的数据"""
        pass
```

### 5. ExcelProcessor

主处理器，协调各组件。

```python
class ExcelProcessor:
    def __init__(self, excel_path: str, ai_result: str, config: ProcessingConfig = None):
        self.excel_path = excel_path
        self.ai_result = ai_result
        self.config = config or ProcessingConfig()
        self.workbook = None
        self.worksheet = None
        self.statistics = ProcessingStatistics()
    
    def process(self) -> ProcessingResult:
        """执行完整的处理流程"""
        pass
    
    def process_single_table(self, table: TableData) -> TableProcessingResult:
        """处理单个表格"""
        pass
```

## Data Models

### TableData

```python
@dataclass
class TableData:
    headers: List[str]          # 表头列表
    rows: List[List[str]]       # 数据行列表
    raw_text: str              # 原始Markdown文本
```

### HeaderMatchResult

```python
@dataclass
class HeaderMatchResult:
    matched: bool                      # 是否匹配成功
    header_row: int                    # 表头行号
    excel_headers: Dict[int, str]      # Excel表头 {列索引: 列名}
    column_mapping: Dict[int, int]     # 列映射 {AI列索引: Excel列索引}
    match_rate: float                  # 匹配率
```

### RowMatchResult

```python
@dataclass
class RowMatchResult:
    matched: bool              # 是否找到匹配
    row_number: int           # 匹配的行号
    matched_columns: int      # 匹配的列数
    matched_column_names: List[str]  # 匹配的列名
```

### ProcessingStatistics

```python
@dataclass
class ProcessingStatistics:
    total_tables: int = 0           # 总表格数
    processed_tables: int = 0       # 成功处理的表格数
    skipped_tables: int = 0         # 跳过的表格数
    total_rows: int = 0            # 总行数
    matched_rows: int = 0          # 成功匹配的行数
    skipped_rows: int = 0          # 跳过的行数
    processing_time: float = 0.0   # 处理时间（秒）
```

### ProcessingResult

```python
@dataclass
class ProcessingResult:
    success: bool
    output_path: Optional[str]
    filename: Optional[str]
    statistics: ProcessingStatistics
    error: Optional[str]
    warnings: List[str]
```

### ProcessingConfig

```python
@dataclass
class ProcessingConfig:
    row_match_threshold: int = 2          # 行匹配阈值（至少匹配的列数）
    header_match_threshold: float = 0.5   # 表头匹配阈值（匹配率）
    enable_wraparound_search: bool = True # 是否启用回环搜索
    max_search_distance: int = 1000       # 最大搜索距离
    preserve_formulas: bool = True        # 是否保留公式
    log_level: str = "INFO"              # 日志级别
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

经过分析，发现以下冗余属性：
- 属性6.2（指针更新）与属性4.4重复
- 属性6.3（从指针开始查找）与属性4.1重复  
- 属性6.5（未找到处理）与属性4.5重复

这些冗余属性将被合并到更全面的属性中，以避免重复测试。

### Correctness Properties

Property 1: Table extraction completeness
*For any* Markdown text containing N valid tables, the extraction function should return exactly N table objects, each containing the complete original Markdown text
**Validates: Requirements 1.1, 1.3**

Property 2: Table structure parsing
*For any* valid Markdown table, parsing should extract the first row as headers and rows starting from the third row as data, with all whitespace trimmed
**Validates: Requirements 2.1, 2.2, 2.3**

Property 3: Empty row filtering
*For any* table containing empty or whitespace-only rows, those rows should be excluded from the parsed data rows
**Validates: Requirements 2.4**

Property 4: Header matching threshold
*For any* AI table headers and Excel file, if at least 50% of AI headers match Excel headers, the match should succeed and return a valid column mapping
**Validates: Requirements 3.3, 3.5**

Property 5: Header matching failure handling
*For any* AI table headers and Excel file, if less than 50% of AI headers match, the table should be skipped and logged
**Validates: Requirements 3.4**

Property 6: Row matching threshold
*For any* AI data row and Excel rows, if at least 2 columns match exactly, the rows should be considered a match
**Validates: Requirements 4.3**

Property 7: Row pointer optimization
*For any* sequence of row matches, the search for each subsequent row should start from the position of the previous match, and the pointer should update after each successful match
**Validates: Requirements 4.1, 4.4, 6.1, 6.2, 6.3**

Property 8: Wraparound search
*For any* AI data row that is not found from the current pointer to the end of file, the system should perform one additional search from the header row to the current pointer
**Validates: Requirements 6.4**

Property 9: Partial column replacement
*For any* matched row and column mapping, only the mapped columns should be replaced, while unmapped columns in the Excel file should remain unchanged
**Validates: Requirements 5.2**

Property 10: Invalid column handling
*For any* AI data column that does not exist in the Excel file, that column should be skipped without causing errors
**Validates: Requirements 5.3**

Property 11: Sequential table processing
*For any* list of AI tables, each table should be fully processed (all rows matched and replaced) before the next table is processed
**Validates: Requirements 7.2**

Property 12: Table processing isolation
*For any* list of AI tables, if one table fails to process, the remaining tables should still be processed successfully
**Validates: Requirements 7.3**

Property 13: Column count mismatch handling
*For any* AI table and Excel file with different column counts, only the columns that exist in both should be processed
**Validates: Requirements 9.1**

Property 14: Special character handling
*For any* data containing null values, empty strings, or special characters, the comparison and replacement should handle them correctly without errors
**Validates: Requirements 9.2**

Property 15: Error recovery
*For any* processing step that encounters an exception, the system should log the error, continue processing remaining items, and return a meaningful error message
**Validates: Requirements 1.5, 9.5**

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - Missing or invalid file path
   - Empty or malformed AI result
   - Unsupported file format

2. **Parsing Errors**
   - Invalid Markdown table format
   - Corrupted Excel file
   - Encoding issues

3. **Matching Errors**
   - No header match found
   - No row matches found
   - Ambiguous matches

4. **File Operation Errors**
   - File read/write permissions
   - Disk space issues
   - File locking conflicts

### Error Handling Strategy

```python
class ErrorHandler:
    @staticmethod
    def handle_error(error: Exception, context: str) -> ErrorResponse:
        """统一错误处理"""
        logger.error(f"{context}: {error}", exc_info=True)
        
        if isinstance(error, FileNotFoundError):
            return ErrorResponse(
                code="FILE_NOT_FOUND",
                message="找不到指定的文件",
                user_message="文件不存在，请检查文件路径"
            )
        elif isinstance(error, PermissionError):
            return ErrorResponse(
                code="PERMISSION_DENIED",
                message="没有文件访问权限",
                user_message="无法访问文件，请检查文件权限"
            )
        else:
            return ErrorResponse(
                code="UNKNOWN_ERROR",
                message=str(error),
                user_message="处理过程中发生错误，请稍后重试"
            )
```

## Testing Strategy

### Integration Testing

使用实际的res.md和res2.md文件进行端到端测试，验证完整的处理流程：

```python
def test_with_res2_file():
    """使用res2.md和实际Excel文件测试完整流程"""
    # 读取实际的AI分析结果
    with open('server/api/res2.md', 'r', encoding='utf-8') as f:
        ai_result = f.read()
    
    # 使用实际的Excel文件
    excel_path = 'assets/KHG51-SD01 烘烤炉电气件清单.xlsx'
    
    # 执行处理
    result = modify_excel(excel_path, ai_result, 'uploads/modified')
    
    # 验证结果
    assert result['success'] == True
    assert result['statistics']['matched_rows'] > 0
    
    # 验证输出文件存在并可读取
    wb = load_workbook(result['output_path'])
    ws = wb.active
    
    # 验证数据已被正确替换
    # 例如：检查序号12的型号是否从"O.75KW"修正为"0.75KW"
    # 例如：检查序号27的数量是否从26修正为21
    
    print(f"✓ 处理成功: {result['statistics']['processed_tables']}个表格")
    print(f"✓ 匹配行数: {result['statistics']['matched_rows']}")
    print(f"✓ 输出文件: {result['output_path']}")

def test_with_res_file():
    """使用res.md测试（如果需要）"""
    with open('server/api/res.md', 'r', encoding='utf-8') as f:
        ai_result = f.read()
    
    excel_path = 'assets/KHG51-SD01 烘烤炉电气件清单.xlsx'
    result = modify_excel(excel_path, ai_result, 'uploads/modified')
    
    assert result['success'] == True
    print(f"✓ 处理成功: {result['statistics']['matched_rows']}行被替换")
```

### Manual Verification

测试完成后，手动验证以下关键点：
1. 打开修改后的Excel文件
2. 检查序号12的型号是否正确修正
3. 检查序号27、28的数量是否正确修正
4. 检查其他AI返回的修正是否正确应用
5. 确认未修改的行保持原样

## Implementation Notes

### 核心算法流程

```python
def process_excel(excel_path: str, ai_result: str) -> ProcessingResult:
    """
    主处理流程：
    1. 提取AI结果中的所有表格
    2. 对每个表格：
       a. 解析表头和数据行
       b. 在Excel中查找匹配的表头
       c. 如果表头匹配成功：
          - 对每一行数据：
            * 从当前指针位置开始查找匹配行
            * 如果找到（至少2列匹配）：
              - 替换该行数据
              - 更新指针位置
            * 如果未找到：
              - 尝试回环搜索
              - 仍未找到则跳过该行
       d. 如果表头匹配失败：跳过该表格
    3. 保存修改后的文件
    4. 返回处理结果和统计信息
    """
    pass
```

### 性能优化策略

1. **行指针机制**: 
   - 初始化指针到表头下一行
   - 每次匹配成功后更新指针
   - 下次搜索从指针位置开始

2. **早期退出**: 
   - 一旦找到匹配就立即返回
   - 不继续比对后续行

3. **回环搜索优化**:
   - 只在第一次搜索失败时执行
   - 避免重复搜索已扫描区域

### 日志记录

```python
# 关键操作日志
logger.info(f"开始处理表格 {table_index}/{total_tables}")
logger.info(f"表头匹配成功: {match_rate*100:.1f}% ({matched_cols}/{total_cols})")
logger.debug(f"行匹配成功: AI行{ai_row_idx} -> Excel行{excel_row_num} (匹配{match_count}列)")
logger.warning(f"行匹配失败: AI行{ai_row_idx}, 数据: {ai_row_data}")
logger.info(f"表格处理完成: 匹配{matched_rows}行, 跳过{skipped_rows}行")
```

### 配置说明

- `row_match_threshold`: 默认2，表示至少2列内容一致才认为匹配
- `header_match_threshold`: 默认0.5，表示至少50%的表头列匹配才处理该表格
- `enable_wraparound_search`: 默认True，启用回环搜索提高匹配率
- `max_search_distance`: 默认1000，限制最大搜索范围避免性能问题

## API Interface

### Request

```typescript
interface ModifyExcelRequest {
  originalFilePath: string    // 原Excel文件路径
  aiResult: string           // AI分析结果（Markdown格式）
  originalFileName: string   // 原文件名
}
```

### Response

```typescript
interface ModifyExcelResponse {
  success: boolean
  downloadUrl?: string       // 下载URL
  fileName?: string         // 修改后的文件名
  statistics?: {
    total_tables: number
    processed_tables: number
    matched_rows: number
    skipped_rows: number
    processing_time: number
  }
  error?: string
  warnings?: string[]
}
```
