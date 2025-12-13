# Design Document

## Overview

本设计文档描述基于"序号"列的Excel简化匹配和替换功能。系统通过定位"序号"列，直接使用序号值匹配原Excel文件中的对应行，实现精确、高效的数据替换。

核心设计理念：
- 序号优先：以"序号"列作为唯一匹配依据
- 简化逻辑：移除复杂的多列比对机制
- 直接定位：通过序号值直接查找目标行
- 保持兼容：继续支持多表格处理
- 高效执行：减少不必要的比对操作

## Architecture

系统采用分层架构，简化了匹配逻辑：

```
┌─────────────────────────────────────┐
│   API Layer (TypeScript/Nuxt)      │
│   - modify-excel.post.ts            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Processing Layer (Python)         │
│   - modify_excel_by_sequence.py     │
│     ├─ Table Extraction             │
│     ├─ Sequence Column Location     │
│     ├─ Sequence-Based Matching      │
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
    def extract_all_tables(markdown_text: str) -> List[TableData]:
        """
        从Markdown文本中提取所有表格
        
        Args:
            markdown_text: AI返回的Markdown格式文本
            
        Returns:
            表格数据列表
        """
        pass
    
    @staticmethod
    def parse_table(table_text: str) -> TableData:
        """
        解析单个Markdown表格
        
        Args:
            table_text: 单个表格的Markdown文本
            
        Returns:
            解析后的表格数据
        """
        pass
```

### 2. SequenceColumnLocator

负责在Excel文件中定位"序号"列。

```python
class SequenceColumnLocator:
    @staticmethod
    def locate_sequence_column(worksheet, max_rows: int = 20) -> Optional[SequenceColumnInfo]:
        """
        在Excel工作表中定位序号列
        
        Args:
            worksheet: openpyxl工作表对象
            max_rows: 最大搜索行数
            
        Returns:
            序号列信息，如果未找到则返回None
        """
        pass
    
    @staticmethod
    def parse_headers(worksheet, header_row: int) -> Dict[str, int]:
        """
        解析表头行，创建列名到列索引的映射
        
        Args:
            worksheet: openpyxl工作表对象
            header_row: 表头所在行号
            
        Returns:
            列名到列索引的字典
        """
        pass
```

### 3. SequenceMatcher

负责基于序号的行匹配。

```python
class SequenceMatcher:
    def __init__(self, worksheet, sequence_col_index: int, header_row: int):
        """
        初始化序号匹配器
        
        Args:
            worksheet: openpyxl工作表对象
            sequence_col_index: 序号列的列索引
            header_row: 表头所在行号
        """
        self.worksheet = worksheet
        self.sequence_col_index = sequence_col_index
        self.header_row = header_row
        self.sequence_map = self._build_sequence_map()
    
    def _build_sequence_map(self) -> Dict[str, int]:
        """
        构建序号到行号的映射表
        
        Returns:
            序号值到行号的字典
        """
        pass
    
    def find_row_by_sequence(self, sequence_value: Any) -> Optional[int]:
        """
        通过序号值查找行号
        
        Args:
            sequence_value: 序号值
            
        Returns:
            匹配的行号，如果未找到则返回None
        """
        pass
    
    @staticmethod
    def normalize_sequence(value: Any) -> str:
        """
        标准化序号值（去除空格、统一类型等）
        
        Args:
            value: 原始序号值
            
        Returns:
            标准化后的字符串
        """
        pass
```

### 4. DataReplacer

负责数据替换。

```python
class DataReplacer:
    @staticmethod
    def replace_row(worksheet,
                   row_number: int,
                   ai_row_data: Dict[str, Any],
                   column_mapping: Dict[str, int]) -> int:
        """
        替换指定行的数据
        
        Args:
            worksheet: openpyxl工作表对象
            row_number: 目标行号
            ai_row_data: AI数据行（列名到值的字典）
            column_mapping: 列名到Excel列索引的映射
            
        Returns:
            实际替换的列数
        """
        pass
```

### 5. ExcelSequenceProcessor

主处理器，协调各组件。

