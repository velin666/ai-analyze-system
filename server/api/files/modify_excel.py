#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel修改脚本
根据AI返回的Markdown表格数据修改Excel文件
"""

import re
import sys
import json
import os
from typing import List, Dict, Tuple, Optional
from openpyxl import load_workbook
from difflib import SequenceMatcher


class TableData:
    """表格数据结构"""
    def __init__(self, headers: List[str], rows: List[List[str]]):
        self.headers = headers
        self.rows = rows


def extract_all_markdown_tables(markdown_text: str) -> List[str]:
    """
    提取AI返回内容中的所有Markdown表格
    
    Args:
        markdown_text: AI返回的Markdown格式文本
        
    Returns:
        表格文本列表，每个元素是一个完整的Markdown表格
    """
    if not markdown_text or not isinstance(markdown_text, str):
        return []
    
    tables = []
    lines = markdown_text.split('\n')
    current_table = []
    in_table = False
    
    for line in lines:
        stripped = line.strip()
        
        # 检查是否是表格行（包含|符号）
        if '|' in stripped:
            if not in_table:
                in_table = True
                current_table = []
            current_table.append(line)
        else:
            # 如果之前在表格中，现在遇到非表格行，表格结束
            if in_table and current_table:
                tables.append('\n'.join(current_table))
                current_table = []
                in_table = False
    
    # 处理最后一个表格
    if in_table and current_table:
        tables.append('\n'.join(current_table))
    
    return tables


def find_target_table(tables: List[str], markdown_text: str) -> Optional[str]:
    """
    从多个表格中找到目标表格（修正后的表格）
    
    策略：
    1. 查找包含"修正后"关键词的表格
    2. 如果没有，使用最后一个表格
    3. 如果只有一个表格，直接使用
    
    Args:
        tables: 表格文本列表
        markdown_text: 原始Markdown文本（用于查找关键词）
        
    Returns:
        目标表格文本，如果没有找到返回None
    """
    if not tables:
        return None
    
    if len(tables) == 1:
        return tables[0]
    
    # 查找包含"修正后"关键词的表格
    keywords = ['修正后', '修正后文档', '修正后的']
    
    # 在原文中查找关键词位置
    for keyword in keywords:
        if keyword in markdown_text:
            # 找到关键词后，查找其后的第一个表格
            keyword_pos = markdown_text.index(keyword)
            
            # 遍历所有表格，找到关键词之后的第一个表格
            for table in tables:
                table_pos = markdown_text.find(table)
                if table_pos > keyword_pos:
                    return table
    
    # 如果没有找到关键词，返回最后一个表格
    return tables[-1]


def parse_markdown_table(table_text: str) -> Optional[TableData]:
    """
    解析单个Markdown表格，提取表头和数据行
    
    Args:
        table_text: Markdown表格文本
        
    Returns:
        TableData对象，如果解析失败返回None
    """
    if not table_text:
        return None
    
    lines = [line.strip() for line in table_text.split('\n') if line.strip()]
    
    if len(lines) < 2:
        return None
    
    # 第一行是表头
    header_line = lines[0]
    # 分割并过滤空字符串（Markdown表格开头和结尾的|会产生空字符串）
    headers = [cell.strip() for cell in header_line.split('|')]
    headers = [h for h in headers if h]  # 移除空字符串
    
    if not headers:
        return None
    
    # 第二行是分隔符（跳过）
    # 从第三行开始是数据行
    rows = []
    for line in lines[2:]:
        # 分割单元格
        cells = [cell.strip() for cell in line.split('|')]
        cells = [c for c in cells if c or c == '']  # 保留空字符串但移除None
        
        # 移除开头和结尾的空字符串（由|产生）
        if cells and cells[0] == '':
            cells = cells[1:]
        if cells and cells[-1] == '':
            cells = cells[:-1]
        
        # 过滤掉完全空的行
        if cells and any(cell for cell in cells):
            # 确保行的列数与表头一致
            while len(cells) < len(headers):
                cells.append('')
            rows.append(cells[:len(headers)])
    
    return TableData(headers, rows)


def find_header_row(worksheet) -> Optional[Tuple[int, Dict[int, str]]]:
    """
    定位Excel表头行，从第1行开始扫描工作表
    
    Args:
        worksheet: openpyxl的worksheet对象
        
    Returns:
        (表头行号, 表头字典)，其中表头字典的key是列索引(1-based)，value是列名
        如果找不到表头返回None
    """
    # 从第1行开始扫描，最多扫描前20行
    max_scan_rows = min(20, worksheet.max_row)
    
    for row_num in range(1, max_scan_rows + 1):
        row = worksheet[row_num]
        
        # 统计非空单元格数量
        non_empty_cells = []
        for col_idx, cell in enumerate(row, start=1):
            if cell.value is not None and str(cell.value).strip():
                non_empty_cells.append((col_idx, str(cell.value).strip()))
        
        # 如果这一行有3个或以上非空单元格，认为是表头
        if len(non_empty_cells) >= 3:
            headers_dict = {col_idx: header for col_idx, header in non_empty_cells}
            return (row_num, headers_dict)
    
    return None


def match_columns(ai_headers: List[str], original_headers: Dict[int, str]) -> Dict[int, int]:
    """
    匹配AI列与原文件列，返回列映射
    
    Args:
        ai_headers: AI返回的表头列表（按顺序）
        original_headers: 原文件的表头字典 {列索引: 列名}
        
    Returns:
        列映射字典 {AI列索引(0-based): 原文件列索引(1-based)}
    """
    column_mapping = {}
    
    # 为了方便查找，创建原文件列名到列索引的反向映射
    original_name_to_idx = {name: idx for idx, name in original_headers.items()}
    
    for ai_idx, ai_header in enumerate(ai_headers):
        ai_header_clean = ai_header.strip()
        
        # 1. 尝试精确匹配
        if ai_header_clean in original_name_to_idx:
            column_mapping[ai_idx] = original_name_to_idx[ai_header_clean]
            continue
        
        # 2. 尝试包含匹配（AI列名是原列名的子串，或反之）
        for orig_name, orig_idx in original_name_to_idx.items():
            if ai_header_clean in orig_name or orig_name in ai_header_clean:
                column_mapping[ai_idx] = orig_idx
                break
        
        if ai_idx in column_mapping:
            continue
        
        # 3. 尝试模糊匹配（相似度>0.8）
        best_match = None
        best_ratio = 0.8  # 最低相似度阈值
        
        for orig_name, orig_idx in original_name_to_idx.items():
            ratio = SequenceMatcher(None, ai_header_clean, orig_name).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = orig_idx
        
        if best_match is not None:
            column_mapping[ai_idx] = best_match
        # 如果没有匹配，跳过该列（不添加到映射中）
    
    return column_mapping


def write_modified_data(worksheet, header_row: int, column_mapping: Dict[int, int], ai_data: TableData):
    """
    将AI数据写入Excel工作表
    
    Args:
        worksheet: openpyxl的worksheet对象
        header_row: 表头行号(1-based)
        column_mapping: 列映射字典 {AI列索引(0-based): 原文件列索引(1-based)}
        ai_data: AI返回的表格数据
    """
    # 从表头行的下一行开始写入数据
    start_row = header_row + 1
    
    # 先删除原有的数据行（保留表头及之前的内容）
    # 获取工作表的最大行数
    max_row = worksheet.max_row
    if max_row > header_row:
        # 删除表头之后的所有行
        worksheet.delete_rows(start_row, max_row - header_row)
    
    # 写入AI返回的数据
    for row_idx, ai_row in enumerate(ai_data.rows):
        excel_row_num = start_row + row_idx
        
        # 遍历AI数据的每一列
        for ai_col_idx, cell_value in enumerate(ai_row):
            # 检查这一列是否有映射
            if ai_col_idx in column_mapping:
                excel_col_idx = column_mapping[ai_col_idx]
                # 写入数据
                worksheet.cell(row=excel_row_num, column=excel_col_idx, value=cell_value)


def generate_output_filename(original_filename: str) -> str:
    """
    生成输出文件名：原文件名(修改后).xlsx
    
    Args:
        original_filename: 原文件名（可能包含路径）
        
    Returns:
        新文件名
    """
    # 获取文件名（不含路径）
    basename = os.path.basename(original_filename)
    
    # 分离文件名和扩展名
    name_without_ext, ext = os.path.splitext(basename)
    
    # 生成新文件名
    new_filename = f"{name_without_ext}(修改后).xlsx"
    
    return new_filename


def save_modified_excel(workbook, original_filepath: str, output_dir: str = 'uploads/modified') -> str:
    """
    保存修改后的Excel文件
    
    Args:
        workbook: openpyxl的workbook对象
        original_filepath: 原文件路径
        output_dir: 输出目录
        
    Returns:
        保存后的文件完整路径
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 生成新文件名
    new_filename = generate_output_filename(original_filepath)
    
    # 构造完整输出路径
    output_path = os.path.join(output_dir, new_filename)
    
    # 处理文件名冲突：如果文件已存在，添加数字后缀
    counter = 1
    base_output_path = output_path
    while os.path.exists(output_path):
        name_without_ext, ext = os.path.splitext(base_output_path)
        output_path = f"{name_without_ext}_{counter}{ext}"
        counter += 1
    
    # 保存文件
    workbook.save(output_path)
    
    return output_path


