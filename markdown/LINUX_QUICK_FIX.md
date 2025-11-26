# 🚨 Linux 环境快速修复指南

## 错误：{"type":"error","data":{"message":"Python 脚本退出，代码: 1"}}

这是 Linux 环境下最常见的错误。按照以下步骤**一步步**排查和修复。

---

## 🔥 第一步：运行诊断脚本（强烈推荐）

```bash
chmod +x scripts/diagnose-linux.sh
./scripts/diagnose-linux.sh
```

或使用 npm:

```bash
npm run diagnose:linux
```

**诊断脚本会自动检查所有问题并给出修复建议！**

---

## 🛠️ 第二步：根据诊断结果修复

### 情况 A: python3-uno 未安装

如果看到：

```
✗ python3-uno 未安装
```

**修复**:

```bash
sudo apt-get update
sudo apt-get install python3-uno

# 验证
python3 -c "import uno; print('✓ 安装成功')"
```

### 情况 B: LibreOffice 未安装

如果看到：

```
✗ LibreOffice 未安装
```

**修复**:

```bash
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer python3-uno

# 验证
libreoffice --version
```

### 情况 C: LibreOffice 服务未运行

如果看到：

```
⚠ LibreOffice 服务未运行
```

**修复**:

```bash
# 方法1: 使用 npm
npm run libreoffice:start

# 方法2: 使用脚本
chmod +x start_libreoffice_service.sh
./start_libreoffice_service.sh

# 验证
npm run libreoffice:status
```

---

## 📊 第三步：查看详细错误日志

现在后端已增强错误日志输出。启动应用时会看到详细信息：

```bash
# 开发模式
pnpm dev

# 或查看 PM2 日志
pnpm pm2:logs
```

**重要**：在浏览器中触发 DOCX 拆分时，服务器控制台会输出完整的错误信息，包括：

- 退出代码
- 执行的命令
- 标准输出 (stdout)
- 标准错误 (stderr)

---

## ✅ 完整安装流程（全新服务器）

如果是全新的 Linux 服务器，按以下顺序执行：

```bash
# 1. 安装系统依赖
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer python3-uno

# 2. 启动 LibreOffice 服务
npm run libreoffice:start

# 3. 验证安装
npm run libreoffice:status

# 4. 运行完整测试
npm run test:cross-platform

# 5. 启动应用
pnpm dev:with-libreoffice
# 或生产模式
pnpm build
pnpm pm2:start
```

---

## 🔍 常用调试命令

```bash
# 查看 LibreOffice 服务状态
npm run libreoffice:status

# 查看 LibreOffice 进程
ps aux | grep soffice

# 查看端口占用
netstat -tuln | grep 2002
# 或
ss -tuln | grep 2002

# 重启 LibreOffice
npm run libreoffice:restart

# 查看应用日志
tail -f logs/combined.log

# 查看 LibreOffice 日志
tail -f logs/libreoffice-combined.log

# PM2 日志
pnpm pm2:logs
```

---

## 📋 验证清单

在启动应用前，确保以下所有项都打勾：

- [ ] ✅ Python 3 已安装 (`python3 --version`)
- [ ] ✅ LibreOffice 已安装 (`libreoffice --version`)
- [ ] ✅ python3-uno 已安装 (`python3 -c "import uno"`)
- [ ] ✅ LibreOffice 服务正在运行 (`npm run libreoffice:status`)
- [ ] ✅ 端口 2002 在监听 (`netstat -tuln | grep 2002`)
- [ ] ✅ uploads 目录存在且可写 (`ls -ld uploads/`)
- [ ] ✅ 诊断脚本全部通过 (`./scripts/diagnose-linux.sh`)

---

## 🎯 最快速的解决方案

```bash
# 一键安装所有依赖并启动服务
sudo apt-get update && \
sudo apt-get install -y libreoffice libreoffice-writer python3-uno && \
npm run libreoffice:start && \
npm run libreoffice:status && \
echo "✅ 安装完成！现在可以启动应用了"

# 然后启动应用
pnpm dev:with-libreoffice
```

---

## 💡 提示

1. **诊断脚本是你的好朋友** - 遇到问题先运行它
2. **查看服务器日志** - 现在有详细的错误输出
3. **确保服务运行** - `npm run libreoffice:status` 随时检查
4. **PM2 自动管理** - 生产环境用 `pnpm pm2:start`，LibreOffice 会自动启动

---

## 📞 还是不行？

1. 运行诊断并保存结果：

   ```bash
   ./scripts/diagnose-linux.sh > diagnosis.txt
   ```

2. 收集日志：

   ```bash
   tar -czf logs.tar.gz logs/
   ```

3. 手动测试脚本：

   ```bash
   python3 server/api/files/split_docx_pages_unified.py \
       test-docx/test.docx \
       /tmp/test_output \
       30
   ```

4. 提供以上信息以获取帮助

---

## 📚 详细文档

- [Linux 故障排查指南](./docs/LINUX_TROUBLESHOOTING.md) - 完整的问题解决方案
- [LibreOffice 集成指南](./docs/LIBREOFFICE_INTEGRATION.md) - 集成使用说明
- [跨平台部署文档](./docs/CROSS_PLATFORM_DEPLOYMENT.md) - 部署指南

---

**记住：诊断脚本会告诉你具体缺少什么！** 🎯