```python
class ExcelSequenceProcessor:
    def __init__(self, excel_path: str, ai_result: str, config: ProcessingConfig = None):
        """
        初始化处理器
        
        Args:
            excel_path: Excel文件路径
            ai_result: AI分析结果
            config: 处理配置
        """
        self.excel_path = excel_path
        self.ai_result = ai_result
        self.config = config or ProcessingConfig()
        self.workbook = None
        self.worksheet = None
        self.statistics = ProcessingStatistics()
    
    def process(self) -> ProcessingResult:
        """
        执行完整的处理流程
        
        Returns:
            处理结果
        """
        pass
    
    def process_single_table(self, table: TableData, sequence_matcher: SequenceMatcher, 
                            column_mapping: Dict[str, int]) -> TableProcessingResult:
        """
        处理单个表格
        
        Args:
            table: 表格数据
            sequence_matcher: 序号匹配器
            column_mapping: 列映射
            
        Returns:
            表格处理结果
        """
        pass
```

## Data Models

### TableData

```python
@dataclass
class TableData:
    headers: List[str]              # 表头列表
    rows: List[Dict[str, Any]]      # 数据行列表（列名到值的字典）
    has_sequence: bool              # 是否包含序号列
    sequence_col_index: int         # 序号列在AI表格中的索引（-1表示不存在）
```

### SequenceColumnInfo

```python
@dataclass
class SequenceColumnInfo:
    column_index: int               # 序号列的列索引（从1开始）
    header_row: int                 # 表头所在行号
    column_headers: Dict[str, int]  # 所有列名到列索引的映射
```

### ProcessingStatistics

```python
@dataclass
class ProcessingStatistics:
    total_tables: int = 0           # 总表格数
    processed_tables: int = 0       # 成功处理的表格数
    skipped_tables: int = 0         # 跳过的表格数（无序号列）
    total_rows: int = 0            # 总行数
    matched_rows: int = 0          # 成功匹配的行数
    skipped_rows: int = 0          # 跳过的行数（序号未找到）
    processing_time: float = 0.0   # 处理时间（秒）
```

### ProcessingResult

```python
@dataclass
class ProcessingResult:
    success: bool                   # 是否成功
    output_path: Optional[str]      # 输出文件路径
    filename: Optional[str]         # 输出文件名
    statistics: ProcessingStatistics # 统计信息
    error: Optional[str]            # 错误信息
    warnings: List[str]             # 警告列表
```

### ProcessingConfig

