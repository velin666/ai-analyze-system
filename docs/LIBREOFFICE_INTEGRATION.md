# LibreOffice 服务集成使用指南

本文档说明如何使用已集成到 package.json 和 PM2 中的 LibreOffice 服务管理功能。

## 🎯 快速使用

### 开发环境

#### Windows 平台（自动使用 win32com）

```bash
# 普通启动（推荐）
pnpm dev

# 或使用集成脚本（会检测并跳过 LibreOffice）
pnpm dev:with-libreoffice
```

#### Linux/macOS 平台（自动启动 LibreOffice）

```bash
# 启动开发服务器（自动启动 LibreOffice）
pnpm dev:with-libreoffice

# 或手动管理
pnpm libreoffice:start  # 先启动 LibreOffice
pnpm dev                # 再启动开发服务器
```

### 生产环境（PM2）

```bash
# 构建应用
pnpm build

# 启动所有服务（包括 LibreOffice，仅非 Windows 平台）
pnpm pm2:start

# 查看状态
pnpm pm2:status

# 查看日志
pnpm pm2:logs

# 重启服务
pnpm pm2:restart

# 停止服务
pnpm pm2:stop

# 删除服务
pnpm pm2:delete
```

## 📋 可用命令

### LibreOffice 管理命令

```bash
# 启动 LibreOffice 服务
pnpm libreoffice:start

# 停止 LibreOffice 服务
pnpm libreoffice:stop

# 重启 LibreOffice 服务
pnpm libreoffice:restart

# 查看服务状态（推荐先运行）
pnpm libreoffice:status
```

### PM2 管理命令

```bash
# 启动应用和服务
pnpm pm2:start

# 停止所有服务
pnpm pm2:stop

# 重启所有服务
pnpm pm2:restart

# 删除所有服务
pnpm pm2:delete

# 查看运行状态
pnpm pm2:status

# 查看日志（实时）
pnpm pm2:logs

# 查看特定应用日志
pm2 logs file-analysis-system
pm2 logs libreoffice-headless
```

## 🔧 PM2 配置说明

### 自动平台检测

`ecosystem.config.cjs` 已配置为自动检测平台：

- **Windows**: 只启动应用服务器，使用 win32com
- **Linux/macOS**: 启动应用服务器 + LibreOffice 服务

### LibreOffice 服务配置

```javascript
{
  name: 'libreoffice-headless',
  script: 'libreoffice',
  args: '--headless --accept="socket,host=127.0.0.1,port=2002;urp;"',
  autorestart: true,        // 自动重启
  max_restarts: 10,         // 最多重启 10 次
  min_uptime: '10s',        // 最小运行时间
  restart_delay: 3000       // 重启延迟 3 秒
}
```

### 日志位置

```
logs/
├── err.log                      # 应用错误日志
├── out.log                      # 应用输出日志
├── combined.log                 # 应用综合日志
├── libreoffice-err.log          # LibreOffice 错误日志
├── libreoffice-out.log          # LibreOffice 输出日志
└── libreoffice-combined.log     # LibreOffice 综合日志
```

## 📊 服务状态检查

### 快速检查

```bash
# 使用集成命令
pnpm libreoffice:status
```

输出示例：

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

### 使用 PM2 检查

```bash
# 查看所有服务状态
pnpm pm2:status

# 输出示例：
# ┌─────┬────────────────────────┬─────────┬─────────┬──────────┐
# │ id  │ name                   │ mode    │ status  │ cpu      │
# ├─────┼────────────────────────┼─────────┼─────────┼──────────┤
# │ 0   │ file-analysis-system   │ cluster │ online  │ 0%       │
# │ 1   │ libreoffice-headless   │ fork    │ online  │ 0%       │
# └─────┴────────────────────────┴─────────┴─────────┴──────────┘
```

### 手动检查端口

```bash
# Linux/macOS
netstat -tuln | grep 2002
lsof -i :2002

# Windows
netstat -ano | findstr :2002
```

## 🐛 故障排查

