import os
import re
import sys
from pathlib import Path

import win32com.client as win32
from win32com.client import gencache


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[\s\u0000-\u001F]+", " ", name)
    name = re.sub(r"[<>:\\/\|?*]", "_", name)
    name = name.strip().rstrip(".")
    if not name:
        name = "未命名"
    if len(name) > 100:
        name = name[:100]
    return name


def get_title_from_doc(doc, fallback: str) -> str:
    title = None
    has_table = doc.Tables.Count > 0
    if has_table:
        table = doc.Tables(1)
        try:
            keywords = [
                "单位工程名称",
                "工程名称",
                "项目名称",
                "单位工程",
            ]
            for r in range(1, table.Rows.Count + 1):
                for c in range(1, table.Columns.Count + 1):
                    txt = (
                        table.Cell(r, c)
                        .Range.Text.replace("\r", "")
                        .replace("\x07", "")
                        .strip()
                    )
                    norm = re.sub(r"[\s：:，,。．·•()（）]+", "", txt)
                    if any(k in norm for k in keywords):
                        for cc in range(c + 1, table.Columns.Count + 1):
                            val = (
                                table.Cell(r, cc)
                                .Range.Text.replace("\r", "")
                                .replace("\x07", "")
                                .strip()
                            )
                            if val:
                                title = val
                                break
                        if title:
                            break
                if title:
                    break
        except Exception:
            pass
        pre = doc.Range(Start=doc.Content.Start, End=table.Range.Start)
        if pre.Paragraphs.Count > 0:
            for idx in range(pre.Paragraphs.Count, 0, -1):
                p = pre.Paragraphs(idx)
                text = p.Range.Text.replace("\r", "").replace("\x07", "").strip()
                if text:
                    try:
                        style_name = p.Range.Style.NameLocal
                    except Exception:
                        style_name = ""
                    if (
                        ("Heading" in style_name)
                        or ("标题" in style_name)
                        or ("Caption" in style_name)
                        or ("题注" in style_name)
                    ):
                        if not title:
                            title = text
                        break
        if not title:
            cell_text = (
                table.Cell(1, 1).Range.Text.replace("\r", "").replace("\x07", "").strip()
            )
            if cell_text:
                title = cell_text
    if not title:
        for idx in range(1, doc.Paragraphs.Count + 1):
            text = (
                doc.Paragraphs(idx).Range.Text.replace("\r", "").replace("\x07", "").strip()
            )
            if text:
                title = text
                break
    if not title:
        title = fallback
    return sanitize_filename(title)


def split_docx_by_page(input_path: str, output_dir: str) -> None:
    """按单页拆分DOCX文档（每页一个文件）"""
    input_path = str(Path(input_path).resolve())
    output_dir = str(Path(output_dir).resolve())
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    word = gencache.EnsureDispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    constants = win32.constants
    doc = None
    try:
        doc = word.Documents.Open(input_path)
        doc.Repaginate()
        total_pages = doc.ComputeStatistics(getattr(win32.constants, "wdStatisticPages", 2))
        used_names = {}
        for i in range(1, total_pages + 1):
            start = doc.GoTo(
                What=getattr(win32.constants, "wdGoToPage", 1),
                Which=getattr(win32.constants, "wdGoToAbsolute", 1),
                Count=i,
            ).Start
            if i < total_pages:
                end = (
                    doc.GoTo(
                        What=getattr(win32.constants, "wdGoToPage", 1),
                        Which=getattr(win32.constants, "wdGoToAbsolute", 1),
                        Count=i + 1,
                    ).Start
                    - 1
                )
            else:
                end = doc.Content.End
            rng = doc.Range(Start=start, End=end)
            newdoc = word.Documents.Add()
            sec = doc.Range(Start=start, End=start).Sections(1)
            dst_sec = newdoc.Sections(1)
            sp = sec.PageSetup
            dsp = dst_sec.PageSetup
            for k in [
                "TopMargin",
                "BottomMargin",
                "LeftMargin",
                "RightMargin",
                "Orientation",
                "PaperSize",
                "HeaderDistance",
                "FooterDistance",
                "PageWidth",
                "PageHeight",
                "MirrorMargins",
            ]:
                setattr(dsp, k, getattr(sp, k))
            rng.Copy()
            try:
                newdoc.Range(0, 0).PasteAndFormat(getattr(win32.constants, "wdFormatOriginalFormatting", 1))
            except Exception:
                newdoc.Range(0, 0).Paste()
            try:
                newdoc.AttachedTemplate = doc.AttachedTemplate
            except Exception:
                pass
            htype = getattr(win32.constants, "wdHeaderFooterPrimary", 1)
            ftype = getattr(win32.constants, "wdHeaderFooterPrimary", 1)
            if getattr(sp, "DifferentFirstPageHeaderFooter", False) and sec.Range.Start == start:
                htype = getattr(win32.constants, "wdHeaderFooterFirstPage", 2)
                ftype = getattr(win32.constants, "wdHeaderFooterFirstPage", 2)
            elif getattr(sp, "OddAndEvenPagesHeaderFooter", False) and (i % 2 == 0):
                htype = getattr(win32.constants, "wdHeaderFooterEvenPage", 3)
                ftype = getattr(win32.constants, "wdHeaderFooterEvenPage", 3)
            sh = sec.Headers(htype).Range
            sf = sec.Footers(ftype).Range
            dh = dst_sec.Headers(htype).Range
            df = dst_sec.Footers(ftype).Range
            if sh.Characters.Count:
                sh.Copy()
                dh.Paste()
            if sf.Characters.Count:
                sf.Copy()
                df.Paste()
            title = get_title_from_doc(newdoc, "未命名")
            base_name = sanitize_filename(f"第{i}页：{title}")
            name = base_name
            if name in used_names:
                used_names[name] += 1
                name = f"{name}_{used_names[name]}"
            else:
                used_names[name] = 0
            out_path = os.path.join(output_dir, f"{name}.docx")
            newdoc.SaveAs2(out_path, FileFormat=constants.wdFormatXMLDocument)
            newdoc.Close(False)
    finally:
        if doc is not None:
            doc.Close(False)
        word.Quit()


