#!/usr/bin/env python3
"""
诊断 Python 脚本执行超时问题
专门排查 LibreOffice 连接超时
"""
import os
import sys
import time
import signal
import subprocess
from pathlib import Path

def test_libreoffice_connection_quick():
    """快速测试 LibreOffice 连接"""
    print("=" * 60)
    print("快速连接测试")
    print("=" * 60)
    
    try:
        import uno
        print("✅ UNO 模块导入成功")
        
        # 设置超时信号
        def timeout_handler(signum, frame):
            raise TimeoutError("连接超时")
        
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(5)  # 5秒超时
        
        try:
            # 尝试连接
            local_context = uno.getComponentContext()
            resolver = local_context.ServiceManager.createInstanceWithContext(
                "com.sun.star.bridge.UnoUrlResolver", local_context
            )
            
            connection_string = "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"
            print(f"尝试连接: {connection_string}")
            
            ctx = resolver.resolve(connection_string)
            
            signal.alarm(0)  # 取消超时
            print("✅ LibreOffice 连接成功")
            return True
            
        except TimeoutError:
            signal.alarm(0)
            print("❌ 连接超时 (5秒内无响应)")
            return False
        except Exception as e:
            signal.alarm(0)
            print(f"❌ 连接失败: {e}")
            return False
            
    except ImportError:
        print("❌ UNO 模块未安装")
        return False


def check_libreoffice_process():
    """检查 LibreOffice 进程状态"""
    print("\n" + "=" * 60)
    print("检查 LibreOffice 进程")
    print("=" * 60)
    
    try:
        # 查找 LibreOffice 进程
        result = subprocess.run(
            ['pgrep', '-f', 'soffice.*2002'], 
            capture_output=True, text=True, timeout=5
        )
        
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            print(f"✅ 找到 {len(pids)} 个 LibreOffice 进程:")
            for pid in pids:
                if pid:
                    print(f"  - PID: {pid}")
            return True
        else:
            print("❌ 未找到 LibreOffice 进程")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  进程检查超时")
        return False
    except Exception as e:
        print(f"❌ 进程检查失败: {e}")
        return False


def check_port_status():
    """检查端口状态"""
    print("\n" + "=" * 60)
    print("检查端口 2002 状态")
    print("=" * 60)
    
    try:
        # 检查端口是否被监听
        result = subprocess.run(
            ['netstat', '-tuln'], 
            capture_output=True, text=True, timeout=5
        )
        
        if ":2002 " in result.stdout:
            print("✅ 端口 2002 正在被监听")
            return True
        else:
            print("❌ 端口 2002 未被监听")
            
            # 尝试使用 ss 命令
            try:
                result = subprocess.run(
                    ['ss', '-tuln'], 
                    capture_output=True, text=True, timeout=5
                )
                if ":2002 " in result.stdout:
                    print("✅ 端口 2002 正在被监听 (ss 检测)")
                    return True
            except:
                pass
                
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  端口检查超时")
        return False
    except Exception as e:
        print(f"❌ 端口检查失败: {e}")
        return False


def test_script_basic_execution():
    """测试脚本基本执行能力"""
    print("\n" + "=" * 60)
    print("测试脚本基本执行")
    print("=" * 60)
    
    script_path = "/home/ai-analyze-system/server/api/files/split_docx_pages_unified.py"
    
    # 测试脚本是否存在
    if not os.path.exists(script_path):
        print(f"❌ 脚本文件不存在: {script_path}")
        return False
    
    print(f"✅ 脚本文件存在: {script_path}")
    
    # 测试 Python 语法
    try:
        result = subprocess.run(
            ['python3', '-m', 'py_compile', script_path],
            capture_output=True, text=True, timeout=10
        )
        
        if result.returncode == 0:
            print("✅ 脚本语法检查通过")
        else:
            print(f"❌ 脚本语法错误: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  语法检查超时")
        return False
    except Exception as e:
        print(f"❌ 语法检查失败: {e}")
        return False
    
    # 测试导入
    try:
        print("测试模块导入...")
        result = subprocess.run([
            'python3', '-c', 
            f'import sys; sys.path.insert(0, "{os.path.dirname(script_path)}"); '
            'from split_docx_pages_unified import get_platform_handler; '
            'print("导入成功")'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ 模块导入成功")
            return True
        else:
            print(f"❌ 模块导入失败: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  模块导入超时")
        return False
    except Exception as e:
        print(f"❌ 模块导入测试失败: {e}")
        return False


def suggest_solutions(connection_ok, process_ok, port_ok, script_ok):
    """根据测试结果提供解决建议"""
    print("\n" + "=" * 60)
    print("诊断结果和解决建议")
    print("=" * 60)
    
    if all([connection_ok, process_ok, port_ok, script_ok]):
        print("🎉 所有测试通过，但仍然超时可能的原因:")
        print("  1. 应用层超时设置过短")
        print("  2. LibreOffice 服务响应慢")
        print("  3. 文档过大导致处理缓慢")
        print("\n解决方案:")
        print("  pnpm libreoffice:restart")
        print("  # 然后重新尝试拆分")
        
    elif not process_ok or not port_ok:
        print("❌ LibreOffice 服务问题")
        print("\n立即解决:")
        print("  pnpm libreoffice:start")
        print("  pnpm libreoffice:status")
        
    elif not connection_ok:
        print("❌ LibreOffice 连接问题")
        print("\n解决步骤:")
        print("  1. pnpm libreoffice:restart")
        print("  2. sleep 5")
        print("  3. pnpm libreoffice:status")
        
    elif not script_ok:
        print("❌ 脚本问题")
        print("\n检查:")
        print("  1. Python 环境")
        print("  2. 文件权限")
        print("  3. 依赖安装")
    
    print(f"\n🚨 紧急情况处理:")
    print(f"  # 强制重启所有服务")
    print(f"  pnpm pm2:delete")
    print(f"  pnpm pm2:start")


def main():
    """主诊断函数"""
    print("LibreOffice 超时问题诊断")
    print("=" * 60)
    print("分析 Python 脚本执行超时原因")
    print()
    
    # 运行所有诊断测试
    tests = [
        ("LibreOffice 进程", check_libreoffice_process),
        ("端口状态", check_port_status), 
        ("连接测试", test_libreoffice_connection_quick),
        ("脚本执行", test_script_basic_execution),
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n🔍 {test_name} 诊断中...")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"💥 {test_name} 诊断异常: {e}")
            results[test_name] = False
    
    # 提供解决建议
    suggest_solutions(
        results.get("连接测试", False),
        results.get("LibreOffice 进程", False), 
        results.get("端口状态", False),
        results.get("脚本执行", False)
    )
    
    # 总结
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n📊 诊断总结: {passed}/{total} 项通过")
    
    if passed >= 3:
        print("✅ 大部分功能正常，可能是临时性问题")
    elif passed >= 2:
        print("⚠️  部分功能异常，需要重启服务")  
    else:
        print("❌ 多项功能异常，需要完整重新配置")


if __name__ == "__main__":
    main()
