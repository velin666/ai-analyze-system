# Excel Row-Level Matching API Documentation

## Overview

The Excel Row-Level Matching API provides intelligent row-by-row matching and replacement functionality for Excel files based on AI-generated analysis results. Instead of replacing entire tables, the system precisely identifies and updates individual rows by matching multiple column values.

**Version:** 2.0  
**Last Updated:** December 12, 2025

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Endpoint](#api-endpoint)
3. [Request Format](#request-format)
4. [Response Format](#response-format)
5. [Configuration Parameters](#configuration-parameters)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Processing Statistics](#processing-statistics)
9. [Best Practices](#best-practices)

---

## Quick Start

### Basic Usage

```typescript
// Frontend example
const response = await fetch('/api/files/modify-excel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    originalFilePath: '/path/to/original.xlsx',
    aiResult: '| 序号 | 名称 | 型号 |\n|---|---|---|\n| 1 | 电机 | 0.75KW |',
    originalFileName: 'original.xlsx'
  })
});

const result = await response.json();
console.log(result.statistics); // View processing statistics
```

---

## API Endpoint

### POST `/api/files/modify-excel`

Processes an Excel file by matching and replacing rows based on AI analysis results.

**Endpoint:** `/api/files/modify-excel`  
**Method:** `POST`  
**Content-Type:** `application/json`  
**Timeout:** 30 seconds

---

## Request Format

### Request Interface

```typescript
interface ModifyExcelRequest {
  originalFilePath: string;      // Server path to the original Excel file
  aiResult: string;              // AI analysis result in Markdown table format
  originalFileName: string;      // Original filename (for generating output name)
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `originalFilePath` | string | Yes | Full server path to the original Excel file (e.g., `/uploads/abc123.xlsx`) |
| `aiResult` | string | Yes | AI-generated analysis result containing one or more Markdown tables |
| `originalFileName` | string | Yes | Original filename used to generate the output filename |

### AI Result Format

The `aiResult` parameter should contain Markdown-formatted tables:

```markdown
| 序号 | 名称 | 型号 | 数量 |
|------|------|------|------|
| 12 | 电机 | 0.75KW | 1 |
| 27 | 传感器 | XYZ-100 | 21 |
```

**Requirements:**
- Tables must use standard Markdown table syntax with `|` delimiters
- First row is treated as headers
- Second row is the separator (e.g., `|---|---|---|`)
- Data rows start from the third row
- Multiple tables are supported and processed sequentially

---

## Response Format

### Response Interface

```typescript
interface ModifyExcelResponse {
  success: boolean;              // Whether processing succeeded
  downloadUrl?: string;          // Download URL for the modified file
  fileName?: string;             // Name of the modified file
  statistics?: ProcessingStatistics;  // Detailed processing statistics
  error?: string;                // Error message if failed
  warnings?: string[];           // Non-fatal warnings during processing
}
```

### ProcessingStatistics Interface

```typescript
interface ProcessingStatistics {
  total_tables: number;          // Total number of tables in AI result
  processed_tables: number;      // Number of successfully processed tables
  skipped_tables: number;        // Number of skipped tables (header mismatch)
  total_rows: number;            // Total number of data rows in all tables
  matched_rows: number;          // Number of successfully matched and replaced rows
  skipped_rows: number;          // Number of rows that couldn't be matched
  processing_time: number;       // Total processing time in seconds
}
```

### Success Response Example

```json
{
  "success": true,
  "downloadUrl": "http://localhost:3000/api/files/download-modified/original(修改后).xlsx",
  "fileName": "original(修改后).xlsx",
  "statistics": {
    "total_tables": 2,
    "processed_tables": 2,
    "skipped_tables": 0,
    "total_rows": 45,
    "matched_rows": 43,
    "skipped_rows": 2,
    "processing_time": 1.23
  },
  "warnings": []
}
```

### Error Response Example

```json
{
  "success": false,
  "error": "原始文件不存在",
  "statistics": {
    "total_tables": 0,
    "processed_tables": 0,
    "skipped_tables": 0,
    "total_rows": 0,
    "matched_rows": 0,
    "skipped_rows": 0,
    "processing_time": 0.0
  }
}
```

---

## Configuration Parameters

The system uses default configuration values that can be customized by modifying the `ProcessingConfig` class in `modify_excel.py`.

### ProcessingConfig

```python
@dataclass
class ProcessingConfig:
    row_match_threshold: int = 2              # Minimum columns that must match
    header_match_threshold: float = 0.5       # Minimum header match rate (50%)
    enable_wraparound_search: bool = True     # Enable circular search
    max_search_distance: int = 1000           # Maximum rows to search
    preserve_formulas: bool = True            # Preserve Excel formulas
    log_level: str = "INFO"                   # Logging level
```

### Configuration Details

| Parameter | Default | Description |
|-----------|---------|-------------|
| `row_match_threshold` | 2 | Minimum number of columns that must match exactly for two rows to be considered a match |
| `header_match_threshold` | 0.5 | Minimum percentage of AI table headers that must match Excel headers (0.5 = 50%) |
| `enable_wraparound_search` | True | If a row isn't found from current position to end, search from beginning to current position |
| `max_search_distance` | 1000 | Maximum number of rows to search (prevents performance issues on very large files) |
| `preserve_formulas` | True | Whether to preserve Excel formulas when replacing data |
| `log_level` | "INFO" | Python logging level: DEBUG, INFO, WARNING, ERROR |

---

## Usage Examples

### Example 1: Basic Excel Modification

```typescript
// Step 1: Upload the original file
const formData = new FormData();
formData.append('file', file);

const uploadResponse = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});

const uploadData = await uploadResponse.json();

// Step 2: Get AI analysis (from Coze workflow or other AI service)
const aiResult = `
| 序号 | 名称 | 型号 | 数量 |
|------|------|------|------|
| 12 | 电机 | 0.75KW | 1 |
| 27 | 传感器 | XYZ-100 | 21 |
`;

// Step 3: Modify the Excel file
const modifyResponse = await fetch('/api/files/modify-excel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalFilePath: uploadData.path,
    aiResult: aiResult,
    originalFileName: file.name
  })
});