def split_docx_by_page_range(input_path: str, output_dir: str, pages_per_file: int = 30) -> None:
    """按指定页数范围拆分DOCX文档"""
    import time
    import subprocess
    
    input_path = str(Path(input_path).resolve())
    output_dir = str(Path(output_dir).resolve())
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    print(f"开始拆分文档: {input_path}")
    print(f"输出目录: {output_dir}")
    print(f"每个文件页数: {pages_per_file}")
    
    # 杀死可能存在的Word进程
    try:
        subprocess.run(['taskkill', '/f', '/im', 'WINWORD.EXE'], 
                      capture_output=True, check=False)
        time.sleep(2)  # 等待进程完全关闭
        print("已清理现有Word进程")
    except Exception:
        pass
    
    word = None
    doc = None
    
    # 重试机制
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            print(f"尝试第 {retry_count + 1} 次...")
            
            # 初始化Word应用程序
            print("正在初始化Word应用程序...")
            word = gencache.EnsureDispatch("Word.Application")
            word.Visible = False
            word.DisplayAlerts = 0
            word.ScreenUpdating = False  # 禁用屏幕更新
            constants = win32.constants
            
            # 等待Word完全启动
            time.sleep(1)
            
            print("正在打开文档...")
            doc = word.Documents.Open(input_path, ReadOnly=True, AddToRecentFiles=False)
            
            # 等待文档完全加载
            time.sleep(2)
            
            # 获取页数 - 使用更安全的方法
            print("正在计算页数...")
            try:
                # 方法1: 直接计算统计信息
                total_pages = doc.ComputeStatistics(2)  # wdStatisticPages = 2
            except Exception as e1:
                print(f"方法1失败: {e1}")
                try:
                    # 方法2: 通过Range获取页数
                    doc.Range().Select()
                    total_pages = word.Selection.Information(3)  # wdActiveEndPageNumber = 3
                except Exception as e2:
                    print(f"方法2失败: {e2}")
                    # 方法3: 简单估算（假设每页500字符）
                    total_chars = len(doc.Range().Text)
                    total_pages = max(1, total_chars // 500)
                    print(f"使用估算方法，估算页数: {total_pages}")
            
            break  # 如果成功，跳出重试循环
            
        except Exception as e:
            print(f"第 {retry_count + 1} 次尝试失败: {e}")
            retry_count += 1
            
            # 清理资源
            try:
                if doc is not None:
                    doc.Close(False)
            except:
                pass
            try:
                if word is not None:
                    word.Quit()
            except:
                pass
            
            if retry_count < max_retries:
                print(f"等待 {3 * retry_count} 秒后重试...")
                time.sleep(3 * retry_count)  # 递增等待时间
                # 再次清理进程
                try:
                    subprocess.run(['taskkill', '/f', '/im', 'WINWORD.EXE'], 
                                  capture_output=True, check=False)
                    time.sleep(2)
                except:
                    pass
            else:
                raise Exception(f"经过 {max_retries} 次重试仍然失败，最后错误: {e}")
    
    if doc is None or word is None:
        raise Exception("无法初始化Word应用程序")
    
    print(f"总页数: {total_pages}")
    print(f"每个文件包含: {pages_per_file} 页")
    
    try:
        file_index = 1
        start_page = 1
        
        while start_page <= total_pages:
            end_page = min(start_page + pages_per_file - 1, total_pages)
            
            print(f"正在处理第 {file_index} 个文件: 第{start_page}-{end_page}页")
            
            newdoc = None
            try:
                # 创建新文档
                print(f"  创建新文档...")
                newdoc = word.Documents.Add()
                
                # 获取起始位置
                print(f"  定位到第{start_page}页...")
                start_pos = doc.GoTo(
                    What=getattr(win32.constants, "wdGoToPage", 1),
                    Which=getattr(win32.constants, "wdGoToAbsolute", 1),
                    Count=start_page,
                ).Start
                
                # 获取结束位置
                if end_page < total_pages:
                    end_pos = doc.GoTo(
                        What=getattr(win32.constants, "wdGoToPage", 1),
                        Which=getattr(win32.constants, "wdGoToAbsolute", 1),
                        Count=end_page + 1,
                    ).Start - 1
                else:
                    end_pos = doc.Content.End
                
                # 创建范围
                rng = doc.Range(Start=start_pos, End=end_pos)
                
                # 复制页面设置
                print(f"  复制页面设置...")
                try:
                    sec = doc.Range(Start=start_pos, End=start_pos).Sections(1)
                    dst_sec = newdoc.Sections(1)
                    sp = sec.PageSetup
                    dsp = dst_sec.PageSetup
                    
                    for k in [
                        "TopMargin", "BottomMargin", "LeftMargin", "RightMargin",
                        "Orientation", "PaperSize", "HeaderDistance", "FooterDistance",
                        "PageWidth", "PageHeight", "MirrorMargins",
                    ]:
                        try:
                            setattr(dsp, k, getattr(sp, k))
                        except Exception:
                            pass
                except Exception as e:
                    print(f"  复制页面设置失败: {e}")
                
                # 复制内容
                print(f"  复制内容...")
                rng.Copy()
                try:
                    newdoc.Range(0, 0).PasteAndFormat(getattr(win32.constants, "wdFormatOriginalFormatting", 1))
                except Exception:
                    try:
                        newdoc.Range(0, 0).Paste()
                    except Exception as e:
                        print(f"  粘贴内容失败: {e}")
                
                # 复制模板
                try:
                    newdoc.AttachedTemplate = doc.AttachedTemplate
                except Exception:
                    pass
                
                # 复制页眉页脚
                try:
                    htype = getattr(win32.constants, "wdHeaderFooterPrimary", 1)
                    ftype = getattr(win32.constants, "wdHeaderFooterPrimary", 1)
                    
                    sh = sec.Headers(htype).Range
                    sf = sec.Footers(ftype).Range
                    dh = dst_sec.Headers(htype).Range
                    df = dst_sec.Footers(ftype).Range
                    
                    if sh.Characters.Count:
                        sh.Copy()
                        dh.Paste()
                    if sf.Characters.Count:
                        sf.Copy()
                        df.Paste()
                except Exception:
                    pass
                
                # 保存文件
                out_filename = f"第{start_page}-{end_page}页.docx"
                out_path = os.path.join(output_dir, out_filename)
                print(f"  保存文件: {out_filename}")
                newdoc.SaveAs2(out_path, FileFormat=constants.wdFormatXMLDocument)
                
                print(f"已保存: {out_filename}")
                
            except Exception as e:
                print(f"  处理第{file_index}个文件时出错: {e}")
                raise
            finally:
                # 安全关闭新文档
                if newdoc is not None:
                    try:
                        newdoc.Close(False)
                    except Exception as e:
                        print(f"  关闭新文档时出错: {e}")
            
            file_index += 1
            start_page = end_page + 1
            
        print(f"拆分完成！共生成 {file_index - 1} 个文件")
            
    except Exception as e:
        print(f"拆分过程中发生错误: {e}")
        raise
    finally:
        # 安全关闭文档和Word应用程序
        try:
            if doc is not None:
                print("正在关闭文档...")
                doc.Close(False)
        except Exception as e:
            print(f"关闭文档时出错: {e}")
        
        try:
            if word is not None:
                print("正在退出Word应用程序...")
                word.Quit()
        except Exception as e:
            print(f"退出Word应用程序时出错: {e}")
        
        print("清理完成")


def main() -> None:
    if len(sys.argv) < 2:
        print("用法: python split_docx_pages.py <输入docx路径> [输出目录] [每个文件页数]")
        print("示例: python split_docx_pages.py document.docx output_dir 30")
        sys.exit(1)
    
    input_path = sys.argv[1]
    base = Path(input_path).with_suffix("")
    output_dir = (
        sys.argv[2]
        if len(sys.argv) >= 3
        else str(base.parent / f"{base.name}_split")
    )
    
    # 如果提供了第三个参数，使用按页数范围拆分
    if len(sys.argv) >= 4:
        pages_per_file = int(sys.argv[3])
        split_docx_by_page_range(input_path, output_dir, pages_per_file)
    else:
        # 默认使用30页一个文件
        split_docx_by_page_range(input_path, output_dir, 30)


if __name__ == "__main__":
    main()