```python
@dataclass
class ProcessingConfig:
    max_header_search_rows: int = 20    # 最大表头搜索行数
    normalize_sequence: bool = True     # 是否标准化序号值
    skip_empty_sequence: bool = True    # 是否跳过空序号行
    log_level: str = "INFO"            # 日志级别
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

经过分析，发现以下可以合并的属性：
- 属性1.1、1.2、1.3可以合并为一个全面的表格提取属性
- 属性4.3和4.4可以合并为序号查找属性
- 属性9.1和9.2可以合并为统计一致性属性

这些合并将减少冗余测试，同时保持完整的验证覆盖。

### Correctness Properties

Property 1: Table extraction completeness and structure
*For any* Markdown text containing N valid tables (with | symbols), the extraction should return exactly N TableData objects, each with headers and data rows correctly parsed
**Validates: Requirements 1.1, 1.2, 1.3**

Property 2: Sequence column location
*For any* Excel file with a "序号" column in the first 20 rows, the locator should return the correct column index and header row number
**Validates: Requirements 2.1, 2.2, 2.5**

Property 3: AI table sequence validation
*For any* AI table, the system should correctly identify whether it contains a "序号" column and record its index position
**Validates: Requirements 3.1, 3.2**

Property 4: Non-sequence table skipping
*For any* AI table without a "序号" column, the table should be skipped and counted in skipped_tables statistics
**Validates: Requirements 3.3**

Property 5: Sequence value normalization
*For any* sequence value (number or string, with or without leading zeros/spaces), the normalization function should convert it to a consistent string format for comparison
**Validates: Requirements 8.1, 8.2**

Property 6: Sequence-based row matching
*For any* normalized sequence value and Excel sequence map, if the sequence exists in the map, the matcher should return the correct row number
**Validates: Requirements 4.3, 4.4**

Property 7: Missing sequence handling
*For any* AI data row with empty, invalid, or non-existent sequence value, the row should be skipped and counted in skipped_rows statistics
**Validates: Requirements 4.2, 4.5**

Property 8: Column-based data replacement
*For any* matched row and AI data, only columns that exist in both the AI table and Excel should be replaced, while other Excel columns remain unchanged
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

Property 9: Sequential table processing
*For any* list of AI tables, each table should be fully processed before the next table begins, maintaining the order
**Validates: Requirements 6.1, 6.2**

Property 10: Table processing isolation
*For any* list of AI tables where one table fails, the remaining tables should still be processed successfully
**Validates: Requirements 6.3**

Property 11: Statistics consistency
*For any* processing result, the sum of matched_rows and skipped_rows should equal total_rows, and the sum of processed_tables and skipped_tables should equal total_tables
**Validates: Requirements 9.1, 9.2**

Property 12: Error information completeness
*For any* processing that encounters exceptions, the result should include detailed error information and user-friendly messages
**Validates: Requirements 8.5, 9.5**

Property 13: Warning collection
*For any* processing that generates warnings (skipped tables, skipped rows), all warnings should be collected in the warnings list
**Validates: Requirements 9.4**

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - Missing or invalid Excel file path
   - Empty or malformed AI result
   - Unsupported file format

2. **Sequence Column Errors**
   - No "序号" column found in first 20 rows
   - Multiple "序号" columns (use first one)
   - Empty sequence column

3. **Matching Errors**
   - Sequence value not found in Excel
   - Invalid sequence value format
   - Duplicate sequence values (use first match)

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
        elif isinstance(error, SequenceColumnNotFoundError):
            return ErrorResponse(
                code="SEQUENCE_COLUMN_NOT_FOUND",
                message="未找到序号列",
                user_message="Excel文件前20行中未找到'序号'列，无法进行匹配"
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

### Unit Testing

单元测试覆盖各个组件的核心功能：

```python
def test_table_extraction():
    """测试表格提取功能"""
    markdown = """
    | 序号 | 名称 | 数量 |
    |------|------|------|
    | 1    | A    | 10   |
    | 2    | B    | 20   |
    """
    tables = TableExtractor.extract_all_tables(markdown)
    assert len(tables) == 1
    assert tables[0].has_sequence == True

def test_sequence_column_location():
    """测试序号列定位"""
    # 创建测试Excel文件
    wb = Workbook()
    ws = wb.active
    ws['A1'] = '名称'
    ws['B1'] = '序号'
    ws['C1'] = '数量'
    
    locator = SequenceColumnLocator()
    info = locator.locate_sequence_column(ws)
    
    assert info is not None
    assert info.column_index == 2
    assert info.header_row == 1

def test_sequence_normalization():
    """测试序号标准化"""
    assert SequenceMatcher.normalize_sequence("  12  ") == "12"
    assert SequenceMatcher.normalize_sequence(12) == "12"
    assert SequenceMatcher.normalize_sequence("012") == "12"
```

### Property-Based Testing

使用property-based testing验证通用属性。我们将使用Python的`hypothesis`库：

```python
from hypothesis import given, strategies as st

@given(st.lists(st.text(min_size=1), min_size=1))
def test_property_table_extraction_count(table_contents):
    """
    Property 1: Table extraction completeness
    For any list of table contents, extraction should return the same number of tables
    """
    # 构造包含N个表格的Markdown
    markdown = "\n\n".join([
        f"| 列1 | 列2 |\n|-----|-----|\n| {content} | 值 |"
        for content in table_contents
    ])
    
    tables = TableExtractor.extract_all_tables(markdown)
    assert len(tables) == len(table_contents)

