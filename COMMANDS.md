# 📋 快速命令参考

## 🚀 开发环境

```bash
# Windows（自动使用 win32com）
pnpm dev

# Linux/macOS（自动启动 LibreOffice）
pnpm dev:with-libreoffice
```

## 🏭 生产环境

```bash
# 构建和部署
pnpm build
pnpm pm2:start

# 管理
pnpm pm2:status     # 查看状态
pnpm pm2:logs       # 查看日志
pnpm pm2:restart    # 重启服务
pnpm pm2:stop       # 停止服务
```

## 🔧 LibreOffice 管理

```bash
pnpm libreoffice:status   # 查看状态（推荐先运行）
pnpm libreoffice:start    # 启动服务
pnpm libreoffice:stop     # 停止服务
pnpm libreoffice:restart  # 重启服务
```

## 🧪 测试

```bash
# 测试跨平台功能
python test_cross_platform.py

# 查看 LibreOffice 状态
pnpm libreoffice:status
```

## 📊 监控

```bash
# PM2 监控
pm2 monit

# 查看特定服务日志
pm2 logs file-analysis-system
pm2 logs libreoffice-headless
```

## 🔗 相关文档

- [LibreOffice 集成指南](./docs/LIBREOFFICE_INTEGRATION.md)
- [跨平台部署文档](./docs/CROSS_PLATFORM_DEPLOYMENT.md)
- [快速使用指南](./docs/DOCX_SPLIT_CROSS_PLATFORM.md)