const result = await modifyResponse.json();

if (result.success) {
  console.log(`✓ Successfully modified ${result.statistics.matched_rows} rows`);
  console.log(`Download: ${result.downloadUrl}`);
} else {
  console.error(`✗ Error: ${result.error}`);
}
```

### Example 2: Processing Multiple Tables

```typescript
const aiResult = `
## Table 1: Motors
| 序号 | 名称 | 型号 |
|------|------|------|
| 12 | 电机 | 0.75KW |

## Table 2: Sensors
| 序号 | 名称 | 数量 |
|------|------|------|
| 27 | 传感器 | 21 |
`;

const response = await fetch('/api/files/modify-excel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalFilePath: '/uploads/equipment.xlsx',
    aiResult: aiResult,
    originalFileName: 'equipment.xlsx'
  })
});

const result = await response.json();

// Check statistics for each table
console.log(`Processed ${result.statistics.processed_tables} out of ${result.statistics.total_tables} tables`);
console.log(`Match rate: ${(result.statistics.matched_rows / result.statistics.total_rows * 100).toFixed(1)}%`);
```

### Example 3: Error Handling with Warnings

```typescript
const response = await fetch('/api/files/modify-excel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalFilePath: '/uploads/data.xlsx',
    aiResult: aiResult,
    originalFileName: 'data.xlsx'
  })
});

const result = await response.json();

