# CORS跨域配置说明

本项目已配置CORS（跨域资源共享），允许外部页面调用本服务器的API接口。

## 配置文件

### 1. 服务器中间件 (`server/middleware/cors.ts`)

全局CORS中间件，自动处理所有请求的跨域问题：

- **Access-Control-Allow-Origin**: `*` - 允许所有域名访问
- **Access-Control-Allow-Methods**: 支持 GET、POST、PUT、DELETE、PATCH、OPTIONS
- **Access-Control-Allow-Headers**: 允许 Content-Type、Authorization、X-Requested-With 等常用请求头
- **Access-Control-Max-Age**: 86400秒（24小时）- 预检请求缓存时间

### 2. Nuxt配置 (`nuxt.config.ts`)

在 `routeRules` 中为所有 `/api/**` 路由启用CORS支持。

## 生产环境安全建议

当前配置使用 `Access-Control-Allow-Origin: *` 允许所有域名访问。在生产环境中，建议：

### 方案一：限制特定域名

修改 `server/middleware/cors.ts`:

```typescript
export default defineEventHandler((event) => {
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000' // 开发环境
  ]
  
  const origin = getRequestHeader(event, 'origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    })
  }

  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})
```

### 方案二：使用环境变量

在 `.env` 文件中配置：

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

修改中间件读取环境变量：

```typescript
export default defineEventHandler((event) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  const origin = getRequestHeader(event, 'origin')
  
  const allowOrigin = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))
    ? (origin || '*')
    : allowedOrigins[0]
  
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': allowOrigin,
    // ... 其他配置
  })
  
  // ... 处理OPTIONS
})
```

## 测试CORS配置

### 使用curl测试

```bash
# 测试预检请求
curl -X OPTIONS http://localhost:3000/api/files/upload \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# 测试实际请求
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Origin: http://example.com" \
  -v
```

### 使用JavaScript测试

```javascript
// 从外部页面调用API
fetch('http://your-server:3000/api/dashboard/stats', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('CORS Error:', error))
```

## 常见问题

### 1. 仍然出现CORS错误

- 确保服务器已重启以加载新的中间件配置
- 检查浏览器控制台的具体错误信息
- 确认请求的URL是否正确

### 2. 携带Cookie的跨域请求

如果需要在跨域请求中携带Cookie，需要：

前端：
```javascript
fetch('http://your-server:3000/api/endpoint', {
  method: 'POST',
  credentials: 'include' // 重要：允许发送Cookie
})
```

后端（已配置）：
```typescript
'Access-Control-Allow-Credentials': 'true'
```

**注意**：当使用 `credentials: 'include'` 时，`Access-Control-Allow-Origin` 不能设置为 `*`，必须指定具体域名。

### 3. 自定义请求头

如果使用了自定义请求头（如 `X-Custom-Header`），需要在 `Access-Control-Allow-Headers` 中添加：

```typescript
'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Custom-Header'
```

## 重启服务

修改配置后，需要重启服务：

```bash
# 开发环境
npm run dev

# 生产环境（PM2）
npm run pm2:restart
```
