export default defineNuxtRouteMiddleware((to, from) => {
  // 在客户端检查认证状态
  if (process.client) {
    const user = localStorage.getItem('user')
    
    // 如果没有用户信息且不是登录页面，重定向到登录页
    if (!user && to.path !== '/auth/login') {
      return navigateTo('/auth/login')
    }
    
    // 如果已登录且访问登录页，重定向到首页
    if (user && to.path === '/auth/login') {
      return navigateTo('/')
    }
  }
})
