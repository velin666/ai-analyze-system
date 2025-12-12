#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试ErrorHandler类的功能
"""

import sys
import os

# 添加父目录到路径以便导入modify_excel模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modify_excel import ErrorHandler, ErrorResponse


def test_file_not_found_error():
    """测试文件不存在错误处理"""
    print("测试1: 文件不存在错误")
    error = FileNotFoundError("test.xlsx")
    response = ErrorHandler.handle_error(error, "测试上下文")
    
    assert response.code == "FILE_NOT_FOUND"
    assert "文件不存在" in response.user_message
    print(f"  ✓ 错误代码: {response.code}")
    print(f"  ✓ 用户消息: {response.user_message}")
    print()


def test_permission_error():
    """测试权限错误处理"""
    print("测试2: 权限错误")
    error = PermissionError("无法访问文件")
    response = ErrorHandler.handle_error(error, "测试上下文")
    
    assert response.code == "PERMISSION_DENIED"
    assert "权限" in response.user_message
    print(f"  ✓ 错误代码: {response.code}")
    print(f"  ✓ 用户消息: {response.user_message}")
    print()


def test_value_error():
    """测试值错误处理"""
    print("测试3: 值错误")
    error = ValueError("无效的数据格式")
    response = ErrorHandler.handle_error(error, "测试上下文")
    
    assert response.code == "INVALID_DATA"
    assert "数据格式" in response.user_message
    print(f"  ✓ 错误代码: {response.code}")
    print(f"  ✓ 用户消息: {response.user_message}")
    print()


def test_io_error():
    """测试IO错误处理"""
    print("测试4: IO错误")
    error = IOError("磁盘空间不足")
    response = ErrorHandler.handle_error(error, "测试上下文")
    
    assert response.code == "IO_ERROR"
    assert "文件读写" in response.user_message
    print(f"  ✓ 错误代码: {response.code}")
    print(f"  ✓ 用户消息: {response.user_message}")
    print()


def test_unknown_error():
    """测试未知错误处理"""
    print("测试5: 未知错误")
    error = RuntimeError("未知的运行时错误")
    response = ErrorHandler.handle_error(error, "测试上下文")
    
    assert response.code == "UNKNOWN_ERROR"
    print(f"  ✓ 错误代码: {response.code}")
    print(f"  ✓ 用户消息: {response.user_message}")
    print()


def test_is_recoverable_error():
    """测试错误可恢复性判断"""
    print("测试6: 错误可恢复性判断")
    
    # 可恢复的错误
    assert ErrorHandler.is_recoverable_error(ValueError()) == True
    print("  ✓ ValueError 是可恢复的")
    
    assert ErrorHandler.is_recoverable_error(TypeError()) == True
    print("  ✓ TypeError 是可恢复的")
    
    assert ErrorHandler.is_recoverable_error(KeyError()) == True
    print("  ✓ KeyError 是可恢复的")
    
    # 不可恢复的错误
    assert ErrorHandler.is_recoverable_error(FileNotFoundError()) == False
    print("  ✓ FileNotFoundError 是不可恢复的")
    
    assert ErrorHandler.is_recoverable_error(PermissionError()) == False
    print("  ✓ PermissionError 是不可恢复的")
    
    assert ErrorHandler.is_recoverable_error(MemoryError()) == False
    print("  ✓ MemoryError 是不可恢复的")
    
    # 默认情况（未知错误类型）
    assert ErrorHandler.is_recoverable_error(RuntimeError()) == True
    print("  ✓ RuntimeError (未知类型) 默认是可恢复的")
    print()


def test_specialized_handlers():
    """测试专门的错误处理器"""
    print("测试7: 专门的错误处理器")
    
    error = ValueError("测试错误")
    
    response1 = ErrorHandler.handle_table_extraction_error(error)
    print(f"  ✓ 表格提取错误: {response1.user_message}")
    
    response2 = ErrorHandler.handle_header_matching_error(error)
    print(f"  ✓ 表头匹配错误: {response2.user_message}")
    
    response3 = ErrorHandler.handle_row_matching_error(error)
    print(f"  ✓ 行匹配错误: {response3.user_message}")
    
    response4 = ErrorHandler.handle_data_replacement_error(error)
    print(f"  ✓ 数据替换错误: {response4.user_message}")
    
    response5 = ErrorHandler.handle_file_operation_error(error)
    print(f"  ✓ 文件操作错误: {response5.user_message}")
    print()


def main():
    """运行所有测试"""
    print("=" * 80)
    print("ErrorHandler 类测试")
    print("=" * 80)
    print()
    
    try:
        test_file_not_found_error()
        test_permission_error()
        test_value_error()
        test_io_error()
        test_unknown_error()
        test_is_recoverable_error()
        test_specialized_handlers()
        
        print("=" * 80)
        print("✓ 所有测试通过!")
        print("=" * 80)
        return 0
        
    except AssertionError as e:
        print(f"✗ 测试失败: {e}")
        return 1
    except Exception as e:
        print(f"✗ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
