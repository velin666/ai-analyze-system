# 修复 LibreOffice 连接错误

## 🚨 错误信息

```
Connector : couldn't connect to socket (Connection refused)
at ./io/source/connector/connector.cxx:118
```

这个错误表示 Python 脚本无法连接到 LibreOffice headless 服务的套接字端口（默认 2002）。

## 🔧 快速修复（3 个命令）

在 Linux 服务器上运行：

```bash
# 1. 检查 LibreOffice 服务状态
pnpm libreoffice:status

# 2. 启动 LibreOffice 服务
pnpm libreoffice:start

# 3. 验证连接
netstat -tuln | grep 2002
# 或使用 ss
ss -tuln | grep 2002
```

## 📋 详细排查步骤

### 步骤 1: 运行诊断脚本

```bash
# 运行自动诊断
pnpm diagnose:linux

# 或直接运行
chmod +x scripts/diagnose-linux.sh
./scripts/diagnose-linux.sh
```

诊断脚本会自动检查：

- ✅ Python 环境
- ✅ LibreOffice 安装状态
- ✅ python3-uno 模块
- ✅ LibreOffice 服务运行状态
- ✅ 端口占用情况
- ✅ 连接测试

### 步骤 2: 确认 LibreOffice 已安装

```bash
# 检查 LibreOffice 是否安装
which libreoffice
libreoffice --version

# 如果未安装
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer python3-uno

# CentOS/RHEL:
sudo yum install -y libreoffice libreoffice-writer libreoffice-pyuno
```

### 步骤 3: 确认 python3-uno 已安装

```bash
# 测试 UNO 模块
python3 -c "import uno; print('UNO 已安装:', uno.__file__)"

# 如果失败，安装 python3-uno
# Ubuntu/Debian:
sudo apt-get install python3-uno

# CentOS/RHEL:
sudo yum install libreoffice-pyuno
```

### 步骤 4: 启动 LibreOffice 服务

#### 方法 1: 使用 npm 脚本（推荐）

```bash
# 启动服务
pnpm libreoffice:start

# 查看状态
pnpm libreoffice:status

# 如果需要重启
pnpm libreoffice:restart
```

#### 方法 2: 手动启动

```bash
# 后台启动 LibreOffice headless 服务
libreoffice --headless \
  --accept='socket,host=127.0.0.1,port=2002;urp;' \
  --nofirststartwizard &

# 等待服务启动
sleep 3

# 验证服务
netstat -tuln | grep 2002
```

#### 方法 3: 使用 PM2（生产环境推荐）

```bash
# PM2 会自动启动 LibreOffice（非 Windows 平台）
pnpm build
pnpm pm2:start

# 查看状态
pnpm pm2:status

# 查看 LibreOffice 日志
pm2 logs libreoffice-headless
```

### 步骤 5: 验证连接

```bash
# 创建测试脚本
cat > /tmp/test_libreoffice_connection.py << 'EOF'
#!/usr/bin/env python3
import sys

try:
    import uno

    # 连接到 LibreOffice
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context
    )

    connection_string = "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"
    ctx = resolver.resolve(connection_string)

    print("✓ LibreOffice 连接成功！")
    print(f"  连接字符串: {connection_string}")
    sys.exit(0)

except Exception as e:
    print(f"✗ LibreOffice 连接失败: {e}")
    print("\n请检查:")
    print("  1. LibreOffice 服务是否运行: pnpm libreoffice:status")
    print("  2. 端口 2002 是否开放: netstat -tuln | grep 2002")
    print("  3. 重启服务: pnpm libreoffice:restart")
    sys.exit(1)
EOF

# 运行测试
python3 /tmp/test_libreoffice_connection.py
```

## 🐛 常见问题

### 问题 1: 端口被占用

**症状**: 启动服务时提示端口已被占用

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :2002
# 或
netstat -tuln | grep 2002

# 停止旧的 LibreOffice 进程
pnpm libreoffice:stop
# 或强制杀死
pkill -9 -f "soffice.*2002"

# 重新启动
pnpm libreoffice:start
```

### 问题 2: 服务启动后立即退出

**症状**: 启动成功但端口无法连接

**可能原因**:

- LibreOffice 配置文件损坏
- 权限问题
- 依赖库缺失

**解决方案**:

```bash
# 1. 清理 LibreOffice 用户配置
rm -rf ~/.config/libreoffice

# 2. 检查日志
pm2 logs libreoffice-headless
# 或
tail -f logs/libreoffice-*.log

# 3. 手动测试启动
libreoffice --headless --accept='socket,host=127.0.0.1,port=2002;urp;'
# 观察是否有错误输出

