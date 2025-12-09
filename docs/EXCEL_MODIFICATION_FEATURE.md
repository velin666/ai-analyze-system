# Excel修正功能使用说明

## 功能概述

本功能可以根据AI分析结果自动修正Excel文件中的错误数据，并生成一个带"(修改后)"后缀的新文件供下载。

## 使用流程

### 1. 上传Excel文件

在"AI文档分析"页面上传一个Excel文件(.xlsx或.xls格式)。

### 2. 填写AI提示词

在"Excel提示词"输入框中填写您的需求，例如：
```
帮我把控制器、触摸屏、模块从西门子替换成三菱同规格型号。原来其他型号不用变。
```

### 3. 开始分析

点击"开始AI分析"按钮，等待AI分析完成。

### 4. 生成修正文件

如果AI分析结果包含修正数据，会自动显示"生成修正Excel"按钮。

点击该按钮，系统会：
- 提取AI返回的修正数据
- 智能匹配Excel中的表头和数据行
- 自动更新需要修正的单元格
- 生成带"(修改后)"后缀的新Excel文件
- 自动开始下载

### 5. 下载修正文件

修正完成后，按钮会变为"下载修正文件"，可随时再次下载。

## 技术特性

### 智能表头识别

- 自动扫描前50行查找表头
- 支持不固定位置的表头
- 支持多种字段名别名（如：序号/编号/No）

### 灵活数据匹配

**匹配策略1：唯一标识匹配**
- 优先使用"序号"字段匹配
- 其次使用"ERP识别码"字段匹配

**匹配策略2：组合字段模糊匹配**
- 当无唯一标识时，使用多字段组合匹配
- 支持模糊匹配（80%以上相似度）
- 匹配度阈值：70%

### 智能更新规则

| 规则类型 | 处理方式 |
|---------|---------|
| 精确替换 | 值不同时直接覆盖 |
| 补充填充 | 原字段为空时填入新值 |
| 保持原值 | 修正数据为空时不更新 |

## 文件结构

```
项目根目录/
├── server/
│   ├── api/
│   │   └── files/
│   │       ├── modify_excel.py                    # Python处理脚本
│   │       ├── generate-modified-excel.post.ts    # 生成接口
│   │       └── download-modified/
│   │           └── [id].get.ts                    # 下载接口
│   └── utils/
│       ├── excelModificationExtractor.ts          # 数据提取工具
│       └── pythonRunner.ts                        # Python调用工具
├── pages/
│   └── main/
│       └── document-analysis.vue                  # 前端页面
└── uploads/
    └── modified/                                  # 修正文件存储目录
```

## 依赖安装

### Python依赖

首次使用需安装Python依赖：

```bash
pip install -r requirements.txt
```

依赖包括：
- openpyxl >= 3.0.0 (Excel文件读写)
- fuzzywuzzy >= 0.18.0 (字符串模糊匹配)
- python-Levenshtein >= 0.12.0 (加速模糊匹配)

### 验证安装

```bash
python -c "import openpyxl; print(openpyxl.__version__)"
```

## 配置说明

### 环境变量 (可选)

在`.env`文件中可配置：

```
# Python可执行文件路径 (默认: python3)
PYTHON_PATH=python3

# Excel脚本路径 (默认: ./server/api/files/modify_excel.py)
EXCEL_SCRIPT_PATH=./server/api/files/modify_excel.py

# 修正文件存储目录 (默认: ./uploads/modified)
MODIFIED_FILES_DIR=./uploads/modified
```

## 常见问题

### 1. 提示"缺少必要的Python库"

**解决方案：** 安装Python依赖
```bash
pip install openpyxl fuzzywuzzy python-Levenshtein
```

### 2. 提示"无法识别Excel表头"

**可能原因：**
- Excel格式不标准
- 表头位置过于靠后（超过50行）

**解决方案：**
- 确保Excel有明确的表头行
- 表头字段名使用常见名称（序号、名称、品牌等）

### 3. 部分数据未匹配成功

**可能原因：**
- 修正数据与原表数据差异过大
- 缺少唯一标识字段

**解决方案：**
- 确保修正数据包含"序号"或"ERP识别码"字段
- 检查修正数据的字段名是否与Excel一致

### 4. 处理超时

**可能原因：**
- Excel文件过大（超过5000行）
- Python环境响应慢

**解决方案：**
- 拆分大文件后分别处理
- 优化Python环境

## 性能指标

| 文件大小 | 预期处理时间 |
|---------|-------------|
| 100行以内 | < 3秒 |
| 1000行以内 | < 10秒 |
| 5000行以内 | < 30秒 |

## 安全说明

- 修正后的文件保存在`uploads/modified/`目录
- 文件下载链接24小时后自动失效
- 系统会自动清理过期文件
- 仅支持.xlsx和.xls格式，防止恶意文件上传

## 更新日志

### v1.0.0 (2025-12-09)

- ✨ 实现Excel智能修正核心功能
- ✨ 支持表头智能识别
- ✨ 支持多种匹配策略
- ✨ 自动生成修正文件
- ✨ 前端UI集成完成

## 技术支持

如遇问题，请查看：
- 系统日志：`logs/`目录
- Python脚本日志：控制台输出
- 浏览器控制台：前端错误信息

或联系开发团队获取支持。
