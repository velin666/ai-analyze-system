# ElMessage 提示更新说明

## 更新日期

2024-12-03

## 更新内容

### 替换所有 alert 为 ElMessage

已将 `pages/main/document-analysis.vue` 中所有 `alert` 调用改为使用 Element Plus 的 `ElMessage` 组件。

### 修改详情

#### 1. 导入 ElMessage

```typescript
import { ElMessage } from 'element-plus'
```

#### 2. 修改 showToast 函数

**之前**:

```typescript
const showToast = (
  message: string,
  type: 'success' | 'error' | 'warning' = 'error'
) => {
  if (type === 'error') {
    alert('错误: ' + message)
  } else if (type === 'warning') {
    alert('警告: ' + message)
  } else {
    alert('成功: ' + message)
  }
}
```

**现在**:

```typescript
const showToast = (
  message: string,
  type: 'success' | 'error' | 'warning' = 'error'
) => {
  ElMessage({
    message: message,
    type: type,
    duration: 3000,
    showClose: true,
  })
}
```

#### 3. 替换直接的 alert 调用

**分析失败提示**:

```typescript
// 之前: alert(error.message || '分析失败，请重试')
// 现在:
ElMessage.error(error.message || '分析失败，请重试')
```

**拆分失败提示**:

```typescript
// 之前: alert(error.message || '拆分失败，请重试')
// 现在:
ElMessage.error(error.message || '拆分失败，请重试')
```

### ElMessage 配置参数

所有 ElMessage 使用以下配置:

- `message`: 提示消息内容
- `type`: 消息类型 (`success` | `error` | `warning` | `info`)
- `duration`: 显示时长，默认 3000ms
- `showClose`: 显示关闭按钮，默认 true

### 优势

1. **更好的用户体验**:

   - 非阻塞式提示，不会中断用户操作
   - 自动消失，无需手动关闭
   - 视觉效果更美观

2. **统一的 UI 风格**:

   - 与 Element Plus 组件库风格一致
   - 支持多种消息类型（成功、错误、警告等）
   - 可自定义位置和样式

3. **更灵活的配置**:
   - 支持 HTML 内容
   - 可设置显示时长
   - 可添加关闭按钮
   - 支持自定义图标

### 依赖确认

项目已安装并配置 Element Plus:

- `nuxt.config.ts` 中已引入 `@element-plus/nuxt` 模块
- CSS 已导入: `element-plus/dist/index.css`
- 无需额外安装

### 测试建议

建议测试以下场景:

1. 文件分析失败时的错误提示
2. 文档拆分失败时的错误提示
3. 获取拆分文件 URL 失败的警告提示
4. 批量导出成功的成功提示
5. 各类 showToast 调用（成功、错误、警告）
