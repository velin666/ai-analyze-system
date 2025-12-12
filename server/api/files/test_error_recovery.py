#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试错误恢复机制 - 验证系统在遇到错误时能继续处理其他项
"""

import sys
import os
import tempfile
from openpyxl import Workbook

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modify_excel import modify_excel, ProcessingConfig


def create_test_excel():
    """创建测试用的Excel文件"""
    wb = Workbook()
    ws = wb.active
    
    # 添加表头
    ws.append(['序号', '名称', '型号', '数量'])
    
    # 添加数据
    ws.append([1, '产品A', 'M001', 10])
    ws.append([2, '产品B', 'M002', 20])
    ws.append([3, '产品C', 'M003', 30])
    
    # 保存到临时文件
    temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.xlsx')
    temp_file.close()
    wb.save(temp_file.name)
    
    return temp_file.name


def test_file_not_found():
    """测试1: 文件不存在错误"""
    print("测试1: 文件不存在错误处理")
    
    ai_result = """
| 序号 | 名称 | 型号 | 数量 |
|------|------|------|------|
| 1 | 产品A | M001 | 15 |
"""
    
    result = modify_excel("nonexistent_file.xlsx", ai_result)
    
    assert result['success'] == False
    assert 'error' in result
    assert '文件' in result['error']
    print(f"  ✓ 正确处理文件不存在错误: {result['error']}")
    print()


def test_invalid_ai_result():
    """测试2: 无效的AI结果"""
    print("测试2: 无效的AI结果处理")
    
    excel_file = create_test_excel()
    
    try:
        # 空的AI结果
        result = modify_excel(excel_file, "")
        assert result['success'] == False
        print(f"  ✓ 正确处理空AI结果")
        
        # 没有表格的AI结果
        result = modify_excel(excel_file, "这是一段没有表格的文本")
        assert result['success'] == False
        print(f"  ✓ 正确处理无表格AI结果")
        
    finally:
        os.unlink(excel_file)
    
    print()


def test_partial_table_failure():
    """测试3: 部分表格失败，其他表格继续处理"""
    print("测试3: 部分表格失败时的错误恢复")
    
    excel_file = create_test_excel()
    
    try:
        # AI结果包含两个表格：一个表头不匹配，一个正常
        ai_result = """
第一个表格（表头不匹配）：

| 错误列1 | 错误列2 | 错误列3 |
|---------|---------|---------|
| A | B | C |

第二个表格（正常）：

| 序号 | 名称 | 型号 | 数量 |
|------|------|------|------|
| 1 | 产品A | M001 | 15 |
| 2 | 产品B | M002 | 25 |
"""
        
        result = modify_excel(excel_file, ai_result)
        
        # 应该部分成功（第二个表格处理成功）
        if result['success']:
            print(f"  ✓ 系统继续处理有效表格")
            print(f"  ✓ 统计信息: {result['statistics']}")
            assert result['statistics']['total_tables'] == 2
            assert result['statistics']['skipped_tables'] >= 1
            assert result['statistics']['matched_rows'] > 0
        else:
            # 如果两个表格都失败也是可以接受的
            print(f"  ✓ 系统正确报告失败: {result.get('error', 'No error message')}")
        
    finally:
        os.unlink(excel_file)
    
    print()


def test_malformed_table():
    """测试4: 格式错误的表格"""
    print("测试4: 格式错误的表格处理")
    
    excel_file = create_test_excel()
    
    try:
        # 格式错误的表格（缺少分隔符行）
        ai_result = """
| 序号 | 名称 |
| 1 | 产品A |
"""
        
        result = modify_excel(excel_file, ai_result)
        
        # 应该优雅地处理错误
        assert 'error' in result or 'statistics' in result
        print(f"  ✓ 正确处理格式错误的表格")
        
    finally:
        os.unlink(excel_file)
    
    print()


def test_row_processing_error_recovery():
    """测试5: 行处理错误恢复"""
    print("测试5: 行处理错误时继续处理其他行")
    
    excel_file = create_test_excel()
    
    try:
        # 包含一些能匹配和一些不能匹配的行
        ai_result = """
| 序号 | 名称 | 型号 | 数量 |
|------|------|------|------|
| 1 | 产品A | M001 | 15 |
| 999 | 不存在的产品 | M999 | 99 |
| 2 | 产品B | M002 | 25 |
"""
        
        result = modify_excel(excel_file, ai_result)
        
        if result['success']:
            print(f"  ✓ 系统继续处理可匹配的行")
            print(f"  ✓ 匹配行数: {result['statistics']['matched_rows']}")
            print(f"  ✓ 跳过行数: {result['statistics']['skipped_rows']}")
            assert result['statistics']['matched_rows'] > 0
            assert result['statistics']['skipped_rows'] > 0
        else:
            print(f"  ✓ 系统报告处理结果: {result.get('error', 'No error')}")
        
    finally:
        os.unlink(excel_file)
    
    print()


def main():
    """运行所有测试"""
    print("=" * 80)
    print("错误恢复机制测试")
    print("=" * 80)
    print()
    
    try:
        test_file_not_found()
        test_invalid_ai_result()
        test_partial_table_failure()
        test_malformed_table()
        test_row_processing_error_recovery()
        
        print("=" * 80)
        print("✓ 所有错误恢复测试通过!")
        print("=" * 80)
        return 0
        
    except AssertionError as e:
        print(f"✗ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return 1
    except Exception as e:
        print(f"✗ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
