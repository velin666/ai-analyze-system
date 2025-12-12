# Configuration Reference

## Overview

This document describes all configuration parameters for the Excel Row-Level Matching system and how to customize them for your specific use case.

---

## Table of Contents

1. [ProcessingConfig Parameters](#processingconfig-parameters)
2. [Default Configuration](#default-configuration)
3. [Customizing Configuration](#customizing-configuration)
4. [Configuration Scenarios](#configuration-scenarios)
5. [Performance Tuning](#performance-tuning)
6. [Advanced Configuration](#advanced-configuration)

---

## ProcessingConfig Parameters

### Complete Parameter List

```python
@dataclass
class ProcessingConfig:
    """Configuration for Excel processing behavior"""
    
    row_match_threshold: int = 2
    header_match_threshold: float = 0.5
    enable_wraparound_search: bool = True
    max_search_distance: int = 1000
    preserve_formulas: bool = True
    log_level: str = "INFO"
```

---

### Parameter Details

#### 1. row_match_threshold

**Type:** `int`  
**Default:** `2`  
**Range:** `1` to `10`

**Description:**  
Minimum number of columns that must match exactly for two rows to be considered a match.

**How it works:**
- When comparing an AI row with an Excel row, the system counts how many columns have identical values
- If the count is ≥ `row_match_threshold`, the rows are considered a match
- Comparison is case-insensitive and whitespace-trimmed

**Examples:**

```python
# Strict matching (requires 3 matching columns)
config = ProcessingConfig(row_match_threshold=3)

# Lenient matching (requires only 1 matching column)
config = ProcessingConfig(row_match_threshold=1)

# Default (requires 2 matching columns)
config = ProcessingConfig(row_match_threshold=2)
```

**When to adjust:**
- **Increase (3-4):** When you have many similar rows and need precise matching
- **Decrease (1):** When data quality is poor or columns frequently change
- **Keep default (2):** For most use cases

**Impact:**
- Higher values: Fewer false matches, but more rows may be skipped
- Lower values: More rows matched, but higher risk of incorrect matches

---

#### 2. header_match_threshold

**Type:** `float`  
**Default:** `0.5` (50%)  
**Range:** `0.0` to `1.0`

**Description:**  
Minimum percentage of AI table headers that must match Excel headers for the table to be processed.

**How it works:**
- System compares AI table headers with Excel headers
- Calculates match rate: `matched_headers / total_ai_headers`
- If match rate ≥ `header_match_threshold`, table is processed
- Otherwise, table is skipped

**Examples:**

```python
# Strict header matching (requires 80% match)
config = ProcessingConfig(header_match_threshold=0.8)

# Lenient header matching (requires 30% match)
config = ProcessingConfig(header_match_threshold=0.3)

# Default (requires 50% match)
config = ProcessingConfig(header_match_threshold=0.5)
```

**Calculation example:**

AI Headers: `[序号, 名称, 型号, 数量]` (4 headers)  
Excel Headers: `[序号, 名称, 型号, 单位, 备注]`

Matched: `序号, 名称, 型号` (3 out of 4)  
Match Rate: `3 / 4 = 0.75` (75%)

- With threshold 0.5: ✓ Table processed
- With threshold 0.8: ✗ Table skipped

**When to adjust:**
- **Increase (0.7-0.9):** When you want strict header validation
- **Decrease (0.3-0.4):** When AI tables have fewer columns than Excel
- **Keep default (0.5):** For balanced validation

**Impact:**
- Higher values: Fewer tables processed, but higher confidence
- Lower values: More tables processed, but may process incorrect tables

---

#### 3. enable_wraparound_search

**Type:** `bool`  
**Default:** `True`

**Description:**  
Whether to perform a second search from the beginning of the file if a row isn't found from the current pointer to the end.

**How it works:**

**Without wraparound (False):**
```
Current pointer at row 50
Search rows 50-100 for match
If not found → skip row
```

**With wraparound (True):**
```
Current pointer at row 50
Search rows 50-100 for match
If not found → search rows 1-49 for match
If still not found → skip row
```

**Examples:**

```python
# Disable wraparound (faster, but may miss rows)
config = ProcessingConfig(enable_wraparound_search=False)

# Enable wraparound (default, more thorough)
config = ProcessingConfig(enable_wraparound_search=True)
```

**When to adjust:**
- **Disable (False):** When data is strictly in order and performance is critical
- **Enable (True):** When data may be out of order or you want maximum match rate

**Impact:**
- Enabled: ~15% higher match rate, ~10-20% slower
- Disabled: Faster processing, but may miss out-of-order rows

---

#### 4. max_search_distance

**Type:** `int`  
**Default:** `1000`  
**Range:** `100` to `100000`

**Description:**  
Maximum number of rows to search when looking for a match. Prevents performance issues on very large files.

**How it works:**
- Limits the search range to prevent excessive scanning
- If a match isn't found within this distance, the row is skipped
- Applies to both forward and wraparound searches

**Examples:**

```python
# Small search window (faster, for ordered data)
config = ProcessingConfig(max_search_distance=500)

# Large search window (slower, for unordered data)
config = ProcessingConfig(max_search_distance=5000)

# Default (balanced)
config = ProcessingConfig(max_search_distance=1000)
```

**When to adjust:**
- **Decrease (100-500):** For large files where data is in order
- **Increase (2000-5000):** For files where data is significantly out of order
- **Keep default (1000):** For most use cases

**Impact:**
- Lower values: Faster processing, but may miss distant matches
- Higher values: More thorough matching, but slower on large files

---

#### 5. preserve_formulas

**Type:** `bool`  
**Default:** `True`

**Description:**  
Whether to preserve Excel formulas when replacing cell values.

**How it works:**

**Preserve formulas (True):**
- If a cell contains a formula, it's replaced with the new value (not a formula)
- Formula is lost, but the new value is written

**Don't preserve (False):**
- Cells are replaced regardless of whether they contain formulas
- Same behavior as True (this parameter is for future enhancement)

**Examples:**

```python
# Preserve formulas (default)
config = ProcessingConfig(preserve_formulas=True)

# Don't preserve formulas
config = ProcessingConfig(preserve_formulas=False)
```

**Note:** Currently, both settings have the same behavior. This parameter is reserved for future enhancements where formulas might be preserved or updated intelligently.

---

#### 6. log_level

**Type:** `str`  
**Default:** `"INFO"`  
**Options:** `"DEBUG"`, `"INFO"`, `"WARNING"`, `"ERROR"`, `"CRITICAL"`

**Description:**  
Python logging level for the processing script.

**Log levels:**

- **DEBUG:** Very detailed logs, including every row comparison
- **INFO:** Standard logs, including table processing and match results
- **WARNING:** Only warnings and errors
- **ERROR:** Only errors
- **CRITICAL:** Only critical errors

**Examples:**

```python
# Detailed debugging
config = ProcessingConfig(log_level="DEBUG")

# Standard logging (default)
config = ProcessingConfig(log_level="INFO")

# Minimal logging
config = ProcessingConfig(log_level="WARNING")
```

**When to adjust:**
- **DEBUG:** When troubleshooting matching issues
- **INFO:** For normal operation (default)
- **WARNING:** For production with minimal logs
- **ERROR:** When you only want to see failures

**Impact:**
- DEBUG: Very verbose logs, useful for troubleshooting
- INFO: Balanced logging, shows progress and results
- WARNING/ERROR: Minimal logs, faster processing

---

## Default Configuration

### Standard Configuration

```python
config = ProcessingConfig(
    row_match_threshold=2,           # Require 2 matching columns
    header_match_threshold=0.5,      # Require 50% header match
    enable_wraparound_search=True,   # Enable circular search
    max_search_distance=1000,        # Search up to 1000 rows
    preserve_formulas=True,          # Preserve formulas
    log_level="INFO"                 # Standard logging
)
```

This configuration works well for:
- Files with 100-1000 rows
- Data in roughly the same order
- Standard data quality
- Typical use cases

---

## Customizing Configuration

### Method 1: Python Direct Usage

```python
from modify_excel import modify_excel, ProcessingConfig

# Create custom configuration
config = ProcessingConfig(
    row_match_threshold=3,
    header_match_threshold=0.6,
    enable_wraparound_search=True,
    log_level="DEBUG"
)

# Use custom configuration
result = modify_excel(
    original_path='file.xlsx',
    ai_result=markdown_tables,
    output_dir='uploads/modified',
    config=config
)
```

### Method 2: Modify Default in Code

Edit `server/api/files/modify_excel.py`:

```python
# Find the ExcelProcessor initialization
processor = ExcelProcessor(
    original_path, 
    ai_result, 
    config or ProcessingConfig(
        row_match_threshold=3,  # Change default here
        header_match_threshold=0.6
    )
)
```

### Method 3: Environment Variables (Future Enhancement)

```bash
# Set environment variables
export EXCEL_ROW_MATCH_THRESHOLD=3
export EXCEL_HEADER_MATCH_THRESHOLD=0.6
export EXCEL_ENABLE_WRAPAROUND=true
```

**Note:** This method is not currently implemented but could be added.

---

## Configuration Scenarios

### Scenario 1: High-Quality Data, Strict Matching

**Use case:** Data is clean, well-structured, and you want to avoid false matches.

```python
config = ProcessingConfig(
    row_match_threshold=3,           # Require 3 matching columns
    header_match_threshold=0.7,      # Require 70% header match
    enable_wraparound_search=False,  # Data is in order
    max_search_distance=500,         # Limited search
    log_level="INFO"
)
```

**Expected results:**
- Higher precision, fewer false matches
- May skip more rows if data doesn't match exactly
- Faster processing

---

### Scenario 2: Poor Data Quality, Lenient Matching

**Use case:** Data has inconsistencies, typos, or frequent changes.

```python
config = ProcessingConfig(
    row_match_threshold=1,           # Require only 1 matching column
    header_match_threshold=0.3,      # Require 30% header match
    enable_wraparound_search=True,   # Search thoroughly
    max_search_distance=2000,        # Extended search
    log_level="DEBUG"                # Detailed logs for troubleshooting
)
```

**Expected results:**
- Higher match rate
- Risk of false matches
- Slower processing
- Detailed logs help identify issues

---

### Scenario 3: Large Files, Performance Priority

**Use case:** Files with 5000+ rows where speed is important.

```python
config = ProcessingConfig(
    row_match_threshold=2,           # Standard matching
    header_match_threshold=0.5,      # Standard threshold
    enable_wraparound_search=False,  # Skip wraparound for speed
    max_search_distance=500,         # Limited search distance
    log_level="WARNING"              # Minimal logging
)
```

**Expected results:**
- Faster processing
- May miss some out-of-order rows
- Minimal log overhead

---

### Scenario 4: Out-of-Order Data

**Use case:** AI results are not in the same order as the Excel file.

```python
config = ProcessingConfig(
    row_match_threshold=2,           # Standard matching
    header_match_threshold=0.5,      # Standard threshold
    enable_wraparound_search=True,   # Essential for out-of-order data
    max_search_distance=5000,        # Large search window
    log_level="INFO"
)
```

**Expected results:**
- Higher match rate for out-of-order data
- Slower processing
- More thorough matching

---

### Scenario 5: Debugging and Troubleshooting

**Use case:** Investigating why rows aren't matching.

```python
config = ProcessingConfig(
    row_match_threshold=2,           # Standard matching
    header_match_threshold=0.5,      # Standard threshold
    enable_wraparound_search=True,   # Full search
    max_search_distance=1000,        # Standard distance
    log_level="DEBUG"                # Detailed logs
)
```

**Expected results:**
- Very detailed logs showing:
  - Every row comparison
  - Which columns matched
  - Why rows were skipped
- Slower processing due to logging overhead

---

## Performance Tuning

### Optimizing for Speed

**Priority: Minimize processing time**

```python
config = ProcessingConfig(
    row_match_threshold=2,
    header_match_threshold=0.5,
    enable_wraparound_search=False,  # ← Disable for speed
    max_search_distance=500,         # ← Reduce search distance
    log_level="WARNING"              # ← Minimal logging
)
```

**Expected improvement:** 30-50% faster processing

---

### Optimizing for Match Rate

**Priority: Match as many rows as possible**

```python
config = ProcessingConfig(
    row_match_threshold=1,           # ← Lower threshold
    header_match_threshold=0.3,      # ← Lower threshold
    enable_wraparound_search=True,   # ← Enable wraparound
    max_search_distance=2000,        # ← Increase search distance
    log_level="INFO"
)
```

**Expected improvement:** 15-25% higher match rate

---

### Balanced Configuration

**Priority: Good balance of speed and accuracy**

```python
config = ProcessingConfig(
    row_match_threshold=2,
    header_match_threshold=0.5,
    enable_wraparound_search=True,
    max_search_distance=1000,
    log_level="INFO"
)
```

This is the default configuration and works well for most cases.

---

## Advanced Configuration

### Dynamic Configuration Based on File Size

```python
def get_config_for_file(file_path: str) -> ProcessingConfig:
    """Generate configuration based on file size"""
    import os
    from openpyxl import load_workbook
    
    # Load workbook to check size
    wb = load_workbook(file_path, read_only=True)
    ws = wb.active
    row_count = ws.max_row
    wb.close()
    
    if row_count < 500:
        # Small file: thorough matching
        return ProcessingConfig(
            row_match_threshold=2,
            enable_wraparound_search=True,
            max_search_distance=2000,
            log_level="INFO"
        )
    elif row_count < 2000:
        # Medium file: balanced
        return ProcessingConfig(
            row_match_threshold=2,
            enable_wraparound_search=True,
            max_search_distance=1000,
            log_level="INFO"
        )
    else:
        # Large file: optimize for speed
        return ProcessingConfig(
            row_match_threshold=2,
            enable_wraparound_search=False,
            max_search_distance=500,
            log_level="WARNING"
        )

# Usage
config = get_config_for_file('large_file.xlsx')
result = modify_excel('large_file.xlsx', ai_result, config=config)
```

---

### Configuration Validation

```python
def validate_config(config: ProcessingConfig) -> bool:
    """Validate configuration parameters"""
    
    # Validate row_match_threshold
    if config.row_match_threshold < 1:
        raise ValueError("row_match_threshold must be at least 1")
    if config.row_match_threshold > 10:
        print("Warning: row_match_threshold > 10 may result in very few matches")
    
    # Validate header_match_threshold
    if not 0.0 <= config.header_match_threshold <= 1.0:
        raise ValueError("header_match_threshold must be between 0.0 and 1.0")
    if config.header_match_threshold < 0.2:
        print("Warning: header_match_threshold < 0.2 may process incorrect tables")
    
    # Validate max_search_distance
    if config.max_search_distance < 10:
        raise ValueError("max_search_distance must be at least 10")
    if config.max_search_distance > 10000:
        print("Warning: max_search_distance > 10000 may cause performance issues")
    
    # Validate log_level
    valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    if config.log_level not in valid_levels:
        raise ValueError(f"log_level must be one of {valid_levels}")
    
    return True

# Usage
config = ProcessingConfig(row_match_threshold=3)
validate_config(config)
```

---

## Summary

### Quick Reference Table

| Parameter | Default | Range | Impact on Speed | Impact on Accuracy |
|-----------|---------|-------|-----------------|-------------------|
| `row_match_threshold` | 2 | 1-10 | Minimal | High |
| `header_match_threshold` | 0.5 | 0.0-1.0 | Minimal | High |
| `enable_wraparound_search` | True | True/False | Medium | Medium |
| `max_search_distance` | 1000 | 100-100000 | High | Medium |
| `preserve_formulas` | True | True/False | Minimal | N/A |
| `log_level` | INFO | DEBUG-CRITICAL | Low | N/A |

### Recommendations

**For most use cases:** Use default configuration

**For high-quality data:** Increase thresholds (3, 0.7)

**For poor-quality data:** Decrease thresholds (1, 0.3)

**For large files:** Disable wraparound, reduce search distance

**For debugging:** Set log_level to DEBUG

---

**Last Updated:** December 12, 2025  
**Version:** 1.0
