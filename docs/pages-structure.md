# Pages 目录结构重组

## 新的目录结构

```
pages/
├── index.vue              # 首页（保持不变）
├── auth/                  # 认证模块
│   └── login.vue         # 登录页面
├── main/                  # 主要功能模块
│   ├── dashboard.vue     # 详细仪表盘
│   ├── files.vue         # 资料管理
│   └── inspection.vue    # 资料检查
├── user/                  # 用户管理模块
│   └── profile.vue       # 个人资料
└── system/                # 系统管理模块
    ├── settings.vue      # 系统设置
    └── logs.vue          # 系统日志
```

## 路由映射

### 旧路由 → 新路由
- `/login` → `/auth/login`
- `/dashboard` → `/main/dashboard`
- `/files` → `/main/files`
- `/inspection` → `/main/inspection`
- `/profile` → `/user/profile`
- `/settings` → `/system/settings`
- `/logs` → `/system/logs`

## 已更新的文件

1. **layouts/default.vue**
   - 更新了导航链接
   - 更新了用户菜单中的跳转链接
   - 更新了登录检查逻辑

2. **middleware/auth.ts**
   - 更新了认证中间件中的路由检查

## 分类说明

- **auth/**: 身份认证相关页面
- **main/**: 核心业务功能页面
- **user/**: 用户个人管理相关页面  
- **system/**: 系统管理和配置页面

## 注意事项

- Nuxt 3 使用文件系统路由，页面移动后路由会自动更新
- 所有导航链接和跳转逻辑已更新为新的路径
- 页面功能保持不变，只是重新组织了目录结构