def modify_excel(original_path: str, ai_result: str, output_dir: str = 'uploads/modified') -> Dict:
    """
    主函数：执行完整的Excel修改流程
    
    Args:
        original_path: 原Excel文件路径
        ai_result: AI返回的Markdown格式结果
        output_dir: 输出目录
        
    Returns:
        结果字典，包含success, output_path, filename或error信息
    """
    try:
        # 1. 解析AI返回的Markdown表格
        tables = extract_all_markdown_tables(ai_result)
        if not tables:
            return {
                'success': False,
                'error': 'AI返回的内容中未找到Markdown表格'
            }
        
        target_table = find_target_table(tables, ai_result)
        if not target_table:
            return {
                'success': False,
                'error': '无法识别目标表格'
            }
        
        ai_data = parse_markdown_table(target_table)
        if not ai_data:
            return {
                'success': False,
                'error': 'Markdown表格解析失败'
            }
        
        # 2. 读取原始Excel文件
        if not os.path.exists(original_path):
            return {
                'success': False,
                'error': f'原始文件不存在: {original_path}'
            }
        
        try:
            workbook = load_workbook(original_path)
            worksheet = workbook.active
        except Exception as e:
            return {
                'success': False,
                'error': f'无法读取Excel文件: {str(e)}'
            }
        
        # 3. 定位表头
        header_result = find_header_row(worksheet)
        if not header_result:
            workbook.close()
            return {
                'success': False,
                'error': '无法在Excel中识别表头行'
            }
        
        header_row, original_headers = header_result
        
        # 4. 匹配列
        column_mapping = match_columns(ai_data.headers, original_headers)
        if not column_mapping:
            workbook.close()
            return {
                'success': False,
                'error': 'AI返回的列与原文件列无法匹配'
            }
        
        # 5. 写入数据
        try:
            write_modified_data(worksheet, header_row, column_mapping, ai_data)
        except Exception as e:
            workbook.close()
            return {
                'success': False,
                'error': f'数据写入失败: {str(e)}'
            }
        
        # 6. 保存文件
        try:
            output_path = save_modified_excel(workbook, original_path, output_dir)
            workbook.close()
        except Exception as e:
            workbook.close()
            return {
                'success': False,
                'error': f'文件保存失败: {str(e)}'
            }
        
        # 7. 返回成功结果
        return {
            'success': True,
            'output_path': output_path,
            'filename': os.path.basename(output_path)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'处理过程中发生错误: {str(e)}'
        }


