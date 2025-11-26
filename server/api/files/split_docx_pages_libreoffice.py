"""
使用 LibreOffice 拆分 DOCX 文档（跨平台方案）
支持 Linux/macOS/Windows
"""
import os
import re
import sys
import time
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


def connect_to_libreoffice(host='localhost', port=2002, max_retries=3):
    """连接到 LibreOffice 服务"""
    print(f"PROGRESS:FILE_STEP:0:连接LibreOffice:5")
    
    for attempt in range(max_retries):
        try:
            # 获取本地组件上下文
            local_context = uno.getComponentContext()
            resolver = local_context.ServiceManager.createInstanceWithContext(
                "com.sun.star.bridge.UnoUrlResolver", local_context
            )
            
            # 连接到 LibreOffice
            connection_string = f"uno:socket,host={host},port={port};urp;StarOffice.ComponentContext"
            ctx = resolver.resolve(connection_string)
            smgr = ctx.ServiceManager
            desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
            
            print(f"✓ 成功连接到 LibreOffice (尝试 {attempt + 1}/{max_retries})")
            print(f"PROGRESS:FILE_STEP:0:已连接:10")
            return desktop, ctx
            
        except Exception as e:
            print(f"连接失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                print("等待2秒后重试...")
                time.sleep(2)
            else:
                raise Exception(
                    f"无法连接到 LibreOffice。请确保 LibreOffice 服务正在运行:\n"
                    f"libreoffice --headless --accept='socket,host={host},port={port};urp;' --nofirststartwizard"
                )


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
    
    # 确保输出目录存在
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
            
            try:
                # 创建新文档
                print(f"PROGRESS:FILE_STEP:{file_index}:创建新文档:10")
                new_doc = desktop.loadComponentFromURL(
                    "private:factory/swriter", "_blank", 0, ()
                )
                
                # 复制内容 - 使用光标选择页面范围
                print(f"PROGRESS:FILE_STEP:{file_index}:选择页面范围:30")
                
                # 跳到起始页
                view_cursor.jumpToPage(start_page)
                view_cursor.gotoStartOfPage(False)
                
                # 选择到结束页
                view_cursor.jumpToPage(end_page)
                view_cursor.gotoEndOfPage(True)  # True 表示选择
                
                # 复制选中内容
                print(f"PROGRESS:FILE_STEP:{file_index}:复制内容:50")
                dispatcher = ctx.ServiceManager.createInstance("com.sun.star.frame.DispatchHelper")
                dispatcher.executeDispatch(controller.Frame, ".uno:Copy", "", 0, ())
                
                # 粘贴到新文档
                print(f"PROGRESS:FILE_STEP:{file_index}:粘贴到新文档:70")
                new_controller = new_doc.getCurrentController()
                dispatcher.executeDispatch(new_controller.Frame, ".uno:Paste", "", 0, ())
                
                # 保存新文档
                print(f"PROGRESS:FILE_STEP:{file_index}:保存文档:90")
                output_filename = f"split_pages_{start_page}-{end_page}.docx"
                output_path = os.path.join(output_dir, output_filename)
                output_url = uno.systemPathToFileUrl(os.path.abspath(output_path))
                
                save_props = (
                    make_property_value("FilterName", "MS Word 2007 XML"),
                    make_property_value("Overwrite", True),
                )
                
                new_doc.storeToURL(output_url, save_props)
                print(f"✓ 已保存: {output_filename}")
                
                # 关闭新文档
                new_doc.close(True)
                
                print(f"PROGRESS:FILE_COMPLETE:{file_index}:{total_files}")
                
            except Exception as e:
                print(f"处理第 {file_index} 个文件时出错: {e}")
                print(f"PROGRESS:FILE_ERROR:{file_index}:{str(e)}")
                if 'new_doc' in locals():
                    try:
                        new_doc.close(True)
                    except:
                        pass
            
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