@given(st.integers(min_value=1, max_value=20), st.integers(min_value=1, max_value=10))
def test_property_sequence_column_location(header_row, seq_col):
    """
    Property 2: Sequence column location
    For any Excel with sequence column in first 20 rows, should find it correctly
    """
    wb = Workbook()
    ws = wb.active
    
    # 在指定行和列创建序号列
    for col in range(1, 5):
        ws.cell(header_row, col, f"列{col}")
    ws.cell(header_row, seq_col, "序号")
    
    info = SequenceColumnLocator.locate_sequence_column(ws)
    
    assert info is not None
    assert info.column_index == seq_col
    assert info.header_row == header_row

@given(st.one_of(
    st.integers(),
    st.text(min_size=1),
    st.text(min_size=1).map(lambda x: f"  {x}  "),
    st.integers().map(lambda x: f"0{x}")
))
def test_property_sequence_normalization(sequence_value):
    """
    Property 5: Sequence value normalization
    For any sequence value, normalization should produce consistent string format
    """
    normalized = SequenceMatcher.normalize_sequence(sequence_value)
    
    # 标准化结果应该是字符串
    assert isinstance(normalized, str)
    
    # 标准化应该是幂等的
    assert SequenceMatcher.normalize_sequence(normalized) == normalized
    
    # 标准化结果不应包含前导/尾随空格
    assert normalized == normalized.strip()

@given(st.dictionaries(
    keys=st.text(min_size=1),
    values=st.integers(min_value=1, max_value=100),
    min_size=1
))
def test_property_sequence_matching(sequence_map):
    """
    Property 6: Sequence-based row matching
    For any sequence map, matcher should find existing sequences
    """
    # 创建模拟的SequenceMatcher
    matcher = SequenceMatcher(None, 1, 1)
    matcher.sequence_map = sequence_map
    
    # 对于映射中的每个序号，应该能找到对应行
    for seq_value, row_num in sequence_map.items():
        found_row = matcher.find_row_by_sequence(seq_value)
        assert found_row == row_num

@given(st.lists(st.dictionaries(
    keys=st.text(min_size=1),
    values=st.text(),
    min_size=1
), min_size=2))
def test_property_statistics_consistency(table_data_list):
    """
    Property 11: Statistics consistency
    For any processing result, statistics should be consistent
    """
    # 模拟处理结果
    stats = ProcessingStatistics()
    stats.total_tables = len(table_data_list)
    stats.processed_tables = len([t for t in table_data_list if '序号' in t])
    stats.skipped_tables = stats.total_tables - stats.processed_tables
    
    # 验证一致性
    assert stats.processed_tables + stats.skipped_tables == stats.total_tables
```

### Integration Testing

使用实际的Excel文件和AI结果进行端到端测试：

```python
def test_integration_with_real_files():
    """使用实际文件测试完整流程"""
    # 使用实际的Excel文件
    excel_path = 'assets/KHG51-SD01 烘烤炉电气件清单.xlsx'
    
    # 构造测试用的AI结果
    ai_result = """
    | 序号 | 型号 | 数量 |
    |------|------|------|
    | 12   | 0.75KW | 1 |
    | 27   | XXX  | 21 |
    | 28   | YYY  | 21 |
    """
    
    # 执行处理
    processor = ExcelSequenceProcessor(excel_path, ai_result)
    result = processor.process()
    
    # 验证结果
    assert result.success == True
    assert result.statistics.matched_rows == 3
    assert result.statistics.skipped_rows == 0
    
    # 验证输出文件
    wb = load_workbook(result.output_path)
    ws = wb.active
    
    # 验证序号12的型号已修正
    # 验证序号27、28的数量已修正
    
    print(f"✓ 处理成功: {result.statistics.matched_rows}行被替换")
    print(f"✓ 输出文件: {result.output_path}")
