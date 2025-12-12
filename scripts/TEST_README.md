# Excel修改功能测试说明

## 测试功能

在 `document-analysis.vue` 页面顶部添加了测试区域，包含两个测试按钮：

1. **测试 res.md (简单表格)** - 使用 `server/api/res.md` 中的简单表格数据测试
2. **测试 res2.md (复杂表格)** - 使用 `server/api/res2.md` 中的复杂表格数据测试

## 测试流程

1. 访问文档分析页面
2. 在页面顶部看到黄色的测试区域
3. 点击任一测试按钮
4. 系统会自动：
   - 下载线上测试文件 (http://47.99.61.90:5500/api/files/download/mj1b8ta94cj6fc9m1yl)
   - 读取对应的测试数据 (res.md 或 res2.md)
   - 调用Excel修改API生成修改后的文件
   - 显示测试结果
5. 如果测试成功，可以点击"下载测试文件"按钮下载生成的Excel

## 测试文件说明

### 添加的测试文件
- `server/api/res.get.ts` - 读取 res.md 内容的API
- `server/api/res2.get.ts` - 读取 res2.md 内容的API
- `server/api/files/download-and-save.post.ts` - 下载远程文件到服务器的API

### 修改的文件
- `pages/main/document-analysis.vue` - 添加了测试按钮和测试逻辑

所有测试相关的代码都用特殊标记包围：
- `<!-- TEST_SECTION_START -->` ... `<!-- TEST_SECTION_END -->` (HTML部分)
- `// TEST_CODE_START` ... `// TEST_CODE_END` (JavaScript部分)
- `// TEST_FILE` (整个文件是测试文件)

## 清理测试代码

测试完成后，运行清理脚本删除所有测试代码：

```bash
node scripts/cleanup-test-code.js
```

此脚本会：
1. 删除所有标记为 `TEST_FILE` 的文件
2. 删除代码中所有 `TEST_SECTION_START` 到 `TEST_SECTION_END` 之间的内容
3. 删除代码中所有 `TEST_CODE_START` 到 `TEST_CODE_END` 之间的内容

## 注意事项

1. 测试使用的是线上文件，需要网络连接
2. 测试会在 `uploads/` 目录下创建临时文件
3. 测试完成后记得运行清理脚本
4. 清理后请检查代码是否正常运行
