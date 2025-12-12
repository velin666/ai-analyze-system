# Excel Row-Level Matching - User Guide

## Introduction

This guide explains how to use the Excel Row-Level Matching feature to intelligently update Excel files based on AI analysis results. Unlike traditional "replace entire table" approaches, this system precisely identifies and updates individual rows by matching multiple column values.

---

## Table of Contents

1. [What is Row-Level Matching?](#what-is-row-level-matching)
2. [How It Works](#how-it-works)
3. [Step-by-Step Tutorial](#step-by-step-tutorial)
4. [Understanding Match Results](#understanding-match-results)
5. [Troubleshooting](#troubleshooting)
6. [Tips and Best Practices](#tips-and-best-practices)
7. [FAQ](#faq)

---

## What is Row-Level Matching?

### The Problem

Traditional Excel modification tools replace entire tables, which can:
- Lose data that wasn't in the AI analysis
- Overwrite correct data with incomplete information
- Fail when table structures don't match exactly

### The Solution

Row-level matching:
- ✓ Finds the exact row to update by comparing multiple columns
- ✓ Only updates the specific cells that need changing
- ✓ Preserves all other data in the Excel file
- ✓ Handles multiple tables in one operation
- ✓ Provides detailed statistics about what was changed

### Example Scenario

**Original Excel File:**
```
| 序号 | 名称   | 型号    | 数量 | 备注     |
|------|--------|---------|------|----------|
| 12   | 电机   | O.75KW  | 1    | 需要检查 |
| 27   | 传感器 | XYZ-100 | 26   | 正常     |
```

**AI Analysis Result:**
```
| 序号 | 名称   | 型号    | 数量 |
|------|--------|---------|------|
| 12   | 电机   | 0.75KW  | 1    |
| 27   | 传感器 | XYZ-100 | 21   |
```

**Result After Processing:**
```
| 序号 | 名称   | 型号    | 数量 | 备注     |
|------|--------|---------|------|----------|
| 12   | 电机   | 0.75KW  | 1    | 需要检查 | ← 型号 corrected
| 27   | 传感器 | XYZ-100 | 21   | 正常     | ← 数量 updated
```

Notice:
- Row 12: Only the "型号" column was updated (O.75KW → 0.75KW)
- Row 27: Only the "数量" column was updated (26 → 21)
- The "备注" column was preserved in both rows
- All other rows in the file remain unchanged

---

## How It Works

### 1. Table Extraction

The system extracts all Markdown tables from the AI result:

```markdown
## Analysis Results

| 序号 | 名称 | 型号 |
|------|------|------|
| 12 | 电机 | 0.75KW |

## Additional Findings

| 序号 | 数量 |
|------|------|
| 27 | 21 |
```

Both tables are extracted and processed separately.

### 2. Header Matching

For each table, the system matches headers with the Excel file:

**AI Table Headers:** `[序号, 名称, 型号]`  
**Excel Headers:** `[序号, 名称, 型号, 数量, 备注]`

**Match Result:** 3 out of 3 AI headers found (100% match) ✓

**Threshold:** At least 50% of AI headers must match Excel headers.

### 3. Row Matching

For each data row in the AI table, the system:

1. **Starts from a pointer position** (initially after the header row)
2. **Compares each Excel row** by checking column values
3. **Counts matching columns** (case-insensitive, whitespace-trimmed)
4. **Declares a match** when at least 2 columns match exactly
5. **Updates the pointer** to the matched row position

**Example:**

AI Row: `[12, 电机, 0.75KW]`

Comparing with Excel rows:
- Row 5: `[11, 开关, ABC]` → 0 matches ✗
- Row 6: `[12, 电机, O.75KW]` → 2 matches (序号, 名称) ✓

**Match found!** Row 6 will be updated.

### 4. Data Replacement

Only the mapped columns are updated:

- Column "序号": 12 → 12 (no change)
- Column "名称": 电机 → 电机 (no change)
- Column "型号": O.75KW → 0.75KW (updated)
- Column "数量": (not in AI table, preserved)
- Column "备注": (not in AI table, preserved)

### 5. Performance Optimization

**Row Pointer:** After matching row 6, the next search starts from row 7, not row 1. This dramatically speeds up processing for large files.

**Wraparound Search:** If a row isn't found from the current position to the end, the system searches from the beginning to the current position once more.

---

## Step-by-Step Tutorial

### Tutorial 1: Basic Excel Modification

#### Step 1: Prepare Your Excel File

Ensure your Excel file has:
- Clear headers in the first few rows
- Consistent data formatting
- Unique identifiers (like 序号, ID, 编号)

#### Step 2: Get AI Analysis

Use an AI service (like Coze workflow) to analyze your Excel file. The AI should return results in Markdown table format:

```markdown
| 序号 | 名称 | 型号 |
|------|------|------|
| 12 | 电机 | 0.75KW |
| 27 | 传感器 | XYZ-100 |
```

#### Step 3: Call the API

```typescript
const response = await fetch('/api/files/modify-excel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    originalFilePath: '/uploads/abc123.xlsx',
    aiResult: markdownTables,
    originalFileName: 'equipment.xlsx'
  })
});

const result = await response.json();
```

#### Step 4: Check the Results

```typescript
if (result.success) {
  console.log('✓ Processing successful!');
  console.log(`  Modified file: ${result.fileName}`);
  console.log(`  Download URL: ${result.downloadUrl}`);
  console.log(`  Matched rows: ${result.statistics.matched_rows}`);
  console.log(`  Total rows: ${result.statistics.total_rows}`);
  console.log(`  Match rate: ${(result.statistics.matched_rows / result.statistics.total_rows * 100).toFixed(1)}%`);
} else {
  console.error('✗ Processing failed:', result.error);
}
```

#### Step 5: Download the Modified File

Use the `downloadUrl` from the response to download the modified Excel file:

```typescript
window.location.href = result.downloadUrl;
// or
const link = document.createElement('a');
link.href = result.downloadUrl;
link.download = result.fileName;
link.click();
```

---

### Tutorial 2: Handling Multiple Tables

When the AI returns multiple tables, they are processed sequentially:

```markdown
## Table 1: Motors
| 序号 | 名称 | 型号 |
|------|------|------|
| 12 | 电机 | 0.75KW |

## Table 2: Sensors  
| 序号 | 名称 | 数量 |
|------|------|------|
| 27 | 传感器 | 21 |
| 28 | 传感器 | 15 |
```

**Processing:**
1. Table 1 is processed first (updates row 12)
2. Table 2 is processed second (updates rows 27 and 28)
3. If Table 1 fails, Table 2 is still processed
4. Statistics show results for all tables combined

**Check Statistics:**

```typescript
console.log(`Tables: ${result.statistics.processed_tables}/${result.statistics.total_tables}`);
// Output: Tables: 2/2

console.log(`Rows: ${result.statistics.matched_rows}/${result.statistics.total_rows}`);
// Output: Rows: 3/3
```

---

### Tutorial 3: Handling Errors and Warnings

#### Scenario: Some Rows Don't Match

```typescript
const result = await response.json();

if (result.success) {
  // Check for warnings
  if (result.warnings && result.warnings.length > 0) {
    console.warn('⚠ Processing completed with warnings:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
  }
  
  // Check match rate
  const matchRate = (result.statistics.matched_rows / result.statistics.total_rows) * 100;
  
  if (matchRate < 80) {
    console.warn(`⚠ Low match rate: ${matchRate.toFixed(1)}%`);
    console.warn(`  Matched: ${result.statistics.matched_rows} rows`);
    console.warn(`  Skipped: ${result.statistics.skipped_rows} rows`);
  }
}
```

#### Scenario: Table Headers Don't Match

```typescript
const result = await response.json();

if (result.statistics.skipped_tables > 0) {
  console.warn(`⚠ ${result.statistics.skipped_tables} table(s) were skipped`);
  console.warn('Possible reasons:');
  console.warn('  - Headers in AI table don\'t match Excel headers');
  console.warn('  - Less than 50% of headers matched');
  console.warn('  - Table format is incorrect');
}
```

---

## Understanding Match Results

### Statistics Breakdown

```typescript
{
  "total_tables": 3,        // AI result had 3 tables
  "processed_tables": 2,    // 2 tables had matching headers
  "skipped_tables": 1,      // 1 table was skipped
  "total_rows": 50,         // 50 data rows total
  "matched_rows": 45,       // 45 rows were matched and updated
  "skipped_rows": 5,        // 5 rows couldn't be matched
  "processing_time": 2.34   // Took 2.34 seconds
}
```

### What Each Metric Means

**total_tables**
- Number of Markdown tables found in the AI result
- Each table is processed independently

**processed_tables**
- Tables where headers matched successfully (≥50% match rate)
- These tables had their rows processed

**skipped_tables**
- Tables where headers didn't match well enough
- These tables were ignored entirely

**total_rows**
- Total number of data rows across all tables
- Excludes header and separator rows

**matched_rows**
- Rows where at least 2 columns matched an Excel row
- These rows were successfully updated

**skipped_rows**
- Rows where no matching Excel row was found
- These updates were not applied

**processing_time**
- Total time in seconds
- Includes file I/O, matching, and replacement

### Interpreting Results

**Excellent Result:**
```
Matched: 48/50 rows (96%)
Tables: 3/3
```
- Almost all rows matched
- All tables processed
- High confidence in results

**Good Result:**
```
Matched: 40/50 rows (80%)
Tables: 2/3
Warnings: ["表格3处理失败"]
```
- Most rows matched
- One table had header mismatch
- Review warnings to understand what was skipped

**Poor Result:**
```
Matched: 10/50 rows (20%)
Tables: 1/3
```
- Low match rate
- Multiple tables skipped
- Check header names and data quality

---

## Troubleshooting

### Problem: No Tables Found

**Error:** "AI返回的内容中未找到Markdown表格"

**Causes:**
- AI result doesn't contain Markdown tables
- Table format is incorrect

**Solutions:**
1. Verify AI result contains tables with `|` delimiters
2. Check table format:
   ```markdown
   | Header1 | Header2 |
   |---------|---------|
   | Data1   | Data2   |
   ```
3. Ensure there are no encoding issues

---

### Problem: All Tables Skipped

**Symptom:** `processed_tables: 0`, `skipped_tables: 3`

**Causes:**
- Headers in AI tables don't match Excel headers
- Less than 50% header match rate

**Solutions:**
1. Compare AI table headers with Excel headers
2. Use similar or exact column names
3. Check for typos in header names
4. Ensure at least 50% of AI headers exist in Excel

**Example:**

❌ **Bad:**
```markdown
| ID | Product | Model |  ← Different names
```

✓ **Good:**
```markdown
| 序号 | 名称 | 型号 |  ← Matches Excel headers
```

---

### Problem: Low Match Rate

**Symptom:** `matched_rows: 10`, `skipped_rows: 40` (20% match rate)

**Causes:**
- Data in AI table doesn't match Excel data
- Less than 2 columns match per row
- Data format differences

**Solutions:**
1. Ensure AI table includes stable columns (序号, ID, etc.)
2. Check for data format consistency:
   - "0.75KW" vs "O.75KW" (letter O vs zero)
   - "  123  " vs "123" (extra spaces)
   - "ABC" vs "abc" (case differences are handled)
3. Include at least 2-3 columns that rarely change
4. Verify data hasn't been significantly restructured

---

### Problem: File Permission Error

**Error:** "无法访问文件，请检查文件权限或确保文件未被其他程序占用"

**Solutions:**
1. Close the Excel file if it's open
2. Check file permissions
3. Ensure the file isn't locked by another process
4. Try again after a few seconds

---

### Problem: Processing Timeout

**Error:** Request times out after 30 seconds

**Causes:**
- Very large Excel file (>10,000 rows)
- Complex matching requirements

**Solutions:**
1. Process in smaller batches
2. Ensure data is roughly in order
3. Contact support for large file handling

---

## Tips and Best Practices

### 1. Optimize Header Matching

**✓ Do:**
- Use exact or similar column names as Excel
- Include at least 50% of Excel columns in AI table
- Use consistent naming conventions

**✗ Don't:**
- Use completely different header names
- Include only 1-2 columns
- Mix languages unnecessarily

---

### 2. Improve Row Matching

**✓ Do:**
- Include unique identifiers (序号, ID, 编号)
- Include 2-3 stable columns for matching
- Keep data in similar order as Excel file

**✗ Don't:**
- Only include frequently-changing columns
- Rely on a single column for matching
- Completely reorder data

---

### 3. Handle Large Files

**For files with >1000 rows:**
- Ensure data is in similar order
- Use row pointer optimization (automatic)
- Monitor processing time

**For files with >5000 rows:**
- Consider processing in batches
- Test with a subset first
- Allow extra processing time

---

### 4. Validate Results

**Always check:**
```typescript
// 1. Success status
if (!result.success) {
  console.error('Failed:', result.error);
  return;
}

// 2. Match rate
const matchRate = (result.statistics.matched_rows / result.statistics.total_rows) * 100;
if (matchRate < 80) {
  console.warn(`Low match rate: ${matchRate.toFixed(1)}%`);
}

// 3. Warnings
if (result.warnings && result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}

// 4. Download and verify
// Download the file and spot-check a few rows
```

---

### 5. Error Recovery

**Implement retry logic:**
```typescript
async function modifyWithRetry(request, maxRetries = 3) {
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
      }
      
      // Retry on file lock errors
      if (result.error.includes('文件被占用') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      throw new Error(result.error);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

---

## FAQ

### Q1: What happens to columns not in the AI table?

**A:** They are preserved. Only columns that exist in both the AI table and Excel file are updated.

**Example:**
- Excel has: 序号, 名称, 型号, 数量, 备注
- AI table has: 序号, 名称, 型号
- Result: 序号, 名称, 型号 are updated; 数量, 备注 are preserved

---

### Q2: What if multiple rows have the same values?

**A:** The system matches the first row it finds. The row pointer optimization means it will typically match rows in order.

**Recommendation:** Include unique identifiers (序号, ID) to ensure correct matching.

---

### Q3: Can I process multiple Excel files at once?

**A:** No, each API call processes one Excel file. To process multiple files, make multiple API calls.

---

### Q4: What's the maximum file size?

**A:** The system can handle files up to ~10,000 rows efficiently. Larger files may require longer processing time or batch processing.

---

### Q5: Are Excel formulas preserved?

**A:** Yes, by default formulas are preserved. If a cell contains a formula, it will be replaced with the new value (not a formula).

---

### Q6: What if the AI table has more columns than Excel?

**A:** Extra columns in the AI table are ignored. Only columns that exist in Excel are processed.

---

### Q7: Is the original file modified?

**A:** No, the original file is never modified. A new file is created with "(修改后)" appended to the filename.

---

### Q8: Can I customize the matching threshold?

**A:** Yes, but it requires modifying the Python code. The default threshold is 2 matching columns, which works well for most cases.

---

### Q9: What encoding should the AI result use?

**A:** UTF-8 encoding is required for proper handling of Chinese characters and special symbols.

---

### Q10: How long does processing take?

**A:** Typically:
- Small files (<100 rows): 0.5-1 second
- Medium files (100-500 rows): 1-3 seconds
- Large files (500-1000 rows): 3-10 seconds

---

## Summary

The Excel Row-Level Matching system provides:

✓ **Precision:** Updates only the specific rows and columns that need changing  
✓ **Safety:** Preserves all other data in the Excel file  
✓ **Flexibility:** Handles multiple tables and partial matches  
✓ **Performance:** Optimized for large files with row pointer mechanism  
✓ **Transparency:** Detailed statistics show exactly what was changed  

For technical details, see the [API Documentation](./API_DOCUMENTATION.md).

---

**Last Updated:** December 12, 2025  
**Version:** 1.0
