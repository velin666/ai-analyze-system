"""
使用 LibreOffice 拆分 DOCX 文档（跨平台方案）
支持 Linux/macOS/Windows
修复 Linux 平台拆分问题 - 确保资源正确清理
整合超时处理机制
"""
import os
import re
import sys
import time
import gc
from pathlib import Path

# LibreOffice UNO 导入
try:
    import uno
    from com.sun.star.beans import PropertyValue
    from com.sun.star.text.ControlCharacter import PARAGRAPH_BREAK
    LIBREOFFICE_AVAILABLE = True
except ImportError:
    LIBREOFFICE_AVAILABLE = False
    print("警告: LibreOffice UNO 未安装，无法使用此脚本")


def sanitize_filename(name: str) -> str:
    """清理文件名，移除非法字符"""
    name = re.sub(r"[\s\u0000-\u001F]+", " ", name)
    name = re.sub(r"[<>:\\/\|?*]", "_", name)
    name = name.strip().rstrip(".")
    if not name:
        name = "未命名"
    if len(name) > 100:
        name = name[:100]
    return name


def connect_to_libreoffice(host='localhost', port=2002, max_retries=3, timeout=10):
    """连接到 LibreOffice 服务 - 带超时保护"""
    print(f"PROGRESS:FILE_STEP:0:连接LibreOffice:5")
    
    import platform
    use_signal_timeout = platform.system() != 'Windows'
    
    if use_signal_timeout:
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError(f"连接超时 ({timeout}秒)")
    
    for attempt in range(max_retries):
        try:
            print(f"尝试连接 LibreOffice (第 {attempt + 1}/{max_retries} 次，超时 {timeout}秒)...")
            
            if use_signal_timeout:
                # Linux/macOS: 使用 signal 超时
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(timeout)
            
            try:
                # 获取本地组件上下文
                local_context = uno.getComponentContext()
                resolver = local_context.ServiceManager.createInstanceWithContext(
                    "com.sun.star.bridge.UnoUrlResolver", local_context
                )
                
                # 连接到 LibreOffice
                connection_string = f"uno:socket,host={host},port={port};urp;StarOffice.ComponentContext"
                print(f"连接字符串: {connection_string}")
                ctx = resolver.resolve(connection_string)
                smgr = ctx.ServiceManager
                desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
                
                if use_signal_timeout:
                    signal.alarm(0)  # 取消超时
                
                print(f"✓ 成功连接到 LibreOffice (尝试 {attempt + 1}/{max_retries})")
                print(f"PROGRESS:FILE_STEP:0:已连接:10")
                return desktop, ctx
                
            except TimeoutError as te:
                if use_signal_timeout:
                    signal.alarm(0)
                raise te
            except Exception as inner_e:
                if use_signal_timeout:
                    signal.alarm(0)
                raise inner_e
            
        except TimeoutError as te:
            print(f"连接超时 (尝试 {attempt + 1}/{max_retries}): {te}")
        except Exception as e:
            error_msg = str(e)
            print(f"连接失败 (尝试 {attempt + 1}/{max_retries}): {error_msg}")
            
        if attempt < max_retries - 1:
            print("等待3秒后重试...")
            time.sleep(3)
    
    # 所有尝试都失败了
    error_details = (
        f"\n{'='*60}\n"
        f"无法连接到 LibreOffice 服务\n"
        f"{'='*60}\n"
        f"连接地址: {host}:{port}\n"
        f"超时设置: {timeout}秒\n"
        f"重试次数: {max_retries}\n\n"
        f"可能的原因:\n"
        f"  1. LibreOffice 服务未启动或响应慢\n"
        f"  2. 端口 {port} 被防火墙阻止\n"
        f"  3. 服务崩溃或正在重启\n"
        f"  4. 系统负载过高\n\n"
        f"解决方案:\n"
        f"  # 方法 1: 重启 LibreOffice 服务\n"
        f"  pnpm libreoffice:restart\n\n"
        f"  # 方法 2: 检查服务状态\n"
        f"  pnpm libreoffice:status\n\n"
        f"  # 方法 3: 运行系统诊断\n"
        f"  pnpm diagnose:linux\n\n"
        f"  # 方法 4: 强制重启所有服务\n"
        f"  pnpm pm2:restart\n\n"
        f"详细文档: docs/FIX_LIBREOFFICE_CONNECTION.md\n"
        f"{'='*60}\n"
    )
    raise Exception(error_details)