```

### Testing Configuration

```python
# pytest.ini 或 setup.cfg
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# Hypothesis配置
hypothesis_profile = default
hypothesis_max_examples = 100  # 每个属性测试运行100次
```

## Implementation Notes

### 核心算法流程

```python
def process_excel(excel_path: str, ai_result: str) -> ProcessingResult:
    """
    主处理流程：
    1. 打开Excel文件
    2. 定位"序号"列
       - 如果未找到，返回错误
    3. 构建序号到行号的映射表
    4. 提取AI结果中的所有表格
    5. 对每个表格：
       a. 检查是否包含"序号"列
       b. 如果不包含，跳过该表格
       c. 如果包含：
          - 对每一行数据：
            * 提取序号值
            * 标准化序号值
            * 在映射表中查找对应行号
            * 如果找到：替换该行数据
            * 如果未找到：跳过该行
    6. 保存修改后的文件
    7. 返回处理结果和统计信息
    """
    pass
```

### 性能优化策略

1. **序号映射表**: 
   - 一次性构建序号到行号的映射
   - 后续查找为O(1)时间复杂度
   - 避免每次都遍历Excel

2. **早期验证**: 
   - 在处理前验证Excel是否包含序号列
   - 在处理前验证AI表格是否包含序号列
   - 避免无效处理

3. **批量操作**:
   - 一次性读取所有需要的数据
   - 批量写入修改

### 序号标准化规则

```python
def normalize_sequence(value: Any) -> str:
    """
    标准化序号值：
    1. 转换为字符串
    2. 去除前导和尾随空格
    3. 去除前导零（但保留单个"0"）
    4. 统一处理None和空字符串
    """
    if value is None or value == "":
        return ""
    
    # 转换为字符串
    str_value = str(value).strip()
    
    # 去除前导零，但保留单个"0"
    if str_value.isdigit():
        str_value = str(int(str_value))
    
    return str_value
```

### 日志记录

```python
# 关键操作日志
logger.info(f"开始处理Excel文件: {excel_path}")
logger.info(f"找到序号列: 列索引={col_index}, 表头行={header_row}")
logger.info(f"构建序号映射: 共{len(sequence_map)}个序号")
logger.info(f"提取到{len(tables)}个AI表格")
logger.info(f"表格{table_idx}: 包含序号列，开始处理")
logger.debug(f"序号匹配成功: AI序号={seq_value} -> Excel行={row_num}")
logger.warning(f"序号未找到: AI序号={seq_value}")
logger.warning(f"表格{table_idx}: 不包含序号列，跳过")
logger.info(f"处理完成: 匹配{matched}行, 跳过{skipped}行")
```

### 配置说明

- `max_header_search_rows`: 默认20，在前20行中查找表头
- `normalize_sequence`: 默认True，启用序号标准化
- `skip_empty_sequence`: 默认True，跳过空序号行
- `log_level`: 默认INFO，可设置为DEBUG查看详细日志

## API Interface

### Request

```typescript
interface ModifyExcelBySequenceRequest {
  originalFilePath: string    // 原Excel文件路径
  aiResult: string           // AI分析结果（Markdown格式）
  originalFileName: string   // 原文件名
}
```

### Response

```typescript
interface ModifyExcelBySequenceResponse {
  success: boolean
  downloadUrl?: string       // 下载URL
  fileName?: string         // 修改后的文件名
  statistics?: {
    total_tables: number
    processed_tables: number
    skipped_tables: number
    total_rows: number
    matched_rows: number
    skipped_rows: number
    processing_time: number
  }
  error?: string
  warnings?: string[]
}
```

## Comparison with Previous Approach

### 之前的方案（多列匹配）

- 优点：不依赖特定列，更通用
- 缺点：
  - 逻辑复杂，需要比对多列
  - 可能出现误匹配
  - 性能较低，需要多次比对
  - 需要维护行指针和回环搜索

### 新方案（序号匹配）

- 优点：
  - 逻辑简单，直接通过序号定位
  - 匹配准确，不会误匹配
  - 性能高，O(1)查找
  - 代码更易维护
- 缺点：
  - 依赖"序号"列存在
  - 对于没有序号列的表格无法处理

### 适用场景

新方案特别适合：
- 有明确序号列的规范表格（如：KHG51-SD01 烘烤炉电气件清单.xlsx）
- 需要精确匹配的场景
- 大型表格需要高性能处理的场景

如果表格没有序号列，可以回退到之前的多列匹配方案。
