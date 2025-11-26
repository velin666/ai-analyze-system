# Linux 环境故障排查指南

## ⚡ 遇到连接错误？

**错误**: "Connection refused" 或 "couldn't connect to socket"

👉 **快速修复**: 查看 [FIX_LIBREOFFICE_CONNECTION.md](./FIX_LIBREOFFICE_CONNECTION.md) - 3 步解决方案  
👉 **超快参考**: 查看 [QUICK_FIX_LIBREOFFICE.md](../QUICK_FIX_LIBREOFFICE.md)

---

## 🚨 常见错误：Python 脚本退出，代码: 1

这个错误表示 Python 脚本执行失败。按以下步骤诊断和修复：

## 🔍 快速诊断

### 1. 运行诊断脚本（推荐）

```bash
chmod +x scripts/diagnose-linux.sh
./scripts/diagnose-linux.sh
```

诊断脚本会自动检查：

- ✅ Python 环境
- ✅ LibreOffice 安装
- ✅ python3-uno 模块
- ✅ LibreOffice 服务状态
- ✅ 连接测试
- ✅ 文件权限

### 2. 查看详细错误日志

启用新的错误日志后，服务器控制台会输出详细信息：

```bash
# 开发模式
pnpm dev

# 或生产模式
pnpm pm2:logs
```

查找这样的输出：

```
============================================================
Python 脚本执行失败
============================================================
退出代码: 1
命令: python /path/to/script.py ...

标准输出 (stdout):
...

标准错误 (stderr):
...
============================================================
```

## 🛠️ 常见问题和解决方案

### 问题 1: ImportError: No module named 'uno'

**错误信息**:

```
ImportError: No module named 'uno'
或
ModuleNotFoundError: No module named 'uno'
```

**原因**: python3-uno 未安装

**解决方案**:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3-uno

# 验证安装
python3 -c "import uno; print('UNO 已安装')"
```

### 问题 2: 无法连接到 LibreOffice

**错误信息**:

```
无法连接到 LibreOffice
或
Connection refused
```

**原因**: LibreOffice 服务未运行

**解决方案**:

```bash
# 方法1: 使用 npm 脚本
npm run libreoffice:start

# 方法2: 使用 shell 脚本
chmod +x start_libreoffice_service.sh
./start_libreoffice_service.sh

# 方法3: 手动启动
libreoffice --headless \
  --accept="socket,host=127.0.0.1,port=2002;urp;" \
  --nofirststartwizard &

# 验证服务
npm run libreoffice:status
```

### 问题 3: LibreOffice 未安装

**错误信息**:

```
libreoffice: command not found
```

**解决方案**:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer python3-uno

# CentOS/RHEL
sudo yum install -y libreoffice libreoffice-writer libreoffice-pyuno

# 验证安装
libreoffice --version
```

### 问题 4: 权限问题

**错误信息**:

```
Permission denied
或
EACCES: permission denied
```

**解决方案**:

```bash
# 修复上传目录权限
sudo chmod -R 755 uploads/
sudo chown -R $USER:$USER uploads/

# 如果使用 PM2
sudo chmod -R 755 .output/
sudo chown -R $USER:$USER .output/
```

### 问题 5: 端口被占用

**错误信息**:

```
Address already in use
或
EADDRINUSE
```

**解决方案**:

```bash
# 查找占用进程
lsof -i :2002
# 或
netstat -tuln | grep 2002

# 停止 LibreOffice
npm run libreoffice:stop
# 或
pkill -f "soffice.*2002"

# 重新启动
npm run libreoffice:start
```

### 问题 6: 文档文件不存在

**错误信息**:

```
No such file or directory
或
File not found
```

**解决方案**:

```bash
# 检查文件是否存在
ls -la uploads/*.docx

# 检查上传目录
ls -la uploads/

# 创建目录（如果不存在）
mkdir -p uploads

# 检查文件权限
chmod 644 uploads/*.docx
```

## 📋 完整的设置流程（全新 Linux 服务器）

### 1. 安装系统依赖

