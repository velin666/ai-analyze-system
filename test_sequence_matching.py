#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试基于序号的Excel匹配功能
"""

import sys
import os

# 添加server/api/files到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server', 'api', 'files'))

from modify_excel_by_sequence import modify_excel_by_sequence

def test_with_res2():
    """使用res2.md测试"""
    print("=" * 80)
    print("测试：使用res2.md和实际Excel文件")
    print("=" * 80)
    
    # 读取AI结果
    with open('server/api/res2.md', 'r', encoding='utf-8') as f:
        ai_result = f.read()
    
    # Excel文件路径
    excel_path = 'assets/KHG51-SD01 烘烤炉电气件清单.xlsx'
    
    if not os.path.exists(excel_path):
        print(f"✗ Excel文件不存在: {excel_path}")
        return False
    
    # 执行处理
    result = modify_excel_by_sequence(excel_path, ai_result)
    
    # 输出结果
    print("\n" + "=" * 80)
    print("测试结果:")
    print("=" * 80)
    print(f"成功: {result['success']}")
    
    if result['success']:
        stats = result['statistics']
        print(f"总表格数: {stats['total_tables']}")
        print(f"处理表格: {stats['processed_tables']}")
        print(f"跳过表格: {stats['skipped_tables']}")
        print(f"总行数: {stats['total_rows']}")
        print(f"匹配行数: {stats['matched_rows']}")
        print(f"跳过行数: {stats['skipped_rows']}")
        print(f"处理耗时: {stats['processing_time']:.2f}秒")
        print(f"输出文件: {result['output_path']}")
        
        if 'warnings' in result and result['warnings']:
            print(f"\n警告信息:")
            for warning in result['warnings']:
                print(f"  - {warning}")
        
        return True
    else:
        print(f"错误: {result.get('error', '未知错误')}")
        if 'warnings' in result and result['warnings']:
            print(f"\n警告信息:")
            for warning in result['warnings']:
                print(f"  - {warning}")
        return False

if __name__ == '__main__':
    success = test_with_res2()
    sys.exit(0 if success else 1)
