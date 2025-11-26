# 文件清理功能

## 概述

系统自动清理 `/uploads` 目录中超过 24 小时的文件，防止磁盘空间占用过多。

## 功能特性

- **自动清理**: 服务器启动后，每 6 小时自动运行清理任务
- **24 小时过期**: 文件上传 24 小时后自动删除
- **元数据清理**: 同时清理对应的 `.meta.json` 文件
- **详细日志**: 记录清理过程和结果
- **手动触发**: 支持通过 API 手动执行清理
- **统计信息**: 查看当前文件状态和清理统计

## API 接口

### 1. 手动清理文件

```
POST /api/files/cleanup
```

**响应**:

```json
{
  "success": true,
  "message": "File cleanup completed successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 查看清理统计

```
GET /api/files/cleanup-stats
```

**响应**:

```json
{
  "success": true,
  "data": {
    "totalFiles": 10,
    "oldFiles": 3,
    "totalSize": 1048576,
    "oldFilesSize": 524288,
    "oldFileSizeFormatted": "512 KB",
    "totalSizeFormatted": "1 MB",
    "cleanupThreshold": "24 hours",
    "nextCleanup": "Every 6 hours"
  }
}
```

## 配置说明

### 清理间隔

- **文件过期时间**: 24 小时（`CLEANUP_INTERVAL_MS`）
- **检查频率**: 每 6 小时运行一次清理任务
- **启动时执行**: 服务器启动时立即执行一次清理

### 日志记录

清理过程会记录以下信息：

- 清理开始和完成
- 删除的文件列表
- 错误信息
- 统计结果

## 测试工具

项目提供了测试脚本来验证清理功能：

```bash
# 创建测试文件（包含新旧文件）
node scripts/test-cleanup.js create

# 查看当前文件状态
node scripts/test-cleanup.js

# 手动触发清理（需要服务器运行）
curl -X POST http://localhost:3000/api/files/cleanup

# 查看清理统计
curl http://localhost:3000/api/files/cleanup-stats
```

## 实现细节

### 文件结构

```
server/
├── utils/
│   └── fileCleanup.ts          # 清理工具函数
├── plugins/
│   └── fileCleanupScheduler.ts # 启动调度器
└── api/
    └── files/
        ├── cleanup.post.ts      # 手动清理API
        └── cleanup-stats.get.ts # 统计查看API
```

### 清理逻辑

1. 扫描 `uploads` 目录中的所有文件
2. 检查文件的修改时间 (`mtime`)
3. 删除超过 24 小时的文件
4. 自动删除对应的 `.meta.json` 元数据文件
5. 记录详细的操作日志
6. 返回统计信息

### 安全性

- 只处理 `uploads` 目录
- 跳过子目录（避免误删）
- 错误处理和日志记录
- 不会影响正在使用的文件

## 监控建议

建议定期检查：

1. 日志中的清理记录
2. 磁盘空间使用情况
3. 清理统计 API 的返回数据
4. 确保清理任务正常运行

## 故障排除

### 常见问题

1. **清理不工作**

   - 检查服务器是否正常启动
   - 查看日志是否有错误信息
   - 验证 uploads 目录权限

2. **文件未被删除**

   - 确认文件确实超过 24 小时
   - 检查文件权限
   - 查看错误日志

3. **统计 API 返回错误**
   - 检查 uploads 目录是否存在
   - 验证文件读取权限
   - 查看服务器日志

### 调试命令

```bash
# 查看uploads目录
ls -la uploads/

# 手动测试清理函数
node -e "require('./server/utils/fileCleanup').cleanupOldFiles()"

# 检查日志
tail -f logs/app.log
```
