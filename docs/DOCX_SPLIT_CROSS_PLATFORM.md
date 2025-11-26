# DOCX 拆分功能 - 跨平台使用指南

## 🎯 快速开始

### Windows 用户（推荐 win32com）

```bash
# 1. 安装依赖
pip install pywin32

# 2. 确保已安装 Microsoft Word

# 3. 测试功能
python test_cross_platform.py
```

**自动使用 win32com**，无需额外配置！

### Linux 用户（使用 LibreOffice）

```bash
# 1. 安装 LibreOffice 和 UNO 桥接
sudo apt-get update
sudo apt-get install -y libreoffice python3-uno

# 2. 启动 LibreOffice 服务
chmod +x start_libreoffice_service.sh
./start_libreoffice_service.sh

# 3. 测试功能
python test_cross_platform.py
```

### macOS 用户（使用 LibreOffice）

```bash
# 1. 安装 LibreOffice
brew install libreoffice

# 2. 启动服务
chmod +x start_libreoffice_service.sh
./start_libreoffice_service.sh

# 3. 测试功能
python test_cross_platform.py
```

## 📋 功能说明

系统会**自动检测平台**并选择最佳实现方式：

| 平台    | 优先使用             | 备选方案    |
| ------- | -------------------- | ----------- |
| Windows | win32com (需要 Word) | LibreOffice |
| Linux   | LibreOffice          | -           |
| macOS   | LibreOffice          | -           |

## 🔧 Web 界面使用

1. **启动开发服务器**

   ```bash
   pnpm dev
   ```

2. **访问文档分析页面**

   ```
   http://localhost:3000/main/document-analysis
   ```

3. **上传并拆分文档**
   - 选择 DOCX 文件
   - 设置每个文件的页数
   - 点击"拆分文档"
   - 查看实时进度
   - 下载拆分结果

## 📊 实时进度功能

系统支持完整的实时进度显示：

### 进度层级

1. **总体进度** - 显示总文件数和完成进度
2. **当前任务进度** - 显示正在处理的文件
3. **详细日志** - 实时显示操作步骤

### 阶段说明

- **准备中** - 初始化处理器
- **拆分中** - 正在拆分文档
- **打包中** - 创建 ZIP 压缩包
- **已完成** - 全部完成

### 进度信息

- ✅ 总文件数
- ✅ 已完成数量
- ✅ 当前处理的文件
- ✅ 具体处理步骤
- ✅ 完成百分比
- ✅ ZIP 打包进度

## 🐛 故障排查

### Windows 平台

**问题**: `pywintypes.com_error: (-2147418111)`

**解决方案**:

```bash
# 1. 关闭所有 Word 实例
taskkill /F /IM WINWORD.EXE

# 2. 以管理员身份运行
# 右键 PowerShell -> 以管理员身份运行

# 3. 重新测试
python test_cross_platform.py
```

### Linux 平台

**问题**: `ImportError: No module named 'uno'`

**解决方案**:

```bash
# 安装 python3-uno
sudo apt-get install python3-uno

# 验证安装
python3 -c "import uno; print('UNO 已安装')"
```

**问题**: `无法连接到 LibreOffice`

**解决方案**:

```bash
# 检查服务状态
ps aux | grep soffice

# 检查端口
netstat -tuln | grep 2002

# 重启服务
pkill -f soffice
./start_libreoffice_service.sh
```

### macOS 平台

**问题**: LibreOffice 无法启动

**解决方案**:

```bash
# 使用完整路径启动
/Applications/LibreOffice.app/Contents/MacOS/soffice \
  --headless \
  --accept="socket,host=127.0.0.1,port=2002;urp;" \
  --nofirststartwizard &
```

## 🧪 测试脚本

运行完整测试：

```bash
python test_cross_platform.py
```

测试内容：

- ✅ 检查系统依赖
- ✅ 创建测试文档（10 页）
- ✅ 执行拆分操作（每 3 页一个文件）
- ✅ 验证输出结果
- ✅ 显示详细报告

## 📁 文件说明

```
server/api/files/
├── split_docx_pages.py              # Windows win32com 版本
├── split_docx_pages_libreoffice.py  # LibreOffice 版本
├── split_docx_pages_unified.py      # 跨平台统一接口 ⭐
├── split-docx.post.ts               # 简单 API
└── split-docx-stream.get.ts         # 实时进度 API

scripts/
├── start_libreoffice_service.sh     # Linux/macOS 启动脚本
├── start_libreoffice_service.bat    # Windows 启动脚本（可选）
└── test_cross_platform.py           # 测试脚本

docs/
├── CROSS_PLATFORM_DEPLOYMENT.md     # 详细部署文档
└── DOCX_SPLIT_CROSS_PLATFORM.md     # 本文档
```

## 🚀 生产环境部署

### Docker 部署（推荐）

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    libreoffice \
    python3-uno \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
WORKDIR /app

CMD ["./deploy.sh"]
```

### systemd 服务

```bash
# 创建服务文件
sudo nano /etc/systemd/system/libreoffice-headless.service

# 启用并启动
sudo systemctl enable libreoffice-headless
sudo systemctl start libreoffice-headless
```

详见: [CROSS_PLATFORM_DEPLOYMENT.md](./CROSS_PLATFORM_DEPLOYMENT.md)

## 💡 最佳实践

1. **开发环境**:

   - Windows: 使用 win32com（性能更好）
   - Linux/macOS: 使用 LibreOffice

2. **生产环境**:

   - 容器化部署（Docker）
   - 使用 systemd 管理 LibreOffice 服务
   - 配置健康检查和自动重启

3. **性能优化**:

   - 启动多个 LibreOffice 实例（不同端口）
   - 使用连接池管理
   - 限制并发处理数量

4. **错误处理**:
   - 记录详细日志
   - 设置合理的超时时间
   - 实现重试机制

## 📞 获取帮助

- 📖 [详细部署文档](./CROSS_PLATFORM_DEPLOYMENT.md)
- 🔧 [LibreOffice UNO API](https://api.libreoffice.org/)
- 🐍 [Python-UNO 文档](https://wiki.documentfoundation.org/Development/Python)
- 💬 提交 Issue 获取支持

## 🎉 现在开始使用

```bash
# 1. 测试系统
python test_cross_platform.py

# 2. 启动应用
pnpm dev

# 3. 访问页面
# http://localhost:3000/main/document-analysis

# 4. 上传文档并享受实时进度！
```
