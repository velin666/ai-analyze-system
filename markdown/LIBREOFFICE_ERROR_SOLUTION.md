# LibreOffice 错误完整解决方案

## 🎯 已解决的问题

### 1. 连接错误

**问题**: `"couldn't connect to socket (Connection refused)"`  
**解决**: 完整的 LibreOffice 服务管理和诊断系统

### 2. API 兼容性错误

**问题**: `{"type":"error","data":{"fileIndex":1,"message":"gotoStartOfPage"}}`  
**解决**: 创建兼容性更好的 LibreOffice 脚本版本

## ✅ 解决方案概览

| 问题类型   | 文件                            | 解决方案       |
| ---------- | ------------------------------- | -------------- |
| 连接问题   | `FIX_LIBREOFFICE_CONNECTION.md` | 服务启动和诊断 |
| API 兼容性 | `FIX_GOTOSTARTONPAGE_ERROR.md`  | 新版本脚本     |
| 快速修复   | `QUICK_FIX_LIBREOFFICE.md`      | 3 步解决方案   |

## 🚀 立即使用（推荐步骤）

### Step 1: 启动 LibreOffice 服务

```bash
pnpm libreoffice:start
```

### Step 2: 验证服务状态

```bash
pnpm libreoffice:status
```

### Step 3: 运行诊断

```bash
pnpm diagnose:linux
```

### Step 4: 验证文档拆分

现在重新尝试上传和拆分 DOCX 文档。

## 🔧 技术改进详情

### 1. 服务管理改进

- ✅ 自动平台检测
- ✅ 智能错误诊断
- ✅ 详细状态报告
- ✅ PM2 集成管理

### 2. 兼容性改进

- ✅ 创建 LibreOffice v2 兼容脚本
- ✅ 避免问题 API 方法 (`gotoStartOfPage`)
- ✅ 使用 UNO Dispatcher 替代
- ✅ 自动回退机制

### 3. 错误处理改进

- ✅ 详细错误信息
- ✅ 解决方案指导
- ✅ 自动重试机制
- ✅ 友好的用户提示

## 📁 新增文件结构

```
ai-analyze-system/
├── server/api/files/
│   ├── split_docx_pages_libreoffice_v2.py     # 🆕 兼容版本
│   └── split_docx_pages_unified.py            # 🔄 更新统一接口
├── docs/
│   ├── FIX_LIBREOFFICE_CONNECTION.md          # 🆕 连接问题完整指南
│   └── FIX_GOTOSTARTONPAGE_ERROR.md           # 🆕 API 兼容性修复
├── scripts/
│   ├── libreoffice-service.js                 # 🔄 增强服务管理
│   └── diagnose-linux.sh                      # 🔄 自动诊断
├── QUICK_FIX_LIBREOFFICE.md                   # 🆕 快速参考
├── LIBREOFFICE_ERROR_SOLUTION.md              # 🆕 完整解决方案
└── start-libreoffice-quick.sh                 # 🆕 应急启动脚本
```

## 🎯 使用场景

### 开发环境

```bash
# 方式 1: 自动管理（推荐）
pnpm dev:with-libreoffice

# 方式 2: 手动管理
pnpm libreoffice:start
pnpm dev
```

### 生产环境

```bash
# 使用 PM2（推荐）
pnpm build
pnpm pm2:start    # 自动启动 LibreOffice + 应用

# 查看状态
pnpm pm2:status
pnpm pm2:logs
```

### 故障排查

```bash
# 快速诊断
pnpm diagnose:linux

# 服务管理
pnpm libreoffice:status
pnpm libreoffice:restart

# 运行诊断
pnpm diagnose:linux
```

## 📊 兼容性矩阵

| 环境    | 推荐方案       | 状态          |
| ------- | -------------- | ------------- |
| Windows | win32com       | ✅ 完全支持   |
| Linux   | LibreOffice v2 | ✅ 兼容性修复 |
| macOS   | LibreOffice v2 | ✅ 兼容性修复 |
| Docker  | LibreOffice v2 | ✅ 容器友好   |

## 🔍 验证修复成功

运行以下命令验证所有问题已解决：

```bash
# 1. 检查服务状态
pnpm libreoffice:status
# 应该显示：✓ 服务正在运行

# 2. 运行系统诊断
pnpm diagnose:linux
# 应该显示：✅ 所有检查通过

# 3. 测试实际拆分功能
# 上传 DOCX 文件并尝试拆分
# 应该成功生成拆分文件，无错误信息
```

## 🚨 紧急情况处理

如果遇到紧急问题：

### 1. 快速重启

```bash
pnpm libreoffice:restart
```

### 2. 应急启动

```bash
chmod +x start-libreoffice-quick.sh
./start-libreoffice-quick.sh
```

### 3. 强制重置

```bash
pnpm pm2:delete
pnpm pm2:start
```

## 📚 相关文档

| 文档                            | 用途               | 优先级 |
| ------------------------------- | ------------------ | ------ |
| `QUICK_FIX_LIBREOFFICE.md`      | 紧急情况 3 步修复  | 🔥 高  |
| `FIX_LIBREOFFICE_CONNECTION.md` | 连接问题完整指南   | ⭐ 中  |
| `FIX_GOTOSTARTONPAGE_ERROR.md`  | API 兼容性问题     | ⭐ 中  |
| `LINUX_TROUBLESHOOTING.md`      | Linux 环境故障排查 | 💡 低  |

## 🎉 总结

现在您拥有：

✅ **完整的错误解决方案** - 涵盖连接和兼容性问题  
✅ **自动化服务管理** - 一键启动、监控和重启  
✅ **智能故障诊断** - 自动检测和修复建议  
✅ **兼容性保证** - 支持多种 LibreOffice 版本  
✅ **详细文档** - 从快速修复到深度排查  
✅ **系统诊断** - 确保修复有效性

**下次遇到 LibreOffice 相关问题，只需查看对应文档并运行相关命令即可快速解决！** 🚀
