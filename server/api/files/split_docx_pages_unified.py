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
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


def get_platform_handler():
    """根据平台获取对应的处理函数（按优先级）"""
    system = platform.system()
    
    # 优先级1: 尝试使用 python-docx（跨平台，最可靠）
    try:
        from split_docx_pages_python_docx import split_docx_by_sections
        return split_docx_by_sections, "python-docx (跨平台)"
    except ImportError:
        print("提示: python-docx 未安装，尝试其他方案...")
        print("  建议安装: pip install python-docx")
    
    # 优先级2: Windows 平台使用 win32com
    if system == "Windows":
        try:
            from split_docx_pages import split_docx_by_page_range
            return split_docx_by_page_range, "Windows (win32com)"
        except ImportError:
            print("警告: pywin32 未安装，尝试使用 LibreOffice")
    
    # 优先级3: Linux/macOS 或 Windows 回退：使用 LibreOffice
    try:
        from split_docx_pages_libreoffice import split_docx_by_pages_libreoffice
        return split_docx_by_pages_libreoffice, "LibreOffice (UNO)"
    except ImportError:
        print(f"错误: 未找到可用的 DOCX 处理库")
        print(f"\n推荐方案:")
        print(f"  pip install python-docx  # 跨平台，最推荐")
        print(f"\n备选方案:")
        print(f"  - Windows: pip install pywin32")
        print(f"  - Linux/macOS: 安装 LibreOffice 和 pyuno")
        print(f"    Ubuntu/Debian: sudo apt-get install libreoffice python3-uno")
        print(f"    macOS: brew install libreoffice && pip install pyuno")
        sys.exit(1)


def main():
    """主函数"""
    if len(sys.argv) not in [4, 5]:
        print("用法: python split_docx_pages_unified.py <输入文件> <输出目录> <每文件页数> [原始文件名]")
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