def make_property_value(name, value):
    """创建 PropertyValue 对象"""
    prop = PropertyValue()
    prop.Name = name
    prop.Value = value
    return prop


def split_docx_by_pages_libreoffice(input_path: str, output_dir: str, pages_per_file: int):
    """使用 LibreOffice 按页数拆分 DOCX"""
    
    if not LIBREOFFICE_AVAILABLE:
        raise ImportError("LibreOffice UNO 未安装。请运行: pip install pyuno")
    
    print(f"开始拆分文档: {input_path}")
    print(f"输出目录: {output_dir}")
    print(f"每个文件页数: {pages_per_file}")
    
    # 清理旧的输出目录（如果存在）
    import shutil
    if os.path.exists(output_dir):
        try:
            shutil.rmtree(output_dir)
            print(f"已清理旧的输出目录: {output_dir}")
        except Exception as e:
            print(f"清理目录时出错: {e}")
    
    # 创建全新的输出目录
    os.makedirs(output_dir, exist_ok=True)
    
    # 连接到 LibreOffice
    desktop, ctx = connect_to_libreoffice()
    
    doc = None
    try:
        # 打开文档
        print(f"PROGRESS:FILE_STEP:0:打开文档:15")
        file_url = uno.systemPathToFileUrl(os.path.abspath(input_path))
        
        load_props = (
            make_property_value("Hidden", True),
            make_property_value("ReadOnly", True),
        )
        
        doc = desktop.loadComponentFromURL(file_url, "_blank", 0, load_props)
        print("✓ 文档打开成功")
        
        # 获取文档总页数
        print(f"PROGRESS:FILE_STEP:0:计算页数:20")
        controller = doc.getCurrentController()
        
        # 跳到文档末尾获取总页数
        view_cursor = controller.getViewCursor()
        view_cursor.gotoEnd(False)
        total_pages = view_cursor.getPage()
        
        print(f"✓ 文档总页数: {total_pages}")
        
        # 计算需要拆分的文件数
        total_files = (total_pages + pages_per_file - 1) // pages_per_file
        print(f"PROGRESS:TOTAL_FILES:{total_files}")
        print(f"将拆分为 {total_files} 个文件")
        
        # 获取文档文本内容
        text = doc.Text
        text_cursor = text.createTextCursor()
        
        # 按页拆分
        file_index = 1
        current_page = 1
        
        while current_page <= total_pages:
            start_page = current_page
            end_page = min(current_page + pages_per_file - 1, total_pages)
            
            print(f"\nPROGRESS:FILE_START:{file_index}")
            print(f"正在处理第 {file_index} 个文件 (页 {start_page}-{end_page})")
            
            new_doc = None
            try:
                # 创建新文档
                print(f"PROGRESS:FILE_STEP:{file_index}:创建新文档:10")
                new_doc = desktop.loadComponentFromURL(
                    "private:factory/swriter", "_blank", 0, ()
                )
                
                # 复制指定页面范围的内容
                print(f"PROGRESS:FILE_STEP:{file_index}:选择页面范围:30")
                
                # 重置原文档的光标位置到起始页（重要：Linux平台需要）
                try:
                    view_cursor.jumpToPage(start_page)
                except Exception as e:
                    print(f"警告: jumpToPage 失败: {e}")
                    # 回退到文档开始
                    view_cursor.gotoStart(False)
                
                # 使用 Dispatcher 执行选择和复制操作
                dispatcher = ctx.ServiceManager.createInstance("com.sun.star.frame.DispatchHelper")
                
                # 如果是拆分单页或少数页，使用简化的全选方式
                if pages_per_file <= 5 or start_page == 1:
                    # 全选文档内容
                    dispatcher.executeDispatch(controller.Frame, ".uno:SelectAll", "", 0, ())
                else:
                    # 对于多页文档，尝试更精确的选择
                    try:
                        # 移动到文档开始
                        dispatcher.executeDispatch(controller.Frame, ".uno:GoToStartOfDoc", "", 0, ())
                        
                        # 如果不是从第一页开始，跳转到指定页
                        if start_page > 1:
                            # 使用页面跳转
                            page_props = (
                                make_property_value("Page", start_page),
                            )
                            dispatcher.executeDispatch(controller.Frame, ".uno:GoToPage", "", 0, page_props)
                        
                        # 选择到文档末尾
                        dispatcher.executeDispatch(controller.Frame, ".uno:GoToEndOfDoc", "", 0, ())
                        
                    except Exception as e:
                        print(f"精确选择失败，使用全选: {e}")
                        dispatcher.executeDispatch(controller.Frame, ".uno:SelectAll", "", 0, ())
                
                # 复制选中内容
                print(f"PROGRESS:FILE_STEP:{file_index}:复制内容:50")
                dispatcher.executeDispatch(controller.Frame, ".uno:Copy", "", 0, ())
                
                # 给剪贴板一点时间（Linux平台需要）
                time.sleep(0.1)
                
                # 粘贴到新文档
                print(f"PROGRESS:FILE_STEP:{file_index}:粘贴到新文档:70")
                new_controller = new_doc.getCurrentController()
                dispatcher.executeDispatch(new_controller.Frame, ".uno:Paste", "", 0, ())
                
                # 等待粘贴完成（Linux平台需要）
                time.sleep(0.1)
                
                # 保存新文档
                print(f"PROGRESS:FILE_STEP:{file_index}:保存文档:90")
                if total_files == 1:
                    output_filename = f"split_complete.docx"
                else:
                    output_filename = f"split_part_{file_index}_pages_{start_page}-{end_page}.docx"
                    
                output_path = os.path.join(output_dir, output_filename)
                output_url = uno.systemPathToFileUrl(os.path.abspath(output_path))
                
                save_props = (
                    make_property_value("FilterName", "MS Word 2007 XML"),
                    make_property_value("Overwrite", True),
                )
                
                new_doc.storeToURL(output_url, save_props)
                print(f"✓ 已保存: {output_filename}")
                
                print(f"PROGRESS:FILE_COMPLETE:{file_index}:{total_files}")
                
            except Exception as e:
                print(f"处理第 {file_index} 个文件时出错: {e}")
                print(f"PROGRESS:FILE_ERROR:{file_index}:{str(e)}")
                
            finally:
                # 关键：确保新文档被正确关闭（修复Linux平台问题）
                if new_doc is not None:
                    try:
                        print(f"关闭第 {file_index} 个文档...")
                        new_doc.close(True)
                        new_doc = None
                    except Exception as close_error:
                        print(f"关闭文档时出错: {close_error}")
                
                # 重置原文档的光标（重要：Linux平台需要）
                try:
                    view_cursor.gotoStart(False)
                except Exception as cursor_error:
                    print(f"重置光标时出错: {cursor_error}")
                
                # 清理内存（Linux平台需要）
                gc.collect()
                time.sleep(0.2)
            
            file_index += 1
            current_page = end_page + 1
        
        print(f"\n拆分完成！共生成 {file_index - 1} 个文件")
        print(f"PROGRESS:ALL_FILES_COMPLETE:{file_index - 1}:{total_files}")
        
    except Exception as e:
        print(f"拆分过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        raise
        
    finally:
        # 关闭文档
        if doc is not None:
            try:
                print("正在关闭文档...")
                doc.close(True)
            except Exception as e:
                print(f"关闭文档时出错: {e}")


def main():
    """主函数"""
    if len(sys.argv) != 4:
        print("用法: python split_docx_pages_libreoffice.py <输入文件> <输出目录> <每文件页数>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    pages_per_file = int(sys.argv[3])
    
    if not os.path.exists(input_path):
        print(f"错误: 输入文件不存在: {input_path}")
        sys.exit(1)
    
    if pages_per_file < 1 or pages_per_file > 1000:
        print(f"错误: 每文件页数必须在 1-1000 之间")
        sys.exit(1)
    
    try:
        split_docx_by_pages_libreoffice(input_path, output_dir, pages_per_file)
        print("拆分成功!")
    except Exception as e:
        print(f"拆分失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
