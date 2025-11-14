# AI 文件分析系统

基于 Nuxt3 + TypeScript 构建的智能文件管理和分析系统，集成 DeepSeek AI 实现文件分类、错误检测和在线预览功能。

## ✨ 功能特性

### 📁 文件管理
- **多格式支持**: 支持代码文件、文档、图片、音视频等多种文件格式
- **拖拽上传**: 直观的拖拽上传界面，支持批量上传
- **分类筛选**: 智能文件分类和筛选功能
- **在线预览**: 支持代码、文档、图片的在线预览

### 🤖 AI 智能分析
- **自动分类**: 基于 DeepSeek AI 的智能文件分类
- **代码分析**: 
  - 复杂度评估 (简单/中等/复杂)
  - 代码指标统计 (行数、函数数、类数等)
  - 技术栈识别
- **错误检测**:
  - 语法错误检查
  - 代码规范检查
  - 潜在问题识别
  - 安全风险提示
- **改进建议**: 提供具体可操作的优化建议

### 🎨 现代化界面
- **响应式设计**: 支持桌面端和移动端
- **美观UI**: 基于 TailwindCSS 的现代化界面
- **实时反馈**: 上传进度、分析状态实时展示
- **交互友好**: 直观的操作流程和状态提示

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- DeepSeek API Key

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-project
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，添加你的 DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 📦 生产部署

### 构建应用
```bash
npm run build
```

### PM2 管理

1. **安装 PM2**
```bash
npm install -g pm2
```

2. **启动应用**
```bash
npm run pm2:start
```

3. **管理命令**
```bash
# 重启应用
npm run pm2:restart

# 停止应用
npm run pm2:stop

# 删除应用
npm run pm2:delete

# 查看状态
pm2 status

# 查看日志
pm2 logs file-analysis-system
```

## 🔧 项目结构

```
ai-project/
├── assets/              # 静态资源
│   └── css/            # 样式文件
├── components/          # Vue 组件
│   ├── FileUpload.vue  # 文件上传组件
│   ├── FileItem.vue    # 文件列表项组件
│   └── FilePreview.vue # 文件预览组件
├── pages/              # 页面
│   └── index.vue       # 主页
├── server/             # 服务端代码
│   ├── api/            # API 路由
│   └── utils/          # 工具函数
├── types/              # TypeScript 类型定义
├── utils/              # 客户端工具函数
├── uploads/            # 文件上传目录
└── logs/              # PM2 日志目录
```

## 🛠 API 接口

### 文件管理
- `POST /api/upload` - 文件上传
- `GET /api/files` - 获取文件列表
- `GET /api/files/[id]/content` - 获取文件内容
- `GET /api/files/[id]/download` - 下载文件
- `DELETE /api/files/[id]` - 删除单个文件
- `DELETE /api/files` - 清除所有文件

### AI 分析
- `POST /api/analyze/[id]` - 分析指定文件

## ⚙ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 必填 |
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `MAX_FILE_SIZE` | 最大文件大小 | `10485760` (10MB) |
| `UPLOAD_DIR` | 上传目录 | `./uploads` |

### DeepSeek API 配置

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册账号
2. 创建 API Key
3. 将 API Key 配置到环境变量中

## 📝 支持的文件格式

### 代码文件
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Vue (`.vue`)
- Python (`.py`)
- Java (`.java`)
- C/C++ (`.c`, `.cpp`, `.h`, `.hpp`)
- CSS/SCSS (`.css`, `.scss`)
- HTML (`.html`)
- 其他常见代码格式

### 文档文件
- Markdown (`.md`)
- 纯文本 (`.txt`)
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

### 其他格式
- 图片 (`.png`, `.jpg`, `.gif`, `.svg`)
- 压缩包 (`.zip`, `.rar`, `.7z`)
- 配置文件 (`.json`, `.yaml`, `.xml`)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

如果您在使用过程中遇到问题或有建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 提交 Pull Request

## 🎯 TODO

- [ ] 添加用户认证系统
- [ ] 支持更多 AI 模型
- [ ] 实现文件版本控制
- [ ] 添加批量分析功能
- [ ] 集成代码格式化工具
- [ ] 支持团队协作功能
