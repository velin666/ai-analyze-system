# 跨平台 DOCX 拆分部署指南

本文档说明如何在不同平台上部署和使用 DOCX 拆分功能。

## 🎯 支持的平台

- ✅ **Windows** - 使用 win32com (Microsoft Word COM)
- ✅ **Linux** - 使用 LibreOffice + pyuno
- ✅ **macOS** - 使用 LibreOffice + pyuno

## 📦 安装依赖

### Windows 平台

```bash
# 安装 pywin32
pip install pywin32

# 确保已安装 Microsoft Word
# 脚本会自动使用 win32com
```

### Ubuntu/Debian Linux

```bash
# 1. 安装 LibreOffice
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer

# 2. 安装 Python UNO 桥接
sudo apt-get install -y python3-uno

# 3. 启动 LibreOffice 服务（后台运行）
libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard &

# 4. 设置开机自启动（可选）
cat > /etc/systemd/system/libreoffice-headless.service << 'EOF'
[Unit]
Description=LibreOffice Headless Service
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/usr/bin/libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable libreoffice-headless
sudo systemctl start libreoffice-headless
```

### CentOS/RHEL Linux

```bash
# 1. 安装 LibreOffice
sudo yum install -y libreoffice libreoffice-writer libreoffice-pyuno

# 2. 启动服务（同 Ubuntu）
libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard &
```

### macOS

```bash
# 1. 使用 Homebrew 安装 LibreOffice
brew install libreoffice

# 2. 安装 pyuno（可能需要从源码编译）
# 方法1: 使用 LibreOffice 自带的 Python
/Applications/LibreOffice.app/Contents/Resources/python

# 方法2: 安装独立的 pyuno
pip install pyuno

# 3. 启动服务
/Applications/LibreOffice.app/Contents/MacOS/soffice --headless \
  --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard &
```

## 🚀 使用方式

### 自动平台检测（推荐）

系统会自动检测平台并选择合适的实现：

```bash
# 所有平台通用命令
python server/api/files/split_docx_pages_unified.py input.docx output_dir 30
```

### 手动指定实现

```bash
# Windows - 使用 win32com
python server/api/files/split_docx_pages.py input.docx output_dir 30

# Linux/macOS - 使用 LibreOffice
python server/api/files/split_docx_pages_libreoffice.py input.docx output_dir 30
```

## 🔧 配置说明

### LibreOffice 服务配置

默认配置：

- **主机**: 127.0.0.1
- **端口**: 2002
- **协议**: URP (UNO Remote Protocol)

修改配置（在 Python 脚本中）：

```python
desktop, ctx = connect_to_libreoffice(host='localhost', port=2002)
```

### 性能优化

1. **并发处理**: LibreOffice 支持多实例

```bash
# 启动多个 LibreOffice 实例（不同端口）
libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &
libreoffice --headless --accept="socket,host=127.0.0.1,port=2003;urp;" &
libreoffice --headless --accept="socket,host=127.0.0.1,port=2004;urp;" &
```

2. **内存优化**: 限制 LibreOffice 内存使用

```bash
libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" \
  --norestore --nologo --nolockcheck &
```

## 🐛 故障排查

### 1. 连接 LibreOffice 失败

**错误**: `无法连接到 LibreOffice`

**解决方案**:

```bash
# 检查 LibreOffice 是否在运行
ps aux | grep soffice

# 检查端口是否被占用
netstat -tuln | grep 2002

# 重启 LibreOffice 服务
pkill -9 soffice
libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &
```

### 2. pyuno 导入失败

**错误**: `ImportError: No module named 'uno'`

**解决方案**:

```bash
# Ubuntu/Debian
sudo apt-get install python3-uno

# 检查 pyuno 路径
python3 -c "import uno; print(uno.__file__)"

# 如果找不到，手动添加到 PYTHONPATH
export PYTHONPATH=/usr/lib/python3/dist-packages:$PYTHONPATH
```

### 3. 文档打开失败

**错误**: `无法打开文档`

**解决方案**:

- 确保文件路径正确且存在
- 检查文件权限（LibreOffice 运行用户需要读权限）
- 确保文件格式正确（.docx）

### 4. Windows 下 COM 错误

**错误**: `pywintypes.com_error: (-2147418111)`

**解决方案**:

- 关闭所有 Word 实例
- 以管理员身份运行脚本
- 禁用 Word 的保护视图功能

## 📊 性能对比

| 平台    | 实现方式    | 速度     | 稳定性   | 内存占用 |
| ------- | ----------- | -------- | -------- | -------- |
| Windows | win32com    | ⭐⭐⭐⭐ | ⭐⭐⭐   | ~200MB   |
| Linux   | LibreOffice | ⭐⭐⭐   | ⭐⭐⭐⭐ | ~150MB   |
| macOS   | LibreOffice | ⭐⭐⭐   | ⭐⭐⭐   | ~150MB   |

## 🔒 安全建议

1. **沙箱运行**: 在容器中运行 LibreOffice

```bash
docker run -d -p 2002:2002 \
  -v /path/to/docs:/docs \
  libreoffice/online
```

2. **资源限制**: 限制 LibreOffice 资源使用

```bash
systemd-run --scope -p MemoryLimit=500M -p CPUQuota=50% \
  libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;"
```

3. **访问控制**: 限制 LibreOffice 仅监听本地

```bash
# 仅本地访问
--accept="socket,host=127.0.0.1,port=2002;urp;"

# 如需远程访问，使用防火墙限制
sudo ufw allow from 192.168.1.0/24 to any port 2002
```

## 📝 Docker 部署示例

```dockerfile
FROM ubuntu:22.04

# 安装 LibreOffice 和 Python
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    python3 \
    python3-uno \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# 复制应用代码
COPY . /app
WORKDIR /app

# 启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000 2002

CMD ["/start.sh"]
```

```bash
# start.sh
#!/bin/bash

# 启动 LibreOffice 服务
libreoffice --headless --accept="socket,host=0.0.0.0,port=2002;urp;" &

# 等待 LibreOffice 启动
sleep 5

# 启动应用
pnpm start
```

## 🎓 最佳实践

1. **生产环境**: 使用 systemd 管理 LibreOffice 服务
2. **开发环境**: 使用原生平台方案（Windows 用 win32com）
3. **容器化部署**: 使用 Docker 统一环境
4. **监控**: 添加健康检查，自动重启失败的服务
5. **日志**: 记录所有拆分操作，便于问题追踪

## 📞 支持

遇到问题？查看：

- [LibreOffice UNO API 文档](https://api.libreoffice.org/)
- [Python-UNO 桥接文档](https://wiki.documentfoundation.org/Development/Python)
- [pywin32 文档](https://github.com/mhammond/pywin32)