def main():
    """命令行入口函数"""
    if len(sys.argv) < 4:
        result = {
            'success': False,
            'error': '参数不足。用法: python modify_excel.py <原文件路径> <AI结果> <输出目录>'
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(1)
    
    original_path = sys.argv[1]
    ai_result = sys.argv[2]
    output_dir = sys.argv[3] if len(sys.argv) > 3 else 'uploads/modified'
    
    result = modify_excel(original_path, ai_result, output_dir)
    
    # 输出JSON结果
    print(json.dumps(result, ensure_ascii=False))
    
    # 根据结果设置退出码
    sys.exit(0 if result['success'] else 1)


if __name__ == '__main__':
    # 如果有命令行参数，执行主函数
    if len(sys.argv) > 1 and sys.argv[1] != '--test':
        main()
        sys.exit(0)
    
    # 否则运行测试代码
    # 测试Markdown解析
    test_markdown = """
### 错误清单
| 错误类型 | 具体位置 | 错误描述 |
|----------|----------|----------|
| 错字 | 序号12 | 测试 |

### 修正后文档（表格形式）
| 序号 | 名称 | 品牌 | 型号 |
|------|------|------|------|
| 1 | 触摸屏 | 三菱 | GT2308 |
| 2 | 模块 | 三菱 | FX5-16ET |
"""
    
    print("=== 测试Markdown解析 ===")
    tables = extract_all_markdown_tables(test_markdown)
    print(f"找到 {len(tables)} 个表格")
    
    target = find_target_table(tables, test_markdown)
    if target:
        print("\n目标表格:")
        print(target)
        
        data = parse_markdown_table(target)
        if data:
            print(f"\n表头: {data.headers}")
            print(f"数据行数: {len(data.rows)}")
            for i, row in enumerate(data.rows):
                print(f"行 {i+1}: {row}")
    
    # 测试Excel表头识别
    print("\n\n=== 测试Excel表头识别 ===")
    # 创建一个简单的测试Excel文件
    from openpyxl import Workbook
    wb = Workbook()
    ws = wb.active
    
    # 添加一些空行
    ws['A1'] = ''
    ws['A2'] = ''
    ws['A3'] = ''
    
    # 第4行是表头
    ws['A4'] = '序号'
    ws['B4'] = 'ERP识别码'
    ws['C4'] = '品牌'
    ws['D4'] = '名称'
    ws['E4'] = '型号尺寸'
    ws['F4'] = '数量'
    ws['G4'] = '单位'
    ws['H4'] = '备注'
    
    # 添加一些数据行
    ws['A5'] = '1'
    ws['B5'] = 'WGJ-DQ-CPCZ-0000'
    ws['C5'] = 'SIEMENS'
    ws['D5'] = 'HMI 面板'
    
    # 保存测试文件
    test_file = 'test_excel.xlsx'
    wb.save(test_file)
    print(f"创建测试文件: {test_file}")
    
    # 测试表头识别
    wb_test = load_workbook(test_file)
    ws_test = wb_test.active
    
    result = find_header_row(ws_test)
    if result:
        row_num, headers = result
        print(f"\n找到表头在第 {row_num} 行")
        print(f"表头内容: {headers}")
    else:
        print("\n未找到表头")
    
    wb_test.close()
    
    # 清理测试文件
    import os
    if os.path.exists(test_file):
        os.remove(test_file)
        print(f"\n已删除测试文件: {test_file}")
    
    # 测试列匹配
    print("\n\n=== 测试列匹配 ===")
    ai_headers = ['序号', '名称', '品牌', '型号尺寸', '数量', '单位', '备注']
    original_headers = {
        1: '序号',
        2: 'ERP识别码',
        3: '品牌',
        4: '名称',
        5: '型号尺寸',
        6: '数量',
        7: '单位',
        8: '备注'
    }
    
    mapping = match_columns(ai_headers, original_headers)
    print(f"AI表头: {ai_headers}")
    print(f"原文件表头: {original_headers}")
    print(f"\n列映射结果:")
    for ai_idx, orig_idx in mapping.items():
        print(f"  AI列 {ai_idx} ('{ai_headers[ai_idx]}') -> 原文件列 {orig_idx} ('{original_headers[orig_idx]}')")
    
    # 测试模糊匹配
    print("\n\n=== 测试模糊匹配 ===")
    ai_headers_fuzzy = ['序号', '名称', '品牌', '型号', '数量', '单位']  # '型号'与'型号尺寸'相似
    mapping_fuzzy = match_columns(ai_headers_fuzzy, original_headers)
    print(f"AI表头: {ai_headers_fuzzy}")
    print(f"\n模糊匹配结果:")
    for ai_idx, orig_idx in mapping_fuzzy.items():
        print(f"  AI列 {ai_idx} ('{ai_headers_fuzzy[ai_idx]}') -> 原文件列 {orig_idx} ('{original_headers[orig_idx]}')")
    
    # 测试数据写入
    print("\n\n=== 测试数据写入 ===")
    from openpyxl import Workbook
    wb_write = Workbook()
    ws_write = wb_write.active
    
    # 创建测试Excel（表头在第4行）
    ws_write['A1'] = '标题行'
    ws_write['A2'] = ''
    ws_write['A3'] = '说明：这是测试文件'
    
    # 第4行是表头
    ws_write['A4'] = '序号'
    ws_write['B4'] = 'ERP识别码'
    ws_write['C4'] = '品牌'
    ws_write['D4'] = '名称'
    ws_write['E4'] = '型号尺寸'
    ws_write['F4'] = '数量'
    ws_write['G4'] = '单位'
    ws_write['H4'] = '备注'
    
    # 添加一些原始数据
    ws_write['A5'] = '1'
    ws_write['B5'] = 'OLD-001'
    ws_write['C5'] = '旧品牌'
    ws_write['D5'] = '旧名称'
    ws_write['E5'] = '旧型号'
    ws_write['F5'] = '10'
    ws_write['G5'] = '个'
    ws_write['H5'] = '旧备注'
    
    # 创建AI数据（没有ERP识别码列）
    ai_test_data = TableData(
        headers=['序号', '名称', '品牌', '型号尺寸', '数量', '单位', '备注'],
        rows=[
            ['1', '触摸屏', '三菱', 'GT2308-VNBA', '1', '台', '替换原西门子'],
            ['2', '模块', '三菱', 'FX5-16ET', '3', '个', '替换原西门子']
        ]
    )
    
    # 创建列映射
    test_mapping = match_columns(ai_test_data.headers, {
        1: '序号', 2: 'ERP识别码', 3: '品牌', 4: '名称',
        5: '型号尺寸', 6: '数量', 7: '单位', 8: '备注'
    })
    
    print(f"写入前的数据:")
    print(f"  第1行: {ws_write['A1'].value}")
    print(f"  第3行: {ws_write['A3'].value}")
    print(f"  第4行(表头): {[ws_write.cell(4, i).value for i in range(1, 9)]}")
    print(f"  第5行(数据): {[ws_write.cell(5, i).value for i in range(1, 9)]}")
    
    # 写入数据
    write_modified_data(ws_write, 4, test_mapping, ai_test_data)
    
    print(f"\n写入后的数据:")
    print(f"  第1行: {ws_write['A1'].value}")
    print(f"  第3行: {ws_write['A3'].value}")
    print(f"  第4行(表头): {[ws_write.cell(4, i).value for i in range(1, 9)]}")
    print(f"  第5行(数据): {[ws_write.cell(5, i).value for i in range(1, 9)]}")
    print(f"  第6行(数据): {[ws_write.cell(6, i).value for i in range(1, 9)]}")
    
    # 保存测试文件
    test_write_file = 'test_write.xlsx'
    wb_write.save(test_write_file)
    print(f"\n已保存测试文件: {test_write_file}")
    
    # 清理
    wb_write.close()
    if os.path.exists(test_write_file):
        os.remove(test_write_file)
        print(f"已删除测试文件: {test_write_file}")
    
    # 测试文件命名
    print("\n\n=== 测试文件命名 ===")
    test_filenames = [
        'test.xlsx',
        '/path/to/test.xlsx',
        'C:\\Users\\test\\file.xls',
        '测试文件.xlsx',
        'test(1).xlsx'
    ]
    
    for filename in test_filenames:
        new_name = generate_output_filename(filename)
        print(f"  {filename} -> {new_name}")
    
    # 测试文件保存
    print("\n\n=== 测试文件保存 ===")
    wb_save = Workbook()
    ws_save = wb_save.active
    ws_save['A1'] = '测试数据'
    
    # 保存到临时目录
    test_output_dir = 'test_output'
    saved_path = save_modified_excel(wb_save, 'original_file.xlsx', test_output_dir)
    print(f"文件已保存到: {saved_path}")
    
    # 测试文件名冲突处理
    saved_path2 = save_modified_excel(wb_save, 'original_file.xlsx', test_output_dir)
    print(f"第二次保存到: {saved_path2}")
    
    wb_save.close()
    
    # 清理测试文件
    if os.path.exists(test_output_dir):
        import shutil
        shutil.rmtree(test_output_dir)
        print(f"\n已删除测试目录: {test_output_dir}")
    
    # 测试完整流程
    print("\n\n=== 测试完整流程 ===")
    
    # 创建测试Excel文件
    wb_full = Workbook()
    ws_full = wb_full.active
    
    ws_full['A1'] = '电气元件清单'
    ws_full['A2'] = ''
    ws_full['A3'] = '项目：测试项目'
    
    # 第4行是表头
    ws_full['A4'] = '序号'
    ws_full['B4'] = 'ERP识别码'
    ws_full['C4'] = '品牌'
    ws_full['D4'] = '名称'
    ws_full['E4'] = '型号尺寸'
    ws_full['F4'] = '数量'
    ws_full['G4'] = '单位'
    ws_full['H4'] = '备注'
    
    # 添加原始数据
    ws_full['A5'] = '4'
    ws_full['B5'] = 'OLD-004'
    ws_full['C5'] = '西门子'
    ws_full['D5'] = '触摸屏'
    ws_full['E5'] = 'OLD-MODEL'
    ws_full['F5'] = '1'
    ws_full['G5'] = '台'
    ws_full['H5'] = '旧备注'
    
    ws_full['A6'] = '5'
    ws_full['B6'] = 'OLD-005'
    ws_full['C6'] = '西门子'
    ws_full['D6'] = '模块'
    ws_full['E6'] = 'OLD-MODULE'
    ws_full['F6'] = '1'
    ws_full['G6'] = '个'
    ws_full['H6'] = '旧备注'
    
    test_full_file = 'test_full.xlsx'
    wb_full.save(test_full_file)
    wb_full.close()
    print(f"创建测试文件: {test_full_file}")
    
    # AI返回的Markdown数据
    ai_markdown = """
### 修正后的电气元件清单（关键条目）
| 序号 | 名称 | 品牌 | 型号尺寸 | 数量 | 单位 | 备注 |
|------|------|------|----------|------|------|------|
| 4    | 触摸屏 | 三菱 | GT2308-VNBA（7英寸以太网） | 1 | 台 | 替换原西门子同规格型号 |
| 5    | 数字量输出模块 | 三菱 | FX5-16ET（16点晶体管输出） | 3 | 个 | 替换原西门子同规格型号 |
"""
    
    # 执行完整流程
    result = modify_excel(test_full_file, ai_markdown, 'test_output_full')
    
    if result['success']:
        print(f"\n[SUCCESS] 修改成功!")
        print(f"  输出文件: {result['output_path']}")
        print(f"  文件名: {result['filename']}")
        
        # 验证输出文件
        wb_verify = load_workbook(result['output_path'])
        ws_verify = wb_verify.active
        
        print(f"\n验证输出文件内容:")
        print(f"  第1行: {ws_verify['A1'].value}")
        print(f"  第3行: {ws_verify['A3'].value}")
        print(f"  第4行(表头): {[ws_verify.cell(4, i).value for i in range(1, 9)]}")
        print(f"  第5行(数据): {[ws_verify.cell(5, i).value for i in range(1, 9)]}")
        print(f"  第6行(数据): {[ws_verify.cell(6, i).value for i in range(1, 9)]}")
        
        wb_verify.close()
    else:
        print(f"\n[ERROR] 修改失败: {result['error']}")
    
    # 清理测试文件
    if os.path.exists(test_full_file):
        os.remove(test_full_file)
        print(f"\n已删除测试文件: {test_full_file}")
    
    if os.path.exists('test_output_full'):
        shutil.rmtree('test_output_full')
        print(f"已删除测试目录: test_output_full")
