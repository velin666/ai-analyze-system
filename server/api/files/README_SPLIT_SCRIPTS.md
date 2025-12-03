# DOCX 文档拆分脚本架构说明

## 脚本文件列表

### 1. `split_docx_pages_unified.py` ⭐ **推荐使用**
**统一入口脚本**，自动检测平台并选择合适的实现方式。

**功能：**
- 自动检测操作系统（Windows/Linux/macOS）
- Windows 优先使用 `win32com`，失败则回退到 LibreOffice
- Linux/macOS 使用 LibreOffice
- 统一的命令行接口

**使用方法：**
```bash
python split_docx_pages_unified.py <输入文件> <输出目录> <每文件页数>
```

**示例：**
```bash
python split_docx_pages_unified.py input.docx output_dir 30
```

---

### 2. `split_docx_pages_libreoffice.py`
**LibreOffice 实现**（Linux/macOS/Windows）

**特点：**
- ✅ 跨平台支持（Linux/macOS/Windows）
- ✅ 包含超时处理机制（v2合并）
- ✅ 修复了 Linux 平台的拆分问题
- ✅ 确保文档正确关闭和资源清理
- ✅ 每次拆分后重置光标状态

**关键修复：**
- 在 `finally` 块中确保新文档被正确关闭
- 每次拆分后重置原文档光标位置
- 添加内存垃圾回收和适当延迟
- 给剪贴板操作添加延迟确保完成

**使用方法：**
```bash
python split_docx_pages_libreoffice.py <输入文件> <输出目录> <每文件页数>
```

---

### 3. `split_docx_pages.py`
**Windows win32com 实现**（仅限 Windows）

**特点：**
- ✅ Windows 平台最佳性能
- ✅ 直接使用 Microsoft Word COM 接口
- ⚠️ 仅限 Windows 平台
- ⚠️ 需要安装 Microsoft Word

**使用方法：**
```bash
python split_docx_pages.py <输入文件> <输出目录> <每文件页数>
```

---

## API 使用

后端 TypeScript API 自动调用 `split_docx_pages_unified.py`：

**文件位置：**
- `server/api/files/split-docx-stream.get.ts` - 实时进度流式返回
- `server/api/files/split-docx.post.ts` - 简单POST请求

**返回数据结构：**
```typescript
{
  success: boolean,
  totalFiles: number,
  pagesPerFile: number,
  files: Array<{
    name: string,    // 文件名
    size: number     // 文件大小（字节）
  }>,
  downloadUrl: string
}
```

---

## 版本历史

### v3 (当前版本 - 2024-12-03)
- ✅ 合并 `split_docx_pages_libreoffice_v2.py` 到主版本
- ✅ 修复 Linux 平台拆分问题
- ✅ 添加文件大小返回
- ✅ 删除冗余的 v2 脚本
- ✅ 简化统一入口脚本

### v2 (已合并)
- 添加超时处理机制
- 优化兼容性

### v1 (初始版本)
- 基础拆分功能
- 跨平台支持

---

## 依赖要求

### Windows
```bash
pip install pywin32
# 或者
pip install pyuno libreoffice
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install libreoffice python3-uno
```

### macOS
```bash
brew install libreoffice
pip install pyuno
```

---

## 故障排查

### Linux 平台拆分失败
- ✅ 已修复：确保 LibreOffice 服务运行
- ✅ 已修复：文档资源正确清理
- ✅ 已修复：光标状态重置

### LibreOffice 连接超时
```bash
# 重启 LibreOffice 服务
pnpm libreoffice:restart

# 检查服务状态
pnpm libreoffice:status

# 运行诊断
pnpm diagnose:linux
```

---

## 技术细节

### Linux 平台修复的核心逻辑
```python
finally:
    # 确保新文档被正确关闭
    if new_doc is not None:
        new_doc.close(True)
        new_doc = None
    
    # 重置原文档的光标（Linux平台需要）
    view_cursor.gotoStart(False)
    
    # 清理内存
    gc.collect()
    time.sleep(0.2)
```

这确保了每次拆分后 LibreOffice 的状态被正确重置，避免状态累积导致后续拆分失败。