### LibreOffice 服务未启动

**问题**: PM2 显示 LibreOffice 状态为 "errored"

**解决方案**:

1. 查看日志

   ```bash
   pm2 logs libreoffice-headless
   ```

2. 检查 LibreOffice 是否安装

   ```bash
   pnpm libreoffice:status
   ```

3. 手动启动测试
   ```bash
   libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;"
   ```

### 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use`

**解决方案**:

1. 找到占用进程

   ```bash
   # Linux/macOS
   lsof -i :2002

   # Windows
   netstat -ano | findstr :2002
   ```

2. 停止冲突进程

   ```bash
   pnpm libreoffice:stop
   ```

3. 重新启动
   ```bash
   pnpm pm2:restart
   ```

### PM2 启动失败

**问题**: PM2 无法启动服务

**解决方案**:

1. 删除旧的 PM2 进程

   ```bash
   pnpm pm2:delete
   pm2 kill
   ```

2. 重新启动

   ```bash
   pnpm pm2:start
   ```

3. 查看详细日志
   ```bash
   pm2 logs --lines 100
   ```

## 🚀 最佳实践

### 开发环境

1. **Windows 开发者**:

   ```bash
   # 直接使用普通命令，自动使用 win32com
   pnpm dev
   ```

2. **Linux/macOS 开发者**:

   ```bash
   # 使用集成启动脚本，自动管理 LibreOffice
   pnpm dev:with-libreoffice

   # 或手动控制
   pnpm libreoffice:start
   pnpm dev
   ```

### 生产部署

1. **首次部署**:

   ```bash
   # 安装依赖（Linux/macOS）
   sudo apt-get install libreoffice python3-uno  # Ubuntu
   # 或
   brew install libreoffice                       # macOS

   # 构建应用
   pnpm install
   pnpm build

   # 启动服务
   pnpm pm2:start

   # 保存 PM2 配置
   pm2 save
   pm2 startup
   ```

2. **更新部署**:

   ```bash
   git pull
   pnpm install
   pnpm build
   pnpm pm2:restart
   ```

3. **回滚**:
   ```bash
   git checkout previous-version
   pnpm install
   pnpm build
   pnpm pm2:restart
   ```

### 监控和维护

1. **设置监控**:

   ```bash
   # 使用 PM2 Plus (可选)
   pm2 link [secret] [public]
   ```

2. **定期检查**:

   ```bash
   # 每日检查
   pnpm pm2:status
   pnpm libreoffice:status
   ```

3. **日志管理**:

   ```bash
   # 清理旧日志
   pm2 flush

   # 或使用 logrotate 自动管理
   ```

## 📈 性能调优

### LibreOffice 多实例

如果需要更高并发，可以启动多个 LibreOffice 实例：

```javascript
// ecosystem.config.cjs
const libreofficeApps = [2002, 2003, 2004].map(port => ({
  name: `libreoffice-${port}`,
  script: 'libreoffice',
  args: `--headless --accept="socket,host=127.0.0.1,port=${port};urp;"`,
  // ... 其他配置
}))
```

### 内存限制

```javascript
// ecosystem.config.cjs
{
  name: 'libreoffice-headless',
  max_memory_restart: '500M',  // 内存超过 500M 自动重启
  // ...
}
```

## 📞 获取帮助

- 查看详细文档: [CROSS_PLATFORM_DEPLOYMENT.md](./CROSS_PLATFORM_DEPLOYMENT.md)
- PM2 文档: https://pm2.keymetrics.io/
- LibreOffice UNO: https://api.libreoffice.org/

## 🎉 总结

现在你可以：

✅ 使用 `pnpm dev:with-libreoffice` 开发（自动管理 LibreOffice）  
✅ 使用 `pnpm pm2:start` 部署生产环境（自动启动所有服务）  
✅ 使用 `pnpm libreoffice:*` 命令管理 LibreOffice  
✅ 使用 `pnpm pm2:*` 命令管理应用集群  
✅ 跨平台支持，一套配置，处处运行