# 4. 检查是否缺少依赖
ldd $(which libreoffice) | grep "not found"
```

### 问题 3: 防火墙阻止连接

**症状**: 服务运行但连接被拒绝

**解决方案**:

```bash
# 检查防火墙规则
sudo ufw status
sudo iptables -L

# 允许本地连接（如果需要）
sudo ufw allow from 127.0.0.1 to any port 2002
```

### 问题 4: Python 找不到 uno 模块

**症状**: `ImportError: No module named 'uno'`

**解决方案**:

```bash
# 确认使用系统 Python3
which python3
python3 --version

# 重新安装 python3-uno
sudo apt-get remove python3-uno
sudo apt-get install python3-uno

# 验证
python3 -c "import uno; print(uno.__file__)"
```

### 问题 5: 权限问题

**症状**: `Permission denied`

**解决方案**:

```bash
# 修复上传目录权限
sudo chmod -R 755 uploads/
sudo chown -R $USER:$USER uploads/

# 修复日志目录权限
sudo chmod -R 755 logs/
sudo chown -R $USER:$USER logs/

# 如果使用 PM2
sudo chmod -R 755 .output/
sudo chown -R $USER:$USER .output/
```

## 🚀 生产环境部署建议

### 使用 PM2（推荐）

PM2 会自动管理 LibreOffice 服务并在崩溃时重启：

```bash
# 1. 构建应用
pnpm install
pnpm build

# 2. 启动所有服务（应用 + LibreOffice）
pnpm pm2:start

# 3. 保存配置（开机自启）
pm2 save
pm2 startup

# 4. 监控
pnpm pm2:status
pnpm pm2:logs
```

### 使用 systemd

创建 systemd 服务确保开机自启：

```bash
# 创建服务文件
sudo tee /etc/systemd/system/libreoffice-headless.service > /dev/null <<EOF
[Unit]
Description=LibreOffice Headless Service for Document Processing
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard
Restart=always
RestartSec=10
StandardOutput=append:$(pwd)/logs/libreoffice-out.log
StandardError=append:$(pwd)/logs/libreoffice-err.log

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动
sudo systemctl daemon-reload
sudo systemctl enable libreoffice-headless
sudo systemctl start libreoffice-headless

# 查看状态
sudo systemctl status libreoffice-headless
```

## 📊 健康检查

创建定期健康检查脚本：

```bash
# 创建健康检查脚本
cat > scripts/check-libreoffice-health.sh << 'EOF'
#!/bin/bash

# 检查端口
if ! netstat -tuln 2>/dev/null | grep -q ":2002 " && ! ss -tuln 2>/dev/null | grep -q ":2002 "; then
    echo "ERROR: LibreOffice 服务端口未监听"
    # 自动重启
    pnpm libreoffice:restart
    exit 1
fi

# 测试连接
if ! python3 -c "import uno; uno.getComponentContext()" 2>/dev/null; then
    echo "ERROR: LibreOffice 连接失败"
    exit 1
fi

echo "OK: LibreOffice 服务正常"
exit 0
EOF

chmod +x scripts/check-libreoffice-health.sh

# 添加到 crontab（每 5 分钟检查）
# crontab -e
# */5 * * * * /path/to/ai-analyze-system/scripts/check-libreoffice-health.sh
```

## 🔍 调试模式

启用详细日志查看具体问题：

```bash
# 开发模式（自动启动 LibreOffice）
pnpm dev:with-libreoffice

# 查看实时日志
tail -f logs/combined.log
tail -f logs/libreoffice-combined.log

# 如果使用 PM2
pm2 logs --lines 100
```

## 📞 仍然无法解决？

如果按照上述步骤仍然无法解决，请收集以下信息：

```bash
# 收集诊断信息
pnpm diagnose:linux > diagnosis.txt 2>&1

# 收集系统信息
uname -a >> diagnosis.txt
python3 --version >> diagnosis.txt
libreoffice --version >> diagnosis.txt

# 收集日志
tar -czf debug-logs.tar.gz logs/ diagnosis.txt

# 提供这些文件以获取帮助
```

## 📚 相关文档

- [Linux 故障排查指南](./LINUX_TROUBLESHOOTING.md)
- [LibreOffice 集成指南](./LIBREOFFICE_INTEGRATION.md)
- [跨平台部署指南](./CROSS_PLATFORM_DEPLOYMENT.md)

## ✅ 验证成功

当一切正常时，你应该看到：

```bash
$ pnpm libreoffice:status

============================================================
  LibreOffice 服务状态
============================================================

平台: Linux
推荐方案: LibreOffice + pyuno

✓ 服务正在运行 (127.0.0.1:2002)

进程列表:
  - PID: 12345

✓ LibreOffice 已安装: /usr/bin/libreoffice
✓ python3-uno 已安装

============================================================
```

现在你可以正常使用文档拆分功能了！🎉
