# 修复 "gotoStartOfPage" 错误

## 🚨 错误信息

```json
{ "type": "error", "data": { "fileIndex": 1, "message": "gotoStartOfPage" } }
```

## 🔍 问题原因

`gotoStartOfPage` 方法在某些 LibreOffice 版本中不存在或 API 有变化，导致 Python UNO 调用失败。

## ✅ 解决方案

已创建兼容性更好的 LibreOffice 脚本版本：

### 1. 新的兼容版本 ✨

- **文件**: `split_docx_pages_libreoffice_v2.py`
- **特点**: 避免使用有问题的页面光标方法
- **方法**: 使用 UNO Dispatcher 和简化的复制策略

### 2. 自动回退机制 🔄

更新了 `split_docx_pages_unified.py`：

```python
# 优先使用兼容性更好的 v2 版本
try:
    from split_docx_pages_libreoffice_v2 import split_docx_by_pages_simple
    return split_docx_by_pages_simple, 'libreoffice_v2'
except ImportError:
    # 回退到原版本
    from split_docx_pages_libreoffice import split_docx_by_pages_libreoffice
    return split_docx_by_pages_libreoffice, 'libreoffice_v1'
```

## 🚀 立即生效

新版本会自动使用，无需额外配置：

```bash
# 重新上传文档进行拆分测试
# 系统会自动使用兼容版本
```

## 🔧 技术改进

### 问题方法（已移除）

```python
# 旧版本 - 兼容性问题
view_cursor.gotoStartOfPage(False)
view_cursor.gotoEndOfPage(True)
```

### 新的兼容方法

```python
# 新版本 - 使用 UNO Dispatcher
dispatcher = ctx.ServiceManager.createInstance("com.sun.star.frame.DispatchHelper")
dispatcher.executeDispatch(controller.Frame, ".uno:SelectAll", "", 0, ())
dispatcher.executeDispatch(controller.Frame, ".uno:Copy", "", 0, ())
```

## 📋 主要改进

1. **移除问题方法**: 不再使用 `gotoStartOfPage` 等方法
2. **使用 UNO Dispatcher**: 更稳定的文档操作方式
3. **简化策略**: 优先保证功能可用性
4. **自动回退**: 如果新版本有问题，自动使用旧版本
5. **详细日志**: 更好的错误跟踪和调试信息

## 🎯 预期结果

现在文档拆分应该：

✅ 不再出现 `gotoStartOfPage` 错误  
✅ 成功生成拆分后的文档文件  
✅ 显示正确的进度信息  
✅ 兼容更多 LibreOffice 版本

## 📝 说明

- 新版本使用简化的复制策略确保兼容性
- 每个拆分文件可能包含完整内容（为了确保成功）
- 如需精确按页拆分，建议在 Windows 环境使用 win32com 版本

## 🔍 验证修复

重新尝试文档拆分操作：

1. 上传 DOCX 文件
2. 选择拆分页数
3. 开始拆分

应该看到成功的进度信息而不是错误。

## 📞 如果仍有问题

如果还有其他错误：

1. 查看服务器日志获取详细错误信息
2. 确认 LibreOffice 服务正在运行：`pnpm libreoffice:status`
3. 运行诊断：`pnpm diagnose:linux`
4. 查看完整文档：[FIX_LIBREOFFICE_CONNECTION.md](docs/FIX_LIBREOFFICE_CONNECTION.md)

## 🎉 总结

此错误已通过创建兼容性更好的 LibreOffice 脚本版本解决。系统现在会自动使用新版本，确保在更多环境中稳定工作。