```bash
# 更新包列表
sudo apt-get update

# 安装 LibreOffice 和 UNO
sudo apt-get install -y \
    libreoffice \
    libreoffice-writer \
    python3 \
    python3-uno \
    python3-pip

# 验证安装
libreoffice --version
python3 -c "import uno; print('UNO 已安装')"
```

### 2. 安装 Node.js 依赖

```bash
# 安装项目依赖
pnpm install

# 或使用 npm
npm install
```

### 3. 启动 LibreOffice 服务

```bash
# 使用 npm 脚本
npm run libreoffice:start

# 验证服务状态
npm run libreoffice:status
```

### 4. 构建和启动应用

```bash
# 开发模式
pnpm dev:with-libreoffice

# 或生产模式
pnpm build
pnpm pm2:start
```

### 5. 验证功能

```bash
# 运行测试
python3 test_cross_platform.py

# 检查服务状态
pnpm pm2:status
```

## 🔍 手动调试步骤

### 1. 测试 Python 环境

```bash
# 检查 Python 版本
python3 --version

# 测试 UNO 导入
python3 -c "import uno; print(uno.__file__)"

# 测试脚本语法
python3 -m py_compile server/api/files/split_docx_pages_unified.py
```

### 2. 测试 LibreOffice 连接

```bash
# 创建测试脚本
cat > test_libreoffice.py << 'EOF'
import uno

try:
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context
    )
    ctx = resolver.resolve(
        "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"
    )
    print("✓ 连接成功")
except Exception as e:
    print(f"✗ 连接失败: {e}")
EOF

python3 test_libreoffice.py
```

### 3. 手动运行 Python 脚本

```bash
# 准备测试文件
TEST_DOCX="/path/to/test.docx"
OUTPUT_DIR="/tmp/test_output"
mkdir -p "$OUTPUT_DIR"

# 运行脚本
python3 server/api/files/split_docx_pages_unified.py \
    "$TEST_DOCX" \
    "$OUTPUT_DIR" \
    30

# 检查输出
ls -lh "$OUTPUT_DIR"
```

### 4. 查看日志

```bash
# 应用日志
tail -f logs/combined.log

# LibreOffice 日志
tail -f logs/libreoffice-combined.log

# PM2 日志
pm2 logs
pm2 logs libreoffice-headless
```

## 🚀 生产环境最佳实践

### 1. 使用 systemd 管理 LibreOffice

```bash
# 创建 systemd 服务
sudo tee /etc/systemd/system/libreoffice-headless.service > /dev/null <<EOF
[Unit]
Description=LibreOffice Headless Service
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/bin/libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard
Restart=always
RestartSec=10
StandardOutput=append:/var/log/libreoffice-headless.log
StandardError=append:/var/log/libreoffice-headless-error.log

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable libreoffice-headless
sudo systemctl start libreoffice-headless

# 查看状态
sudo systemctl status libreoffice-headless
```

### 2. 使用 PM2 部署

```bash
# 构建应用
pnpm build

# 启动所有服务（包括 LibreOffice）
pnpm pm2:start

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 3. 监控和告警

```bash
# 安装 PM2 监控
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 📞 获取帮助

### 1. 收集诊断信息

```bash
# 运行诊断脚本
./scripts/diagnose-linux.sh > diagnosis.txt 2>&1

# 收集日志
tar -czf logs.tar.gz logs/

# 提供这些文件以获取帮助
```

### 2. 常用命令汇总

```bash
# 服务管理
npm run libreoffice:start
npm run libreoffice:stop
npm run libreoffice:restart
npm run libreoffice:status

# PM2 管理
pnpm pm2:start
pnpm pm2:stop
pnpm pm2:restart
pnpm pm2:status
pnpm pm2:logs

# 诊断
./scripts/diagnose-linux.sh
python3 test_cross_platform.py
```

## 📚 相关文档

- [跨平台部署指南](./CROSS_PLATFORM_DEPLOYMENT.md)
- [LibreOffice 集成指南](./LIBREOFFICE_INTEGRATION.md)
- [快速命令参考](../COMMANDS.md)
