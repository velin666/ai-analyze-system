# Python 环境配置说明

## 问题描述
DOCX 文档拆分功能需要 Python 和相关依赖库支持。

## Windows 环境配置

### 1. 安装 Python
确保已安装 Python 3.8 或更高版本。

### 2. 安装依赖包
```bash
pip install -r requirements.txt
```

### 3. 注册 pywin32（重要）
安装 `pywin32` 后必须运行 post-install 脚本来注册 COM 组件：

```bash
python "%LOCALAPPDATA%\Python\pythoncore-3.14-64\Scripts\pywin32_postinstall.py" -install
```

或者运行：
```bash
python -c "import sys; import os; exec(open(os.path.join(sys.prefix, 'Scripts', 'pywin32_postinstall.py')).read())"
```

### 4. 验证安装
```bash
python -c "import win32com.client; print('win32com 导入成功！')"
```

## Linux/macOS 环境配置

### 1. 安装 LibreOffice
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice python3-uno

# macOS
brew install libreoffice
pip install pyuno
```

### 2. 安装 Python 依赖
```bash
pip install -r requirements.txt
```

## 常见问题

### Q: 提示 "win32com 未安装"
**A:** 运行 pywin32 的 post-install 脚本（见上述步骤 3）

### Q: 拆分文档失败
**A:** 确保：
1. Python 已正确安装
2. pywin32 已注册（Windows）或 LibreOffice 已安装（Linux/macOS）
3. 上传的文件是有效的 .docx 格式

### Q: 权限错误
**A:** 在 Windows 上，可能需要以管理员权限运行 post-install 脚本

## 依赖列表

- **pywin32** (Windows): 用于通过 Microsoft Word COM 接口处理 DOCX
- **python-docx**: DOCX 文件处理库
- **uno** (Linux/macOS): LibreOffice Python 桥接

## 技术说明

系统使用统一接口 `split_docx_pages_unified.py`，自动检测平台并选择合适的实现：
- **Windows**: 优先使用 win32com（需要安装 Microsoft Word）
- **Linux/macOS**: 使用 LibreOffice
- **兼容模式**: 如果主方法不可用，自动回退到备用方案