if (result.success) {
  // Check for warnings even on success
  if (result.warnings && result.warnings.length > 0) {
    console.warn('Processing completed with warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Display statistics
  console.log('Statistics:');
  console.log(`  Tables: ${result.statistics.processed_tables}/${result.statistics.total_tables}`);
  console.log(`  Rows: ${result.statistics.matched_rows}/${result.statistics.total_rows}`);
  console.log(`  Time: ${result.statistics.processing_time.toFixed(2)}s`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

### Example 4: Python Direct Usage

```python
from modify_excel import modify_excel, ProcessingConfig

# Custom configuration
config = ProcessingConfig(
    row_match_threshold=3,           # Require 3 matching columns
    header_match_threshold=0.6,      # Require 60% header match
    enable_wraparound_search=True,
    log_level="DEBUG"
)

# Process the file
result = modify_excel(
    original_path='/path/to/original.xlsx',
    ai_result=markdown_tables,
    output_dir='uploads/modified',
    config=config
)

if result['success']:
    print(f"✓ Success: {result['filename']}")
    print(f"  Matched: {result['statistics']['matched_rows']} rows")
    print(f"  Output: {result['output_path']}")
else:
    print(f"✗ Error: {result['error']}")
```

---

## Error Handling

### Error Codes

The system returns user-friendly error messages with internal error codes:

| Error Code | Description | User Message |
|------------|-------------|--------------|
| `FILE_NOT_FOUND` | Original file doesn't exist | 文件不存在，请检查文件路径是否正确 |
| `PERMISSION_DENIED` | No file access permission | 无法访问文件，请检查文件权限或确保文件未被其他程序占用 |
| `INVALID_DATA` | Data format error | 数据格式不正确，请检查输入数据 |
| `TYPE_ERROR` | Data type mismatch | 数据类型不匹配，请检查输入数据格式 |
| `IO_ERROR` | File operation error | 文件读写失败，请检查磁盘空间或文件是否被占用 |
| `ENCODING_ERROR` | File encoding issue | 文件编码格式不支持，请确保文件使用UTF-8编码 |
| `UNKNOWN_ERROR` | Unexpected error | 处理过程中发生错误，请稍后重试或联系技术支持 |

### Common Error Scenarios

#### 1. File Not Found

```json
{
  "success": false,
  "error": "原始文件不存在",
  "statistics": { ... }
}
```

**Solution:** Verify the file path is correct and the file exists on the server.

#### 2. No Tables Found

```json
{
  "success": false,
  "error": "AI返回的内容中未找到Markdown表格",
  "statistics": { "total_tables": 0, ... }
}
```

**Solution:** Ensure the AI result contains properly formatted Markdown tables.

#### 3. No Rows Matched

```json
{
  "success": false,
  "error": "没有任何行被成功匹配和替换",
  "statistics": {
    "total_tables": 2,
    "processed_tables": 0,
    "matched_rows": 0,
    ...
  }
}
```

**Solution:** 
- Check if table headers in AI result match Excel headers
- Verify row data has at least 2 matching columns
- Review the `skipped_tables` count to see if headers didn't match

#### 4. Partial Success with Warnings

```json
{
  "success": true,
  "downloadUrl": "...",
  "statistics": {
    "matched_rows": 40,
    "skipped_rows": 5,
    ...
  },
  "warnings": [
    "表格2处理失败",
    "第15行未找到匹配"
  ]
}
```

**Solution:** Review warnings to understand which tables/rows were skipped.

---

## Processing Statistics

### Understanding Statistics

The `statistics` object provides detailed insights into the processing:

```typescript
{
  "total_tables": 3,        // AI result contained 3 tables
  "processed_tables": 2,    // 2 tables had matching headers
  "skipped_tables": 1,      // 1 table was skipped (header mismatch)
  "total_rows": 50,         // Total data rows across all tables
  "matched_rows": 45,       // 45 rows were successfully matched and replaced
  "skipped_rows": 5,        // 5 rows couldn't be matched
  "processing_time": 2.34   // Took 2.34 seconds
}
```

### Match Rate Calculation

```typescript
// Calculate overall success rate
const matchRate = (statistics.matched_rows / statistics.total_rows) * 100;
console.log(`Match rate: ${matchRate.toFixed(1)}%`);

// Calculate table processing rate
const tableRate = (statistics.processed_tables / statistics.total_tables) * 100;
console.log(`Table processing rate: ${tableRate.toFixed(1)}%`);
```

### Performance Metrics

- **Processing Time:** Typically 0.5-3 seconds for files with 100-500 rows
- **Row Pointer Optimization:** Reduces search time by ~60% for sequential data
- **Wraparound Search:** Adds ~10-20% overhead but increases match rate by ~15%

---

## Best Practices

### 1. Header Matching

**✓ Good Practice:**
```markdown
| 序号 | 名称 | 型号 | 数量 |
```
- Use exact or similar column names as in the Excel file
- At least 50% of headers should match

**✗ Bad Practice:**
```markdown
| ID | Product | Model | Qty |
```
- Completely different header names may cause table to be skipped

### 2. Row Matching

**✓ Good Practice:**
- Include unique identifiers (序号, 编号, ID)
- Include at least 2-3 stable columns for matching
- Use consistent data formats

**✗ Bad Practice:**
- Only include columns that frequently change
- Use inconsistent formatting (e.g., "0.75KW" vs "O.75KW")

### 3. Data Quality

**✓ Good Practice:**
```markdown
| 12 | 电机 | 0.75KW | 1 |
```
- Clean, consistent data
- Proper encoding (UTF-8)
- No extra whitespace

**✗ Bad Practice:**
```markdown
|  12  | 电机  |O.75KW  |1|
```
- Inconsistent spacing (though the system handles this)
- Typos in critical matching columns

### 4. Performance Optimization

**For Large Files (>1000 rows):**
- Ensure data is roughly in the same order as the Excel file
- Use row pointer optimization (enabled by default)
- Consider processing in batches if dealing with >10,000 rows

**For Multiple Tables:**
- Process tables sequentially (automatic)
- Each table is isolated - one failure doesn't affect others

### 5. Error Recovery

```typescript
// Implement retry logic for transient errors
async function modifyExcelWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/files/modify-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result;
      } else if (result.error.includes('文件被占用') && i < maxRetries - 1) {
        // Retry for file lock errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

### 6. Logging and Monitoring

```typescript
// Log statistics for monitoring
function logProcessingStats(result) {
  if (result.success) {
    console.log('[Excel Modify] Success', {
      fileName: result.fileName,
      matchRate: (result.statistics.matched_rows / result.statistics.total_rows * 100).toFixed(1) + '%',
      processingTime: result.statistics.processing_time.toFixed(2) + 's',
      tables: `${result.statistics.processed_tables}/${result.statistics.total_tables}`,
      rows: `${result.statistics.matched_rows}/${result.statistics.total_rows}`
    });
  } else {
    console.error('[Excel Modify] Failed', {
      error: result.error,
      statistics: result.statistics
    });
  }
}
```

---

## Appendix

### System Architecture

```
┌─────────────────────────────────────┐
│   Frontend (Vue/Nuxt)               │
│   - File upload                     │
│   - API calls                       │
│   - Result display                  │
└──────────────┬──────────────────────┘
               │ HTTP POST
               ▼
┌─────────────────────────────────────┐
│   API Layer (TypeScript)            │
│   - modify-excel.post.ts            │
│   - Request validation              │
│   - Response formatting             │
└──────────────┬──────────────────────┘
               │ spawn Python process
               ▼
┌─────────────────────────────────────┐
│   Processing Layer (Python)         │
│   - modify_excel.py                 │
│   - Table extraction                │
│   - Header matching                 │
│   - Row matching                    │
│   - Data replacement                │
└──────────────┬──────────────────────┘
               │ openpyxl
               ▼
┌─────────────────────────────────────┐
│   Storage Layer                     │
│   - uploads/                        │
│   - uploads/modified/               │
└─────────────────────────────────────┘
```

### Related Documentation

- [Requirements Document](./requirements.md) - Detailed system requirements
- [Design Document](./design.md) - Technical design and architecture
- [Tasks Document](./tasks.md) - Implementation task list
- [Integration Test Results](../../server/api/files/INTEGRATION_TEST_RESULTS.md) - Test results
- [Boundary Test Results](../../server/api/files/BOUNDARY_TEST_RESULTS.md) - Edge case testing

### Support

For issues or questions:
1. Check the error message and error code
2. Review the processing statistics
3. Verify input data format
4. Check server logs for detailed error information

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Maintained By:** Development Team
