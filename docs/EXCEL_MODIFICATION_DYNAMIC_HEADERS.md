# Excel修正功能升级说明

## 更新内容

### 1. 动态表头提取
- **之前**: 使用固定的字段别名映射表
- **现在**: 从AI分析返回的JSON数组中动态提取表头信息
- **实现**: 从修正数据的第一条记录的键（keys）中获取表头字段名

### 2. 表头顺序排序
- AI返回的数据按照表头字段顺序重新排序
- 确保数据处理的一致性和准确性

### 3. 多列匹配策略
- **匹配规则**: 至少2列以上的信息一致才能锚定目标行
- **优势**: 更准确地定位需要修改的行，减少误匹配
- **实现**: `find_by_multi_column_match()` 方法

### 4. 智能更新
- 只更新不一致的列
- 保留其他列的原始数据
- 记录详细的更新日志

## 工作流程

```
1. AI分析Excel → 返回JSON数组（包含修正数据）
   例如:
   [
     {
       "ERP识别码": "WGJ-DQ-CPCZ-0000",
       "单位": "台",
       "名称": "HMI 面板(LINE触摸屏，10.2寸)",
       "品牌": "MITSUBISHI（三菱）",
       ...
     }
   ]

2. 提取表头 → ["ERP识别码", "单位", "名称", "品牌", ...]

3. 按表头顺序排序修正数据

4. 遍历原Excel表格:
   - 对每一行，计算与AI数据的匹配列数
   - 如果匹配列数 ≥ 2，则锚定该行
   - 更新不一致的列

5. 保存修正后的Excel文件供下载
```

## 核心改进

### Python脚本 (modify_excel.py)

**新增方法:**
- `extract_headers_from_ai_data()`: 从AI数据中提取表头
- `sort_modification_data()`: 按表头顺序排序数据
- `find_by_multi_column_match()`: 多列匹配查找目标行
- `count_matched_columns()`: 计算匹配的列数

**修改方法:**
- `detect_header()`: 使用AI提供的表头而非固定映射
- `standardize_field_name()`: 直接使用AI字段名
- `process_single_modification()`: 只更新不一致的列

### 前端展示 (document-analysis.vue)

- 显示Excel修正按钮（当有修正数据时）
- 支持下载修正后的Excel文件
- 显示修正统计信息

## 使用示例

### AI分析返回格式
```json
{
  "content": "[{\"ERP识别码\": \"WGJ-DQ-CPCZ-0000\", \"品牌\": \"MITSUBISHI\", ...}]"
}
```

### 匹配逻辑示例

原Excel表格:
| ERP识别码 | 单位 | 名称 | 品牌 |
|----------|------|------|------|
| WGJ-DQ-CPCZ-0000 | 台 | HMI面板 | 西门子 |

AI修正数据:
```json
{
  "ERP识别码": "WGJ-DQ-CPCZ-0000",
  "单位": "台",
  "品牌": "MITSUBISHI"
}
```

**匹配结果:**
- ERP识别码匹配 ✓
- 单位匹配 ✓
- 匹配列数 = 2 ≥ 2 → 锚定成功
- 更新"品牌"列: 西门子 → MITSUBISHI

## 技术细节

### 1. 表头提取
```python
def extract_headers_from_ai_data(self) -> List[str]:
    first_item = self.modification_data[0]
    headers = list(first_item.keys())
    # 确保包含所有字段
    all_fields = set()
    for item in self.modification_data:
        all_fields.update(item.keys())
    return headers
```

### 2. 多列匹配
```python
def find_by_multi_column_match(self, mod_obj, min_matches=2):
    for row_idx in range(start_row, max_row + 1):
        match_count = self.count_matched_columns(row_idx, mod_obj)
        if match_count >= min_matches:
            return row_idx  # 找到目标行
```

### 3. 只更新不一致的列
```python
if old_value_str != new_value_str:
    self.worksheet.cell(target_row, col_idx, new_value)
    self.updated_cells += 1
```

## 优势

1. **灵活性**: 不依赖固定的表头映射，适应不同的Excel格式
2. **准确性**: 多列匹配降低误匹配风险
3. **安全性**: 只更新需要修改的列，保留其他数据
4. **可追溯**: 完整的更新日志记录

## 注意事项

1. AI返回的JSON数组必须包含至少2个字段才能匹配
2. 表头字段名需要与Excel中的列名相匹配（支持模糊匹配）
3. 如果多行匹配数相同，选择匹配列数最多的行
4. 空值会被跳过，不参与匹配和更新
