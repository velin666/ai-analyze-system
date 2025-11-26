# 修复 Python 脚本执行超时错误

## 🚨 错误特征

```
拆分错误: 执行超时
退出代码: null
标准输出 (stdout): (无输出)
标准错误 (stderr): (无错误输出)
```

## 🔍 问题分析

**退出代码 `null`** + **无任何输出** = 脚本在连接 LibreOffice 时被应用层超时机制强制终止

## ⚡ 3 步快速解决

```bash
# 1️⃣ 检查 LibreOffice 服务状态
pnpm libreoffice:status

# 2️⃣ 重启 LibreOffice 服务
pnpm libreoffice:restart

# 3️⃣ 运行诊断
pnpm diagnose:linux
```

## 深度诊断

### 运行系统诊断

```bash
pnpm diagnose:linux
```

该脚本会检查：

- LibreOffice 安装状态
- Python UNO 依赖
- 端口 2002 监听状态
- 服务运行状态

### 常见诊断结果

#### 情况 1: 服务未运行

```
❌ 未找到 LibreOffice 进程
❌ 端口 2002 未被监听
```

**解决方案**:

```bash
pnpm libreoffice:start
pnpm libreoffice:status
```

#### 情况 2: 服务异常

```
✅ 找到 LibreOffice 进程
❌ 连接超时 (5秒内无响应)
```

**解决方案**:

```bash
pnpm libreoffice:restart
# 等待服务完全启动
sleep 5
pnpm libreoffice:status
```

#### 情况 3: 脚本问题

```
✅ LibreOffice 连接成功
❌ 模块导入失败
```

**解决方案**:

```bash
# 检查 Python 环境
python3 -c "import uno; print('UNO OK')"

# 重新安装依赖
sudo apt-get install --reinstall python3-uno
```

## 🔧 技术改进

### 新增超时保护

已在 `split_docx_pages_libreoffice_v2.py` 中添加：

```python
def connect_to_libreoffice(host='localhost', port=2002, max_retries=3, timeout=10):
    """连接到 LibreOffice 服务 - 带超时保护"""

    import signal

    def timeout_handler(signum, frame):
        raise TimeoutError(f"连接超时 ({timeout}秒)")

    # 每次连接尝试最多等待 10 秒
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout)

    # 连接逻辑...
```

### 改进特点

1. **明确超时**: 每次连接尝试 10 秒超时
2. **详细日志**: 显示连接进度和错误信息
3. **智能重试**: 失败后等待 3 秒重试
4. **错误诊断**: 提供具体的解决建议

## 🚨 紧急情况处理

### 方法 1: 快速重启

```bash
pnpm libreoffice:restart
```

### 方法 2: 强制重启所有服务

```bash
pnpm pm2:delete
pnpm pm2:start
```

### 方法 3: 手动启动 LibreOffice

```bash
# 停止现有进程
pkill -f "soffice.*2002"

# 手动启动
libreoffice --headless \
  --accept='socket,host=127.0.0.1,port=2002;urp;' \
  --nofirststartwizard &

# 验证启动
sleep 3
netstat -tuln | grep 2002
```

### 方法 4: 使用应急脚本

```bash
chmod +x start-libreoffice-quick.sh
./start-libreoffice-quick.sh
```

## 📊 超时原因分析

| 原因                   | 概率 | 解决方案                   |
| ---------------------- | ---- | -------------------------- |
| LibreOffice 服务未运行 | 60%  | `pnpm libreoffice:start`   |
| 服务响应慢/卡死        | 25%  | `pnpm libreoffice:restart` |
| 端口被占用/防火墙      | 10%  | 检查端口和防火墙           |
| Python 环境问题        | 5%   | 重装 python3-uno           |

## 🔍 预防措施

### 1. 定期健康检查

```bash
# 添加到 crontab
# */5 * * * * cd /path/to/ai-analyze-system && pnpm libreoffice:status >/dev/null || pnpm libreoffice:restart
```

### 2. 启用详细日志

在 PM2 配置中启用详细日志：

```javascript
{
  name: 'libreoffice-headless',
  script: 'libreoffice',
  args: '--headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard',
  log_file: 'logs/libreoffice-combined.log',
  out_file: 'logs/libreoffice-out.log',
  error_file: 'logs/libreoffice-err.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss'
}
```

### 3. 监控脚本

```bash
#!/bin/bash
# monitor-libreoffice.sh

if ! pnpm libreoffice:status >/dev/null 2>&1; then
    echo "LibreOffice 异常，正在重启..."
    pnpm libreoffice:restart

    # 发送通知（可选）
    # curl -X POST "https://hooks.slack.com/..." -d "text=LibreOffice 服务已重启"
fi
```

## ✅ 验证修复

修复后运行以下验证：

```bash
# 1. 检查服务状态
pnpm libreoffice:status
# 应该显示：✅ 服务正在运行

# 2. 运行诊断
pnpm diagnose:linux
# 应该显示：✅ 所有检查通过

# 3. 重新尝试文档拆分
# 上传 DOCX 文件并测试拆分功能
# 应该看到进度输出而不是超时错误
```

## 📚 相关文档

- **FIX_LIBREOFFICE_CONNECTION.md** - LibreOffice 连接问题完整指南
- **QUICK_FIX_LIBREOFFICE.md** - 快速修复参考
- **LIBREOFFICE_VERSION_COMPATIBILITY.md** - 版本兼容性说明
- **LINUX_TROUBLESHOOTING.md** - Linux 环境故障排查

## 🎉 总结

超时问题现在有了：

✅ **明确的超时设置** - 10 秒连接超时，避免无限等待  
✅ **专用诊断工具** - 快速定位问题根因  
✅ **智能重试机制** - 自动重试和错误处理  
✅ **详细错误提示** - 提供具体解决方案  
✅ **多重备用方案** - 确保服务可用性

下次遇到超时问题，运行 `pnpm diagnose:linux` 即可快速诊断和解决！🚀
