# Element Plus 到 Ant Design Vue 迁移说明

## 已完成的更改

### 1. 依赖包更新

- ✅ 已卸载 `@element-plus/nuxt` 和 `element-plus`
- ⚠️ 需要手动安装 `ant-design-vue`

### 2. 配置文件更新

- ✅ `nuxt.config.ts`

  - 移除了 `@element-plus/nuxt` 模块
  - 移除了 `elementPlus` 配置
  - 更新 CSS 导入为 `ant-design-vue/dist/reset.css`
  - 添加了 Vite SSR 配置 `noExternal: ['ant-design-vue']`

- ✅ `app.vue`
  - 移除了 Element Plus 暗黑主题 CSS 导入

### 3. 组件代码更新

- ✅ `pages/main/document-analysis.vue`
  - 将 `ElMessage` 替换为 `message` (Ant Design Vue)
  - 更新了 `showToast` 函数
  - 更新了错误提示调用

### 4. 插件配置

- ✅ 创建了 `plugins/antd.ts` 用于全局注册 Ant Design Vue

## 需要手动完成的步骤

### 1. 安装依赖

```bash
pnpm add ant-design-vue
```

### 2. 清理缓存并重启开发服务器

```bash
# 清理 .nuxt 缓存
rm -rf .nuxt

# 重新安装依赖（如果需要）
pnpm install

# 启动开发服务器
pnpm dev
```

### 3. 验证功能

测试以下功能是否正常工作：

- ✅ 消息提示（message）
- ⚠️ 如果项目中还使用了其他 Element Plus 组件，需要手动替换

## Ant Design Vue 常用组件对照

| Element Plus   | Ant Design Vue  | 说明       |
| -------------- | --------------- | ---------- |
| `ElMessage`    | `message`       | 消息提示   |
| `ElButton`     | `a-button`      | 按钮       |
| `ElInput`      | `a-input`       | 输入框     |
| `ElDialog`     | `a-modal`       | 对话框     |
| `ElTable`      | `a-table`       | 表格       |
| `ElForm`       | `a-form`        | 表单       |
| `ElSelect`     | `a-select`      | 选择器     |
| `ElDatePicker` | `a-date-picker` | 日期选择器 |

## 文档链接

- [Ant Design Vue 官方文档](https://antdv.com/)
- [Nuxt 3 文档](https://nuxt.com/)

## 注意事项

1. Ant Design Vue 使用 `a-` 前缀作为组件名
2. API 使用方式可能与 Element Plus 不同，需要查阅文档
3. 主题配置方式不同，需要单独配置
4. dayjs 问题已通过 Vite 优化配置解决
