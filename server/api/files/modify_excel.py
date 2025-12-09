#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel修正脚本
功能: 根据AI分析结果中的修正数据,智能匹配并更新Excel文件
"""

import sys
import json
import argparse
import traceback
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path

try:
    from openpyxl import load_workbook
    from openpyxl.workbook import Workbook
    from openpyxl.worksheet.worksheet import Worksheet
    from fuzzywuzzy import fuzz
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": "IMPORT_ERROR",
        "message": f"缺少必要的Python库: {str(e)}",
        "traceback": traceback.format_exc()
    }), file=sys.stderr)
    sys.exit(1)


# 配置常量
HEADER_SCAN_LIMIT = 50  # 表头扫描行数上限
MATCH_THRESHOLD = 0.7    # 模糊匹配阈值

# 字段别名映射表（备用）- 实际从AI结果中动态获取表头
FIELD_ALIASES = {}


class ExcelModifier:
    """Excel修正处理器"""

    def __init__(self, input_file: str, output_file: str, modification_data: List[Dict], log_file: Optional[str] = None):
        self.input_file = Path(input_file)
        self.output_file = Path(output_file)
        self.modification_data = modification_data
        self.log_file = Path(log_file) if log_file else None

        self.workbook: Optional[Workbook] = None
        self.worksheet: Optional[Worksheet] = None
        self.header_row: Optional[int] = None
        self.field_mapping: Dict[str, int] = {}  # 字段名 -> 列索引
        self.update_logs: List[Dict] = []

        # 从AI结果中动态提取表头信息
        self.ai_headers: List[str] = self.extract_headers_from_ai_data()

        self.processed_rows = 0
        self.updated_cells = 0
        self.skipped_rows = 0
        self.errors: List[str] = []

    def extract_headers_from_ai_data(self) -> List[str]:
        """从AI返回的修正数据中提取表头字段"""
        if not self.modification_data or len(self.modification_data) == 0:
            return []

        # 获取第一条数据的所有键作为表头
        first_item = self.modification_data[0]
        headers = list(first_item.keys())

        # 统计所有数据中的字段，确保完整性
        all_fields = set()
        for item in self.modification_data:
            all_fields.update(item.keys())

        # 使用第一条数据的顺序，但补充缺失字段
        for field in all_fields:
            if field not in headers:
                headers.append(field)

        return headers

    def run(self) -> Dict[str, Any]:
        """主执行流程"""
        try:
            # 1. 加载Excel文件
            self.load_file()

            # 2. 识别表头
            self.detect_header()

            # 3. 排序修正数据（按表头顺序）
            self.sort_modification_data()

            # 4. 处理修正数据
            self.process_modifications()

            # 5. 保存文件
            self.save_file()

            # 6. 保存日志
            if self.log_file:
                self.save_log()

            return {
                "success": True,
                "processedRows": self.processed_rows,
                "updatedCells": self.updated_cells,
                "skippedRows": self.skipped_rows,
                "errors": self.errors,
                "logFile": str(self.log_file) if self.log_file else None
            }

        except Exception as e:
            return {
                "success": False,
                "error": type(e).__name__,
                "message": str(e),
                "traceback": traceback.format_exc()
            }

    def load_file(self):
        """加载Excel文件"""
        if not self.input_file.exists():
            raise FileNotFoundError(f"输入文件不存在: {self.input_file}")

        try:
            self.workbook = load_workbook(self.input_file)
            self.worksheet = self.workbook.active
        except Exception as e:
            raise Exception(f"无法加载Excel文件: {str(e)}")

    def detect_header(self):
        """智能识别表头行 - 使用AI提供的表头信息"""
        max_score = 0
        best_row = None

        # 使用AI返回的表头字段
        known_fields = self.ai_headers if self.ai_headers else []

        # 扫描前N行
        max_row = min(HEADER_SCAN_LIMIT, self.worksheet.max_row)

        for row_idx in range(1, max_row + 1):
            row = self.worksheet[row_idx]
            score = 0

            for cell in row:
                if cell.value:
                    cell_value = str(cell.value).strip()
                    # 精确匹配
                    if cell_value in known_fields:
                        score += 2
                    # 模糊匹配
                    else:
                        for field in known_fields:
                            if fuzz.ratio(cell_value.lower(), field.lower()) > 80:
                                score += 1
                                break

            if score > max_score:
                max_score = score
                best_row = row_idx

        if best_row is None:
            # 降级策略: 使用第一行
            best_row = 1

        self.header_row = best_row
        self.build_field_mapping()

    def build_field_mapping(self):
        """建立字段名到列索引的映射"""
        if not self.header_row:
            return

        row = self.worksheet[self.header_row]

        for col_idx, cell in enumerate(row, start=1):
            if not cell.value:
                continue

            cell_value = str(cell.value).strip()

            # 尝试标准化字段名
            standardized_name = self.standardize_field_name(cell_value)
            if standardized_name:
                self.field_mapping[standardized_name] = col_idx

            # 同时保存原始字段名
            self.field_mapping[cell_value] = col_idx

    def standardize_field_name(self, field_name: str) -> Optional[str]:
        """标准化字段名 - 直接返回，不使用别名映射"""
        field_name = field_name.strip()

        # 直接使用AI返回的字段名，不再做别名转换
        if field_name in self.ai_headers:
            return field_name

        # 模糊匹配 AI 表头
        for ai_field in self.ai_headers:
            if fuzz.ratio(field_name.lower(), ai_field.lower()) > 85:
                return ai_field

        return None

    def sort_modification_data(self):
        """按照表头顺序排序修正数据的字段"""
        if not self.ai_headers:
            return

        # 为每条数据按表头顺序重新排序
        sorted_data = []
        for item in self.modification_data:
            sorted_item = {}
            # 按表头顺序添加字段
            for header in self.ai_headers:
                if header in item:
                    sorted_item[header] = item[header]
            # 添加任何不在表头中的额外字段
            for key, value in item.items():
                if key not in sorted_item:
                    sorted_item[key] = value
            sorted_data.append(sorted_item)

        self.modification_data = sorted_data

    def process_modifications(self):
        """处理所有修正数据"""
        for mod_obj in self.modification_data:
            try:
                self.process_single_modification(mod_obj)
                self.processed_rows += 1
            except Exception as e:
                self.errors.append(f"处理修正数据失败: {str(e)}")
                self.skipped_rows += 1

    def process_single_modification(self, mod_obj: Dict[str, Any]):
        """处理单条修正数据 - 只更新不一致的列"""
        # 查找目标行
        target_row = self.find_target_row(mod_obj)

        if target_row is None:
            self.errors.append(
                f"未找到匹配行: {json.dumps(mod_obj, ensure_ascii=False)}")
            self.skipped_rows += 1
            return

        # 更新单元格 - 只更新不一致的列
        for field_name, new_value in mod_obj.items():
            # 跳过空值
            if new_value is None or str(new_value).strip() == "":
                continue

            # 获取列索引
            col_idx = self.get_column_index(field_name)
            if col_idx is None:
                continue

            # 获取原值
            old_value = self.worksheet.cell(target_row, col_idx).value
            old_value_str = str(old_value).strip() if old_value else ""
            new_value_str = str(new_value).strip()

            # 只有值不同时才更新
            if old_value_str != new_value_str:
                self.worksheet.cell(target_row, col_idx, new_value)
                self.updated_cells += 1

                # 记录更新日志
                self.update_logs.append({
                    "row": target_row,
                    "field": field_name,
                    "oldValue": old_value_str,
                    "newValue": new_value_str,
                    "timestamp": datetime.now().isoformat()
                })

    def find_target_row(self, mod_obj: Dict[str, Any]) -> Optional[int]:
        """查找目标行 - 使用多列匹配策略（≥2列匹配）"""
        # 新策略：通过多列匹配查找目标行
        # 要求至少有 2 个以上的列信息一致
        return self.find_by_multi_column_match(mod_obj, min_matches=2)

    def find_by_multi_column_match(self, mod_obj: Dict[str, Any], min_matches: int = 2) -> Optional[int]:
        """通过多列匹配查找目标行（至少匹配 min_matches 列）"""
        best_row = None
        best_match_count = 0

        start_row = self.header_row + 1 if self.header_row else 1

        for row_idx in range(start_row, self.worksheet.max_row + 1):
            match_count = self.count_matched_columns(row_idx, mod_obj)

            # 必须至少匹配 min_matches 列
            if match_count >= min_matches and match_count > best_match_count:
                best_match_count = match_count
                best_row = row_idx

        return best_row

    def count_matched_columns(self, row_idx: int, mod_obj: Dict[str, Any]) -> int:
        """计算匹配的列数"""
        matched = 0

        for field_name, value in mod_obj.items():
            # 跳过空值
            if value is None or str(value).strip() == "":
                continue

            col_idx = self.get_column_index(field_name)
            if col_idx is None:
                continue

            cell_value = self.worksheet.cell(row_idx, col_idx).value

            # 精确匹配
            if cell_value and str(cell_value).strip() == str(value).strip():
                matched += 1

        return matched

    def find_by_unique_id(self, field_name: str, value: Any) -> Optional[int]:
        """通过唯一标识查找行"""
        col_idx = self.get_column_index(field_name)
        if col_idx is None:
            return None

        # 从表头下一行开始搜索
        start_row = self.header_row + 1 if self.header_row else 1

        for row_idx in range(start_row, self.worksheet.max_row + 1):
            cell_value = self.worksheet.cell(row_idx, col_idx).value

            # 精确匹配
            if str(cell_value).strip() == str(value).strip():
                return row_idx

        return None

    def find_by_multiple_fields(self, mod_obj: Dict[str, Any]) -> Optional[int]:
        """通过多字段组合匹配行"""
        best_row = None
        best_score = 0

        start_row = self.header_row + 1 if self.header_row else 1

        for row_idx in range(start_row, self.worksheet.max_row + 1):
            score = self.calculate_match_score(row_idx, mod_obj)

            if score > best_score and score >= MATCH_THRESHOLD:
                best_score = score
                best_row = row_idx

        return best_row

    def calculate_match_score(self, row_idx: int, mod_obj: Dict[str, Any]) -> float:
        """计算匹配得分"""
        total_fields = 0
        matched_fields = 0

        for field_name, value in mod_obj.items():
            if value is None or str(value).strip() == "":
                continue

            col_idx = self.get_column_index(field_name)
            if col_idx is None:
                continue

            total_fields += 1
            cell_value = self.worksheet.cell(row_idx, col_idx).value

            # 值匹配
            if cell_value and str(cell_value).strip() == str(value).strip():
                matched_fields += 1
            # 模糊匹配
            elif cell_value and fuzz.ratio(str(cell_value).lower(), str(value).lower()) > 80:
                matched_fields += 0.8

        return matched_fields / total_fields if total_fields > 0 else 0

    def get_column_index(self, field_name: str) -> Optional[int]:
        """获取字段对应的列索引"""
        # 直接匹配
        if field_name in self.field_mapping:
            return self.field_mapping[field_name]

        # 标准化后匹配
        standardized = self.standardize_field_name(field_name)
        if standardized and standardized in self.field_mapping:
            return self.field_mapping[standardized]

        return None

    def save_file(self):
        """保存修正后的文件"""
        try:
            # 确保输出目录存在
            self.output_file.parent.mkdir(parents=True, exist_ok=True)
            self.workbook.save(self.output_file)
        except Exception as e:
            raise Exception(f"保存文件失败: {str(e)}")

    def save_log(self):
        """保存更新日志"""
        try:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(self.update_logs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self.errors.append(f"保存日志失败: {str(e)}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Excel修正脚本')
    parser.add_argument('--input-file', required=True, help='原始Excel文件路径')
    parser.add_argument('--output-file', required=True, help='输出Excel文件路径')
    parser.add_argument('--modification-data',
                        required=True, help='JSON格式的修正数据')
    parser.add_argument('--log-file', help='更新日志输出路径')

    args = parser.parse_args()

    try:
        # 解析修正数据
        modification_data = json.loads(args.modification_data)

        if not isinstance(modification_data, list):
            raise ValueError("修正数据必须是数组格式")

        # 创建处理器并执行
        modifier = ExcelModifier(
            input_file=args.input_file,
            output_file=args.output_file,
            modification_data=modification_data,
            log_file=args.log_file
        )

        result = modifier.run()

        # 输出结果到stdout
        print(json.dumps(result, ensure_ascii=False))

        # 如果失败,设置退出码
        if not result.get("success"):
            sys.exit(1)

    except Exception as e:
        error_result = {
            "success": False,
            "error": type(e).__name__,
            "message": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
