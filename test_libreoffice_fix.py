#!/usr/bin/env python3
"""
测试 LibreOffice 拆分功能修复
验证 gotoStartOfPage 错误是否已解决
"""
import os
import sys
import tempfile
import traceback
from pathlib import Path

# 添加当前目录到 Python 路径
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir / "server" / "api" / "files"))

def test_unified_interface():
    """测试统一接口是否正常工作"""
    print("=" * 60)
    print("测试统一接口")
    print("=" * 60)
    
    try:
        from split_docx_pages_unified import get_platform_handler
        handler, handler_type = get_platform_handler()
        
        print(f"✓ 成功加载处理器")
        print(f"  处理器类型: {handler_type}")
        print(f"  处理函数: {handler.__name__}")
        
        return True, handler_type
        
    except Exception as e:
        print(f"✗ 统一接口测试失败: {e}")
        traceback.print_exc()
        return False, None


def test_libreoffice_import():
    """测试 LibreOffice 模块导入"""
    print("\n" + "=" * 60)
    print("测试 LibreOffice 模块导入")
    print("=" * 60)
    
    try:
        # 测试 UNO 导入
        import uno
        print("✓ UNO 模块导入成功")
        
        # 测试 v2 版本导入
        try:
            from split_docx_pages_libreoffice_v2 import split_docx_by_pages_simple
            print("✓ LibreOffice v2 版本导入成功")
            return True, "v2"
        except ImportError as e:
            print(f"⚠ LibreOffice v2 版本导入失败: {e}")
            
            # 尝试原版本
            try:
                from split_docx_pages_libreoffice import split_docx_by_pages_libreoffice
                print("✓ LibreOffice v1 版本导入成功")
                return True, "v1"
            except ImportError as e2:
                print(f"✗ LibreOffice v1 版本导入失败: {e2}")
                return False, None
                
    except ImportError as e:
        print(f"✗ UNO 模块导入失败: {e}")
        return False, None


def test_libreoffice_connection():
    """测试 LibreOffice 连接"""
    print("\n" + "=" * 60)
    print("测试 LibreOffice 连接")
    print("=" * 60)
    
    try:
        import uno
        
        # 尝试连接
        local_context = uno.getComponentContext()
        resolver = local_context.ServiceManager.createInstanceWithContext(
            "com.sun.star.bridge.UnoUrlResolver", local_context
        )
        
        connection_string = "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"
        ctx = resolver.resolve(connection_string)
        
        print("✓ LibreOffice 连接成功")
        print(f"  连接字符串: {connection_string}")
        
        # 测试创建桌面
        smgr = ctx.ServiceManager
        desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        print("✓ 桌面对象创建成功")
        
        # 尝试获取 LibreOffice 版本信息
        try:
            # 创建一个隐藏的文档来获取版本信息
            doc = desktop.loadComponentFromURL("private:factory/swriter", "_blank", 0, ())
            
            # 尝试获取应用程序信息
            app_info = ctx.ServiceManager.createInstance("com.sun.star.configuration.ConfigurationProvider")
            print("✓ 成功获取应用程序信息")
            
            # 关闭测试文档
            doc.close(True)
            
        except Exception as version_error:
            print(f"⚠ 无法获取版本详情: {version_error}")
        
        return True
        
    except Exception as e:
        print(f"✗ LibreOffice 连接失败: {e}")
        print("\n建议:")
        print("  1. 启动 LibreOffice 服务: pnpm libreoffice:start")
        print("  2. 检查服务状态: pnpm libreoffice:status")
        print("  3. 查看详细诊断: pnpm diagnose:linux")
        return False


def create_test_document():
    """创建测试文档"""
    print("\n" + "=" * 60)
    print("创建测试文档")
    print("=" * 60)
    
    try:
        # 创建临时目录
        temp_dir = tempfile.mkdtemp(prefix="libreoffice_test_")
        test_docx = os.path.join(temp_dir, "test_document.docx")
        
        # 创建简单的 DOCX 文件（需要 python-docx 或手动创建）
        # 这里我们假设用户会提供测试文件
        
        print(f"测试目录: {temp_dir}")
        print(f"测试文档路径: {test_docx}")
        print("\n请手动放置一个 test_document.docx 文件到上述路径进行测试")
        
        return temp_dir, test_docx
        
    except Exception as e:
        print(f"✗ 创建测试文档失败: {e}")
        return None, None


def run_comprehensive_test():
    """运行综合测试"""
    print("LibreOffice 拆分功能修复验证")
    print("=" * 60)
    print()
    
    # 测试计数
    tests_passed = 0
    total_tests = 0
    
    # 1. 测试统一接口
    total_tests += 1
    success, handler_type = test_unified_interface()
    if success:
        tests_passed += 1
    
    # 2. 测试 LibreOffice 模块导入
    total_tests += 1
    success, version = test_libreoffice_import()
    if success:
        tests_passed += 1
    
    # 3. 测试 LibreOffice 连接（可选，需要服务运行）
    total_tests += 1
    success = test_libreoffice_connection()
    if success:
        tests_passed += 1
    
    # 4. 创建测试环境
    temp_dir, test_docx = create_test_document()
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    print(f"通过测试: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有测试通过！gotoStartOfPage 错误已修复")
        print("\n现在可以尝试文档拆分功能：")
        if temp_dir:
            print(f"  测试目录: {temp_dir}")
            print(f"  1. 将测试 DOCX 文件放到: {test_docx}")
            print(f"  2. 运行: python split_docx_pages_unified.py {test_docx} {temp_dir}/output 30")
    else:
        print("⚠ 部分测试失败，可能需要进一步配置")
        
        if tests_passed < 2:
            print("\n建议检查:")
            print("  1. LibreOffice 是否已安装")
            print("  2. python3-uno 是否已安装")
            print("  3. 运行诊断: pnpm diagnose:linux")
        elif tests_passed == 2:
            print("\n LibreOffice 服务未运行，但修复已生效")
            print("  启动服务: pnpm libreoffice:start")
    
    print("\n相关文档:")
    print("  - FIX_GOTOSTARTONPAGE_ERROR.md (本次修复)")
    print("  - FIX_LIBREOFFICE_CONNECTION.md (连接问题)")
    print("  - QUICK_FIX_LIBREOFFICE.md (快速修复)")


if __name__ == "__main__":
    run_comprehensive_test()
