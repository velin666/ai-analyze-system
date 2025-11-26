# 解决方案总结: LibreOffice 连接错误

## 🎯 问题分析

您遇到的错误：

```
Connector : couldn't connect to socket (Connection refused)
at ./io/source/connector/connector.cxx:118
```

**根本原因**: Python 脚本无法连接到 LibreOffice headless 服务，因为服务未在端口 2002 上运行。

## ✅ 已实施的改进

### 1. 增强错误提示 ✨

更新了 `split_docx_pages_libreoffice.py`，现在连接失败时会显示：

- 详细的错误诊断信息
- 可能的原因分析
- 3 种解决方法
- 相关文档链接

### 2. 创建快速修复指南 📋

新增文档：

- **`QUICK_FIX_LIBREOFFICE.md`** - 3 步快速解决方案
- **`docs/FIX_LIBREOFFICE_CONNECTION.md`** - 完整排查指南
- **`start-libreoffice-quick.sh`** - 快速启动脚本

### 3. 更新集成文档 📚

在 `docs/LIBREOFFICE_INTEGRATION.md` 添加了故障排查链接。

## 🚀 立即解决（3 步）

在您的 Linux 服务器上运行：

```bash
# 步骤 1: 启动 LibreOffice 服务
pnpm libreoffice:start

# 步骤 2: 验证服务状态
pnpm libreoffice:status

# 步骤 3: 测试连接
netstat -tuln | grep 2002
```

## 📖 可用资源

### 快速参考

- **快速修复**: [QUICK_FIX_LIBREOFFICE.md](QUICK_FIX_LIBREOFFICE.md)
- **快速启动脚本**: `chmod +x start-libreoffice-quick.sh && ./start-libreoffice-quick.sh`

### 详细文档

- **完整排查**: [docs/FIX_LIBREOFFICE_CONNECTION.md](docs/FIX_LIBREOFFICE_CONNECTION.md)
- **Linux 故障排查**: [docs/LINUX_TROUBLESHOOTING.md](docs/LINUX_TROUBLESHOOTING.md)
- **LibreOffice 集成**: [docs/LIBREOFFICE_INTEGRATION.md](docs/LIBREOFFICE_INTEGRATION.md)

### 诊断工具

```bash
# 运行完整诊断
pnpm diagnose:linux

# 或直接运行脚本
./scripts/diagnose-linux.sh
```

## 🔧 常用命令

### LibreOffice 管理

```bash
# 启动服务
pnpm libreoffice:start

# 停止服务
pnpm libreoffice:stop

# 重启服务
pnpm libreoffice:restart

# 查看状态
pnpm libreoffice:status
```

### PM2 管理（生产环境）

```bash
# 启动所有服务（自动启动 LibreOffice）
pnpm pm2:start

# 查看状态
pnpm pm2:status

# 查看日志
pnpm pm2:logs

# 重启服务
pnpm pm2:restart
```

## 🛠️ 首次安装（如果尚未安装）

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer python3-uno
```

### CentOS/RHEL

```bash
sudo yum install -y libreoffice libreoffice-writer libreoffice-pyuno
```

### 验证安装

```bash
libreoffice --version
python3 -c "import uno; print('✓ UNO 已安装')"
```

## 🎯 推荐工作流

### 开发环境

```bash
# 自动管理 LibreOffice（推荐）
pnpm dev:with-libreoffice

# 或手动管理
pnpm libreoffice:start
pnpm dev
```

### 生产环境

```bash
# 1. 构建应用
pnpm build

# 2. 使用 PM2 启动（自动管理 LibreOffice）
pnpm pm2:start

# 3. 保存配置（开机自启）
pm2 save
pm2 startup
```

## 📊 验证成功

当问题解决后，运行 `pnpm libreoffice:status` 应该看到：

```
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

## 🔍 如果问题仍然存在

1. **运行完整诊断**

   ```bash
   pnpm diagnose:linux > diagnosis.txt 2>&1
   ```

2. **查看详细日志**

   ```bash
   # 应用日志
   tail -f logs/combined.log

   # LibreOffice 日志
   tail -f logs/libreoffice-combined.log

   # PM2 日志
   pm2 logs
   ```

3. **手动测试连接**

   ```bash
   # 创建测试脚本
   python3 << 'EOF'
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
   ```

4. **查看详细文档**
   - [FIX_LIBREOFFICE_CONNECTION.md](docs/FIX_LIBREOFFICE_CONNECTION.md)

## 📞 需要帮助？

如果按照上述步骤仍无法解决：

1. 收集诊断信息：

   ```bash
   pnpm diagnose:linux > diagnosis.txt 2>&1
   tar -czf debug-info.tar.gz diagnosis.txt logs/
   ```

2. 提供以下信息：
   - 操作系统版本: `uname -a`
   - Python 版本: `python3 --version`
   - LibreOffice 版本: `libreoffice --version`
   - 错误日志: `diagnosis.txt`

## 🎉 总结

现在您有了：

✅ 增强的错误提示 - 自动显示解决方案  
✅ 快速修复指南 - 3 步解决问题  
✅ 完整排查文档 - 涵盖所有场景  
✅ 诊断工具 - 自动检测问题  
✅ 管理脚本 - 轻松启停服务  
✅ 快速启动脚本 - 紧急情况使用

**下次遇到此错误，只需运行**: `pnpm libreoffice:start` 🚀
