# -*- coding: utf-8 -*-
"""
跨平台 DOCX 拆分统一接口
自动检测平台并选择合适的实现方式
"""
import os
import sys
import platform
import io

# 设置标准输出编码为 UTF-8，避免 Windows 下的编码问题
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(
        sys.stderr.buffer, encoding='utf-8', errors='replace')


def get_platform_handler():
    """根据平台获取对应的处理函数（按优先级）"""
    system = platform.system()

    # 优先级1: Windows 平台使用 win32com（最精确）
    if system == "Windows":
        try:
            from split_docx_pages import split_docx_by_page_range
            return split_docx_by_page_range, "Windows (win32com)"
        except ImportError as e:
            print(f"警告: win32com 不可用 ({e})")
            print("  请确保已安装: pip install pywin32")
            print("  并且系统已安装 Microsoft Word")
            print("  尝试备选方案...")

    # 优先级2: 尝试使用 python-docx（备选方案）
    try:
        from split_docx_pages_python_docx import split_docx_by_sections
        print("提示: 使用 python-docx 作为备选方案")
        return split_docx_by_sections, "python-docx (备选)"
    except ImportError:
        print("提示: python-docx 未安装")
        print("  建议安装: pip install python-docx")

    # 错误：没有可用的处理方案
    print(f"\n错误: 未找到可用的 DOCX 处理库")
    print(f"\n请安装以下依赖之一:")
    print(f"  1. [推荐] pip install pywin32 (需要安装 Microsoft Word)")
    print(f"  2. [备选] pip install python-docx")
    sys.exit(1)


def main():
    """主函数"""
    if len(sys.argv) not in [4, 5]:
        print(
            "用法: python split_docx_pages_unified.py <输入文件> <输出目录> <每文件页数> [原始文件名]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    pages_per_file = int(sys.argv[3])
    original_filename = sys.argv[4] if len(sys.argv) == 5 else None

    # 验证参数
    if not os.path.exists(input_path):
        print(f"错误: 输入文件不存在: {input_path}")
        sys.exit(1)

    if pages_per_file < 1 or pages_per_file > 1000:
        print(f"错误: 每文件页数必须在 1-1000 之间")
        sys.exit(1)

    # 获取平台对应的处理函数
    handler, handler_type = get_platform_handler()

    print(f"\n{'='*60}")
    print(f"平台: {platform.system()} {platform.release()}")
    print(f"处理方式: {handler_type}")
    print(f"输入文件: {input_path}")
    print(f"输出目录: {output_dir}")
    print(f"每文件页数: {pages_per_file}")
    print(f"{'='*60}\n")

    # 执行拆分
    try:
        # 传递原始文件名参数（如果有的话）
        if original_filename:
            handler(input_path, output_dir, pages_per_file, original_filename)
        else:
            handler(input_path, output_dir, pages_per_file)
        print("\n[OK] 拆分成功!")
    except Exception as e:
        print(f"\n[ERROR] 拆分失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
