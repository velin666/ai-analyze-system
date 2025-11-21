export default defineEventHandler((event) => {
  // 设置CORS响应头
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*', // 允许所有域名访问，生产环境建议设置具体域名
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 预检请求缓存24小时
  })

  // 处理OPTIONS预检请求
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})
