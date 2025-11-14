# 日志收集功能说明

本项目已集成 `nuxt3-winston-log` 日志收集功能，参考了 code-generate-system 项目的实现。

## 功能特性

### 1. 自动日志收集
- 使用 Winston 日志库进行结构化日志记录
- 支持多种日志级别：`error`、`warn`、`info`、`debug`
- 自动日志轮转，保留 30 天的日志文件
- 每个日志文件最大 1024MB

### 2. 日志查看界面
- 访问路径：`/logs`
- 支持按日志级别、服务、时间范围过滤
- 支持关键词搜索
- 实时查看系统运行状态

### 3. API 端点
- `GET /api/logs` - 获取日志列表，支持过滤和分页
- `GET /api/log-files` - 获取日志文件列表
- `DELETE /api/logs` - 删除指定的日志文件

## 配置说明

### nuxt.config.ts 配置
```typescript
nuxt3WinstonLog: {
  maxSize: '1024m',        // 单个日志文件最大大小
  maxFiles: '30d',         // 日志文件保留天数
  skipRequestMiddleware: true, // 跳过请求中间件
  level: 'info',           // 默认日志级别
  format: 'json'           // 日志格式
}
```

### 日志文件位置
- 日志文件存储在项目根目录的 `logs/` 文件夹中
- 文件命名格式：`YYYY-MM-DD-环境-级别.log`

## 使用方法

### 在服务端代码中记录日志
```typescript
import { createLogger } from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  const logger = createLogger('api-service')
  
  try {
    logger.info('开始处理请求', { userId: 'user123' })
    
    // 业务逻辑
    
    logger.info('请求处理完成', { duration: '200ms' })
    
  } catch (error) {
    logger.error('请求处理失败', { 
      error: error.message,
      stack: error.stack 
    })
  }
})
```

### 日志级别说明
- **error**: 系统错误，需要立即关注
- **warn**: 警告信息，可能存在问题
- **info**: 一般信息，记录系统运行状态
- **debug**: 调试信息，开发阶段使用

## 已集成的日志记录点

### 文件分析 API (`/api/analyze/[id]`)
- 记录分析开始和结束时间
- 记录文件信息（ID、名称、大小）
- 记录分析结果（复杂度、错误数量）
- 记录执行时长

### 日志管理 API
- 记录日志查询操作
- 记录日志文件删除操作
- 记录 API 调用失败情况

## 最佳实践

1. **合理使用日志级别**
   - error: 只记录真正的错误
   - warn: 记录异常但不影响功能的情况
   - info: 记录重要的业务操作
   - debug: 详细的调试信息

2. **结构化日志**
   - 使用对象形式记录上下文信息
   - 保持日志格式的一致性
   - 包含关键的业务标识符

3. **性能考虑**
   - 避免在高频操作中记录过多日志
   - 使用合适的日志级别
   - 定期清理过期日志

## 监控和维护

- 定期检查日志文件大小和数量
- 监控错误日志的频率和类型
- 根据实际情况调整日志级别和保留策略
- 使用日志分析工具进行更深入的分析

## 故障排查

如果日志功能出现问题：

1. 检查 `logs/` 目录是否存在且有写入权限
2. 检查 `nuxt3-winston-log` 依赖是否正确安装
3. 检查配置是否正确
4. 查看控制台是否有相关错误信息
