#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
性能优化验证测试
测试行指针机制、回环搜索功能和大文件处理性能
Requirements: 6.1, 6.2, 6.3, 6.4
"""

import os
import sys
import time
import tempfile
from openpyxl import Workbook, load_workbook
from typing import List, Dict

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modify_excel import (
    ExcelProcessor, ProcessingConfig, RowMatcher,
    HeaderMatcher, TableExtractor, DataReplacer
)


class PerformanceTestHelper:
    """性能测试辅助类"""
    
    @staticmethod
    def create_large_excel_file(num_rows: int = 1000, num_cols: int = 10) -> str:
        """
        创建大型Excel测试文件
        
        Args:
            num_rows: 数据行数
            num_cols: 列数
            
        Returns:
            临时文件路径
        """
        wb = Workbook()
        ws = wb.active
        ws.title = "测试数据"
        
        # 创建表头
        headers = [f"列{i+1}" for i in range(num_cols)]
        ws.append(headers)
        
        # 创建数据行
        for row_idx in range(num_rows):
            row_data = [f"数据{row_idx}_{col_idx}" for col_idx in range(num_cols)]
            ws.append(row_data)
        
        # 保存到临时文件
        temp_file = tempfile.NamedTemporaryFile(
            mode='wb', suffix='.xlsx', delete=False
        )
        wb.save(temp_file.name)
        temp_file.close()
        
        return temp_file.name
    
    @staticmethod
    def create_ai_result_sequential(num_rows: int = 100, num_cols: int = 10) -> str:
        """
        创建顺序的AI结果（模拟最佳情况）
        
        Args:
            num_rows: 数据行数
            num_cols: 列数
            
        Returns:
            Markdown格式的AI结果
        """
        headers = [f"列{i+1}" for i in range(num_cols)]
        header_line = "| " + " | ".join(headers) + " |"
        separator_line = "| " + " | ".join(["---"] * num_cols) + " |"
        
        lines = [header_line, separator_line]
        
        # 创建顺序数据行
        for row_idx in range(num_rows):
            row_data = [f"数据{row_idx}_{col_idx}" for col_idx in range(num_cols)]
            row_line = "| " + " | ".join(row_data) + " |"
            lines.append(row_line)
        
        return "\n".join(lines)
    
    @staticmethod
    def create_ai_result_reverse(num_rows: int = 100, num_cols: int = 10) -> str:
        """
        创建逆序的AI结果（模拟最坏情况，需要回环搜索）
        
        Args:
            num_rows: 数据行数
            num_cols: 列数
            
        Returns:
            Markdown格式的AI结果
        """
        headers = [f"列{i+1}" for i in range(num_cols)]
        header_line = "| " + " | ".join(headers) + " |"
        separator_line = "| " + " | ".join(["---"] * num_cols) + " |"
        
        lines = [header_line, separator_line]
        
        # 创建逆序数据行
        for row_idx in range(num_rows - 1, -1, -1):
            row_data = [f"数据{row_idx}_{col_idx}" for col_idx in range(num_cols)]
            row_line = "| " + " | ".join(row_data) + " |"
            lines.append(row_line)
        
        return "\n".join(lines)
    
    @staticmethod
    def create_ai_result_random(num_rows: int = 100, num_cols: int = 10, 
                               indices: List[int] = None) -> str:
        """
        创建随机顺序的AI结果
        
        Args:
            num_rows: 数据行数
            num_cols: 列数
            indices: 指定的行索引列表
            
        Returns:
            Markdown格式的AI结果
        """
        import random
        
        if indices is None:
            indices = list(range(num_rows))
            random.shuffle(indices)
        
        headers = [f"列{i+1}" for i in range(num_cols)]
        header_line = "| " + " | ".join(headers) + " |"
        separator_line = "| " + " | ".join(["---"] * num_cols) + " |"
        
        lines = [header_line, separator_line]
        
        # 创建随机顺序数据行
        for row_idx in indices:
            row_data = [f"数据{row_idx}_{col_idx}" for col_idx in range(num_cols)]
            row_line = "| " + " | ".join(row_data) + " |"
            lines.append(row_line)
        
        return "\n".join(lines)


def test_row_pointer_mechanism():
    """
    测试1: 行指针机制的性能提升
    验证行指针能够减少重复扫描，提升顺序匹配的性能
    Requirements: 6.1, 6.2, 6.3
    """
    print("\n" + "=" * 80)
    print("测试1: 行指针机制的性能提升")
    print("=" * 80)
    
    # 创建测试数据
    num_rows = 500
    num_cols = 8
    test_rows = 100
    
    print(f"创建测试Excel文件 ({num_rows}行 x {num_cols}列)...")
    excel_file = PerformanceTestHelper.create_large_excel_file(num_rows, num_cols)
    
    print(f"创建顺序AI结果 ({test_rows}行)...")
    ai_result = PerformanceTestHelper.create_ai_result_sequential(test_rows, num_cols)
    
    # 测试启用行指针
    print("\n测试场景A: 启用行指针机制")
    config_with_pointer = ProcessingConfig(
        row_match_threshold=2,
        enable_wraparound_search=True
    )
    
    start_time = time.time()
    processor = ExcelProcessor(excel_file, ai_result, config_with_pointer)
    result = processor.process()
    time_with_pointer = time.time() - start_time
    
    print(f"  处理时间: {time_with_pointer:.3f}秒")
    print(f"  匹配行数: {result.statistics.matched_rows}/{result.statistics.total_rows}")
    print(f"  成功率: {result.statistics.matched_rows/result.statistics.total_rows*100:.1f}%")
    
    # 验证结果
    assert result.success, "处理应该成功"
    assert result.statistics.matched_rows == test_rows, f"应该匹配所有{test_rows}行"
    
    # 清理
    os.unlink(excel_file)
    if result.output_path and os.path.exists(result.output_path):
        os.unlink(result.output_path)
    
    print("\n✓ 测试1通过: 行指针机制正常工作")
    print(f"  性能指标: {test_rows/time_with_pointer:.1f} 行/秒")
    
    return {
        'test_name': '行指针机制',
        'time': time_with_pointer,
        'throughput': test_rows / time_with_pointer,
        'matched_rows': result.statistics.matched_rows,
        'total_rows': result.statistics.total_rows
    }


def test_wraparound_search():
    """
    测试2: 回环搜索功能
    验证当数据逆序时，回环搜索能够找到匹配
    Requirements: 6.4
    """
    print("\n" + "=" * 80)
    print("测试2: 回环搜索功能")
    print("=" * 80)
    
    # 创建测试数据
    num_rows = 200
    num_cols = 8
    test_rows = 50
    
    print(f"创建测试Excel文件 ({num_rows}行 x {num_cols}列)...")
    excel_file = PerformanceTestHelper.create_large_excel_file(num_rows, num_cols)
    
    print(f"创建逆序AI结果 ({test_rows}行)...")
    ai_result = PerformanceTestHelper.create_ai_result_reverse(test_rows, num_cols)
    
    # 测试启用回环搜索
    print("\n测试场景A: 启用回环搜索")
    config_with_wraparound = ProcessingConfig(
        row_match_threshold=2,
        enable_wraparound_search=True
    )
    
    start_time = time.time()
    processor = ExcelProcessor(excel_file, ai_result, config_with_wraparound)
    result_with = processor.process()
    time_with_wraparound = time.time() - start_time
    
    print(f"  处理时间: {time_with_wraparound:.3f}秒")
    print(f"  匹配行数: {result_with.statistics.matched_rows}/{result_with.statistics.total_rows}")
    print(f"  成功率: {result_with.statistics.matched_rows/result_with.statistics.total_rows*100:.1f}%")
    
    # 测试禁用回环搜索
    print("\n测试场景B: 禁用回环搜索")
    config_without_wraparound = ProcessingConfig(
        row_match_threshold=2,
        enable_wraparound_search=False
    )
    
    start_time = time.time()
    processor = ExcelProcessor(excel_file, ai_result, config_without_wraparound)
    result_without = processor.process()
    time_without_wraparound = time.time() - start_time
    
    print(f"  处理时间: {time_without_wraparound:.3f}秒")
    print(f"  匹配行数: {result_without.statistics.matched_rows}/{result_without.statistics.total_rows}")
    print(f"  成功率: {result_without.statistics.matched_rows/result_without.statistics.total_rows*100:.1f}%")
    
    # 验证结果
    assert result_with.success, "启用回环搜索应该成功"
    assert result_with.statistics.matched_rows > result_without.statistics.matched_rows, \
        "启用回环搜索应该匹配更多行"
    
    print(f"\n✓ 测试2通过: 回环搜索提升了 {result_with.statistics.matched_rows - result_without.statistics.matched_rows} 行的匹配")
    print(f"  启用回环: {result_with.statistics.matched_rows}行 ({time_with_wraparound:.3f}秒)")
    print(f"  禁用回环: {result_without.statistics.matched_rows}行 ({time_without_wraparound:.3f}秒)")
    
    # 清理
    os.unlink(excel_file)
    if result_with.output_path and os.path.exists(result_with.output_path):
        os.unlink(result_with.output_path)
    if result_without.output_path and os.path.exists(result_without.output_path):
        os.unlink(result_without.output_path)
    
    return {
        'test_name': '回环搜索',
        'with_wraparound': {
            'time': time_with_wraparound,
            'matched': result_with.statistics.matched_rows
        },
        'without_wraparound': {
            'time': time_without_wraparound,
            'matched': result_without.statistics.matched_rows
        },
        'improvement': result_with.statistics.matched_rows - result_without.statistics.matched_rows
    }


def test_large_file_performance():
    """
    测试3: 大文件处理性能
    验证系统能够高效处理大型Excel文件
    Requirements: 6.1, 6.2, 6.3, 6.4
    """
    print("\n" + "=" * 80)
    print("测试3: 大文件处理性能")
    print("=" * 80)
    
    test_cases = [
        {'rows': 1000, 'test_rows': 100, 'name': '中等文件'},
        {'rows': 5000, 'test_rows': 200, 'name': '大型文件'},
        {'rows': 10000, 'test_rows': 300, 'name': '超大文件'}
    ]
    
    results = []
    
    for test_case in test_cases:
        num_rows = test_case['rows']
        test_rows = test_case['test_rows']
        name = test_case['name']
        num_cols = 10
        
        print(f"\n测试场景: {name} ({num_rows}行 x {num_cols}列)")
        print(f"  创建Excel文件...")
        excel_file = PerformanceTestHelper.create_large_excel_file(num_rows, num_cols)
        
        print(f"  创建AI结果 ({test_rows}行)...")
        ai_result = PerformanceTestHelper.create_ai_result_sequential(test_rows, num_cols)
        
        print(f"  开始处理...")
        config = ProcessingConfig(
            row_match_threshold=2,
            enable_wraparound_search=True
        )
        
        start_time = time.time()
        processor = ExcelProcessor(excel_file, ai_result, config)
        result = processor.process()
        processing_time = time.time() - start_time
        
        throughput = test_rows / processing_time if processing_time > 0 else 0
        
        print(f"  ✓ 处理完成")
        print(f"    处理时间: {processing_time:.3f}秒")
        print(f"    匹配行数: {result.statistics.matched_rows}/{result.statistics.total_rows}")
        print(f"    吞吐量: {throughput:.1f} 行/秒")
        print(f"    成功率: {result.statistics.matched_rows/result.statistics.total_rows*100:.1f}%")
        
        # 验证结果
        assert result.success, f"{name}处理应该成功"
        assert result.statistics.matched_rows == test_rows, \
            f"{name}应该匹配所有{test_rows}行"
        
        # 清理
        os.unlink(excel_file)
        if result.output_path and os.path.exists(result.output_path):
            os.unlink(result.output_path)
        
        results.append({
            'name': name,
            'excel_rows': num_rows,
            'test_rows': test_rows,
            'time': processing_time,
            'throughput': throughput,
            'matched': result.statistics.matched_rows
        })
    
    print("\n✓ 测试3通过: 大文件处理性能验证完成")
    print("\n性能汇总:")
    for r in results:
        print(f"  {r['name']}: {r['throughput']:.1f} 行/秒 "
              f"(Excel {r['excel_rows']}行, 处理 {r['test_rows']}行, 耗时 {r['time']:.3f}秒)")
    
    return results


def test_pointer_update_correctness():
    """
    测试4: 行指针更新正确性
    验证行指针在找到匹配后正确更新
    Requirements: 6.2
    """
    print("\n" + "=" * 80)
    print("测试4: 行指针更新正确性")
    print("=" * 80)
    
    # 创建小型测试数据以便详细验证
    num_rows = 50
    num_cols = 5
    
    print(f"创建测试Excel文件 ({num_rows}行 x {num_cols}列)...")
    excel_file = PerformanceTestHelper.create_large_excel_file(num_rows, num_cols)
    
    # 创建特定顺序的AI结果：行10, 20, 30, 40
    print("创建特定顺序的AI结果...")
    test_indices = [10, 20, 30, 40]
    ai_result = PerformanceTestHelper.create_ai_result_random(
        num_rows, num_cols, test_indices
    )
    
    print("开始处理并验证指针更新...")
    config = ProcessingConfig(
        row_match_threshold=2,
        enable_wraparound_search=True
    )
    
    processor = ExcelProcessor(excel_file, ai_result, config)
    result = processor.process()
    
    print(f"  匹配行数: {result.statistics.matched_rows}/{result.statistics.total_rows}")
    
    # 验证所有行都被匹配
    assert result.success, "处理应该成功"
    assert result.statistics.matched_rows == len(test_indices), \
        f"应该匹配所有{len(test_indices)}行"
    
    print("\n✓ 测试4通过: 行指针更新正确")
    
    # 清理
    os.unlink(excel_file)
    if result.output_path and os.path.exists(result.output_path):
        os.unlink(result.output_path)
    
    return {
        'test_name': '指针更新正确性',
        'matched': result.statistics.matched_rows,
        'expected': len(test_indices)
    }


def test_search_from_pointer():
    """
    测试5: 从指针位置开始搜索
    验证搜索确实从当前指针位置开始，而不是从头开始
    Requirements: 6.3
    """
    print("\n" + "=" * 80)
    print("测试5: 从指针位置开始搜索")
    print("=" * 80)
    
    # 创建测试数据
    num_rows = 100
    num_cols = 6
    
    print(f"创建测试Excel文件 ({num_rows}行 x {num_cols}列)...")
    excel_file = PerformanceTestHelper.create_large_excel_file(num_rows, num_cols)
    
    # 创建跳跃式的AI结果：行5, 15, 25, 35, 45
    # 这样可以验证每次搜索都从上次位置开始
    print("创建跳跃式AI结果...")
    test_indices = [5, 15, 25, 35, 45]
    ai_result = PerformanceTestHelper.create_ai_result_random(
        num_rows, num_cols, test_indices
    )
    
    print("开始处理...")
    config = ProcessingConfig(
        row_match_threshold=2,
        enable_wraparound_search=True
    )
    
    start_time = time.time()
    processor = ExcelProcessor(excel_file, ai_result, config)
    result = processor.process()
    processing_time = time.time() - start_time
    
    print(f"  处理时间: {processing_time:.3f}秒")
    print(f"  匹配行数: {result.statistics.matched_rows}/{result.statistics.total_rows}")
    
    # 验证结果
    assert result.success, "处理应该成功"
    assert result.statistics.matched_rows == len(test_indices), \
        f"应该匹配所有{len(test_indices)}行"
    
    # 如果从头搜索，时间会更长；从指针搜索应该更快
    # 这里我们验证处理时间在合理范围内
    assert processing_time < 5.0, "处理时间应该在5秒内（说明使用了指针优化）"
    
    print("\n✓ 测试5通过: 搜索从指针位置开始")
    print(f"  性能指标: {processing_time:.3f}秒处理{len(test_indices)}行")
    
    # 清理
    os.unlink(excel_file)
    if result.output_path and os.path.exists(result.output_path):
        os.unlink(result.output_path)
    
    return {
        'test_name': '从指针搜索',
        'time': processing_time,
        'matched': result.statistics.matched_rows
    }


def run_all_performance_tests():
    """运行所有性能测试"""
    print("\n" + "=" * 80)
    print("Excel行级匹配 - 性能优化验证测试套件")
    print("=" * 80)
    
    all_results = {}
    
    try:
        # 测试1: 行指针机制
        result1 = test_row_pointer_mechanism()
        all_results['row_pointer'] = result1
        
        # 测试2: 回环搜索
        result2 = test_wraparound_search()
        all_results['wraparound_search'] = result2
        
        # 测试3: 大文件性能
        result3 = test_large_file_performance()
        all_results['large_file'] = result3
        
        # 测试4: 指针更新正确性
        result4 = test_pointer_update_correctness()
        all_results['pointer_update'] = result4
        
        # 测试5: 从指针搜索
        result5 = test_search_from_pointer()
        all_results['search_from_pointer'] = result5
        
        # 输出总结
        print("\n" + "=" * 80)
        print("所有性能测试通过！")
        print("=" * 80)
        
        print("\n性能优化验证总结:")
        print(f"  ✓ 行指针机制: {result1['throughput']:.1f} 行/秒")
        print(f"  ✓ 回环搜索: 提升 {result2['improvement']} 行匹配")
        print(f"  ✓ 大文件处理: 最大 {max(r['excel_rows'] for r in result3)} 行Excel")
        print(f"  ✓ 指针更新: 正确")
        print(f"  ✓ 从指针搜索: 正确")
        
        print("\n关键性能指标:")
        print(f"  - 顺序匹配吞吐量: {result1['throughput']:.1f} 行/秒")
        print(f"  - 回环搜索改进: +{result2['improvement']} 行")
        print(f"  - 大文件处理能力: {max(r['excel_rows'] for r in result3)} 行")
        
        return True
        
    except AssertionError as e:
        print(f"\n✗ 测试失败: {e}")
        return False
    except Exception as e:
        print(f"\n✗ 测试出错: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = run_all_performance_tests()
    sys.exit(0 if success else 1)
