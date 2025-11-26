"""
跨平台 DOCX 拆分统一接口
自动检测平台并选择合适的实现方式
"""
import os
import sys
import platform


def get_platform_handler():
    """根据平台返回对应的处理模块"""
    system = platform.system()
    
    if system == 'Windows':
        try:
            import win32com.client
            print(f"✓ 检测到 Windows 平台，使用 win32com")
            from split_docx_pages import split_docx_by_pages
            return split_docx_by_pages, 'win32com'
        except ImportError:
            print("警告: win32com 未安装，尝试使用 LibreOffice...")
            
    # Linux 或 macOS，或 Windows 但没有 win32com
    try:
        import uno
        print(f"✓ 检测到 {system} 平台，使用 LibreOffice")
        from split_docx_pages_libreoffice import split_docx_by_pages_libreoffice
        return split_docx_by_pages_libreoffice, 'libreoffice'
    except ImportError:
        print(f"错误: 未找到可用的 DOCX 处理库")
        print(f"  - Windows: 请安装 pywin32 (pip install pywin32)")
        print(f"  - Linux/macOS: 请安装 LibreOffice 和 pyuno")
        print(f"    Ubuntu/Debian: sudo apt-get install libreoffice python3-uno")
        print(f"    macOS: brew install libreoffice && pip install pyuno")
        sys.exit(1)


def main():
    """主函数"""
    if len(sys.argv) != 4:
        print("用法: python split_docx_pages_unified.py <输入文件> <输出目录> <每文件页数>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    pages_per_file = int(sys.argv[3])
    
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
        handler(input_path, output_dir, pages_per_file)
        print("\n✓ 拆分成功!")
    except Exception as e:
        print(f"\n✗ 拆分失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
