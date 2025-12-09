# Excel修正功能快速开始

## 首次使用前的准备

### 1. 安装Python依赖

```powershell
# Windows PowerShell
pip install -r requirements.txt
```

如果pip未安装，先安装pip：
```powershell
python -m ensurepip --upgrade
```

### 2. 验证依赖安装

```powershell
python -c "import openpyxl; import fuzzywuzzy; print('依赖安装成功')"
```

如果显示"依赖安装成功"，表示准备工作完成。

## 快速测试

### 1. 启动开发服务器

```powershell
pnpm dev
```

### 2. 访问页面

打开浏览器访问：`http://localhost:3000/main/document-analysis`

### 3. 测试流程

1. **上传Excel文件**
   - 点击"选择文件"或拖拽文件到上传区域
   - 支持.xlsx和.xls格式

2. **填写AI提示词**
   - 在"Excel提示词"输入框填写需求
   - 示例：`帮我把品牌从"西门子"改为"三菱"`

3. **开始分析**
   - 点击"开始AI分析"
   - 等待AI处理完成

4. **生成修正文件**
   - 如果分析结果包含修正数据，会显示"生成修正Excel"按钮
   - 点击按钮即可自动生成并下载修正后的文件

## 示例数据格式

### AI返回的修正数据示例

```json
[
  {
    "序号": "1",
    "ERP识别码": "WGJ-DQ-CPCZ-0000",
    "品牌": "MITSUBISHI（三菱）",
    "名称": "HMI 面板(LINE触摸屏，10.2寸)",
    "型号尺寸": "需查询三菱同规格型号替换此处"
  },
  {
    "序号": "8",
    "名称": "交换机",
    "型号尺寸": "工业五口百兆交换机（不含电源促销款）",
    "单位": "只"
  }
]
```

系统会自动：
1. 提取这个JSON数组
2. 根据"序号"字段匹配Excel中的行
3. 更新对应的字段值
4. 生成新的Excel文件

## 故障排除

### 问题1：Python命令找不到

**错误信息：**
```
'python' 不是内部或外部命令
```

**解决方案：**
1. 确认Python已安装：[https://www.python.org/downloads/](https://www.python.org/downloads/)
2. 添加Python到系统环境变量
3. 重启终端

### 问题2：pip install失败

**错误信息：**
```
ERROR: Could not install packages
```

**解决方案：**
```powershell
# 使用国内镜像源
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 问题3：无法识别表头

**可能原因：** Excel表头位置不标准

**解决方案：**
1. 确保Excel第一行或前几行包含明确的表头
2. 表头字段名使用常见名称（序号、名称、品牌等）
3. 避免合并单元格作为表头

## 开发调试

### 查看Python脚本输出

修改`server/api/files/generate-modified-excel.post.ts`：

```typescript
// 在调用Python脚本后添加日志
console.log('Python stdout:', scriptResult)
```

### 测试Python脚本

可以直接测试Python脚本：

```powershell
python server/api/files/modify_excel.py `
  --input-file "test.xlsx" `
  --output-file "test_modified.xlsx" `
  --modification-data '[{"序号":"1","品牌":"三菱"}]'
```

## 下一步

- 📖 阅读完整文档：`docs/EXCEL_MODIFICATION_FEATURE.md`
- 🎯 查看设计文档：`.qoder/quests/excel-analysis-and-modification.md`
- 🔧 调整配置：修改`requirements.txt`中的依赖版本

## 需要帮助？

如有问题，请检查：
1. Python是否正确安装
2. 依赖包是否安装成功
3. Excel文件格式是否标准
4. AI返回的数据是否包含JSON数组
