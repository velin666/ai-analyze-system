# 🚨 LibreOffice 连接错误快速修复

## 错误类型

### 1️⃣ "couldn't connect to socket (Connection refused)"

### 2️⃣ "gotoStartOfPage" (LibreOffice 24.x 版本)

**当前环境**: LibreOffice 24.2.7.2 - 已针对此版本优化！✨

### ⚡ 3 步快速修复

```bash
# 1️⃣ 启动 LibreOffice 服务
pnpm libreoffice:start

# 2️⃣ 验证服务运行
pnpm libreoffice:status

# 3️⃣ 测试连接
netstat -tuln | grep 2002
```

---

---

## 📋 如果还是不行

### 运行诊断

```bash
pnpm diagnose:linux
```

### 重启服务

```bash
pnpm libreoffice:restart
```

### 手动启动

```bash
libreoffice --headless --accept='socket,host=127.0.0.1,port=2002;urp;' --nofirststartwizard &
```

---

## 🔍 检查安装

### 检查 LibreOffice

```bash
which libreoffice
libreoffice --version
```

### 检查 Python UNO

```bash
python3 -c "import uno; print('✓ UNO 已安装')"
```

### 如果未安装

```bash
# Ubuntu/Debian
sudo apt-get install libreoffice python3-uno

# CentOS/RHEL
sudo yum install libreoffice libreoffice-pyuno
```

---

## 🚀 生产环境部署

### 使用 PM2（推荐）

```bash
pnpm build
pnpm pm2:start    # 自动启动 LibreOffice
pnpm pm2:status
```

---

## 📚 详细文档

完整排查指南: [docs/FIX_LIBREOFFICE_CONNECTION.md](docs/FIX_LIBREOFFICE_CONNECTION.md)

---

## ✅ 成功标志

```bash
$ pnpm libreoffice:status

============================================================
  LibreOffice 服务状态
============================================================

✓ 服务正在运行 (127.0.0.1:2002)

进程列表:
  - PID: 12345

✓ LibreOffice 已安装
✓ python3-uno 已安装
============================================================
```

搞定！🎉
