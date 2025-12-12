# Implementation Plan

## 测试代码管理说明

所有测试相关的代码和文件都集中在`tests/excel-modification/`目录下，包括：
- Python测试文件：`test_*.py`
- TypeScript测试文件：`*.test.ts`
- 测试辅助函数和工具
- 测试配置文件

这样设计的好处：
1. 方便在测试完成后一次性删除所有测试代码
2. 测试代码与生产代码分离，不会污染主代码库
3. 便于管理和维护测试资源

测试使用的Excel文件：
- 线上测试文件：http://47.99.61.90:5500/api/files/download/mj1b8ta94cj6fc9m1yl
- AI返回的Markdown数据：从`server/api/res.md`和`server/api/res2.md`中提取

- [ ] 1. 创建Python Excel修改脚本核心功能
  - 实现Markdown表格解析、Excel读写、列匹配等核心逻辑
  - _Requirements: 2.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 1.1 实现Markdown表格提取和识别函数



  - 创建`extract_all_markdown_tables()`函数，提取AI返回内容中的所有Markdown表格
  - 创建`find_target_table()`函数，从多个表格中识别目标表格（修正后的表格）
  - 识别策略：优先查找包含"修正后"关键词的表格，否则使用最后一个表格
  - 创建`parse_markdown_table()`函数，解析单个Markdown表格
  - 提取表头行和数据行，返回TableData结构
  - 处理表格分隔符、空格、特殊字符
  - _Requirements: 2.2, 2.4_

- [ ]* 1.2 编写Markdown解析的属性测试
  - **Property 4: Markdown表格解析正确性**
  - **Validates: Requirements 2.2**
  - 使用Hypothesis生成随机Markdown表格，验证解析正确性
  - 测试代码放在`tests/excel-modification/test_markdown_parser.py`

- [ ]* 1.3 编写解析错误处理的属性测试
  - **Property 5: 解析错误处理**
  - **Validates: Requirements 2.5**
  - 测试无效Markdown输入时返回错误而不是异常
  - 测试代码放在`tests/excel-modification/test_error_handling.py`

- [x] 1.4 实现Excel表头识别函数


  - 创建`find_header_row()`函数，从第1行开始扫描工作表
  - 识别包含多个非空单元格的行作为表头
  - 返回表头行号和表头字典（列索引->列名）
  - _Requirements: 3.3, 3.4_

- [ ]* 1.5 编写表头识别的属性测试
  - **Property 6: 表头识别正确性**
  - **Validates: Requirements 3.3, 3.4**
  - 测试各种表头位置和格式的Excel文件
  - 测试代码放在`tests/excel-modification/test_header_detection.py`

- [x] 1.6 实现列匹配函数


  - 创建`match_columns()`函数，实现精确匹配和模糊匹配
  - 使用difflib.SequenceMatcher进行模糊匹配（相似度>0.8）
  - 返回列映射字典（AI列索引->原文件列索引）
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ]* 1.7 编写列匹配的属性测试
  - **Property 7: 列完全匹配映射**
  - **Validates: Requirements 4.2**
  - 测试完全相同的列名能正确建立映射
  - 测试代码放在`tests/excel-modification/test_column_matching.py`

- [ ]* 1.8 编写模糊匹配的属性测试
  - **Property 8: 列模糊匹配映射**
  - **Validates: Requirements 4.3**
  - 测试相似列名能通过模糊匹配建立映射
  - 测试代码放在`tests/excel-modification/test_column_matching.py`

- [ ]* 1.9 编写列映射表生成的属性测试
  - **Property 9: 列映射表生成**
  - **Validates: Requirements 4.1, 4.5**
  - 测试任意表头对都能生成映射表
  - 测试代码放在`tests/excel-modification/test_column_matching.py`

- [x] 1.10 实现数据写入函数


  - 创建`write_modified_data()`函数，根据列映射写入数据
  - 保留表头行之前的所有内容
  - 保留未修改列的原始数据
  - 处理空单元格和特殊字符
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 1.11 编写数据写入的属性测试
  - **Property 10: 表头前内容保留不变性**
  - **Validates: Requirements 5.1**
  - 测试写入后表头前内容不变
  - 测试代码放在`tests/excel-modification/test_data_writing.py`

- [ ]* 1.12 编写数据写入位置正确性的属性测试
  - **Property 11: 数据写入位置正确性**
  - **Validates: Requirements 5.2**
  - 测试数据写入到正确的列位置
  - 测试代码放在`tests/excel-modification/test_data_writing.py`

- [ ]* 1.13 编写未修改列保留的属性测试
  - **Property 12: 未修改列数据保留不变性**
  - **Validates: Requirements 5.3**
  - 测试未修改的列数据保持不变
  - 测试代码放在`tests/excel-modification/test_data_writing.py`

- [x] 1.14 实现文件保存和命名函数


  - 创建文件保存逻辑，保存到`uploads/modified/`目录
  - 实现文件命名规则："原文件名(修改后).xlsx"
  - 处理文件名冲突和特殊字符
  - _Requirements: 5.4, 5.5_

- [ ]* 1.15 编写文件命名的属性测试
  - **Property 14: 文件命名规则正确性**
  - **Validates: Requirements 5.5**
  - 测试各种原文件名生成正确的新文件名
  - 测试代码放在`tests/excel-modification/test_file_naming.py`

- [x] 1.16 实现主函数modify_excel()


  - 整合所有子函数，实现完整的Excel修改流程
  - 添加错误处理和日志记录
  - 返回成功/失败状态和错误信息
  - _Requirements: 2.1, 3.3, 4.1, 5.1, 5.4, 7.5_

- [ ]* 1.17 编写主函数的集成测试
  - 测试完整的Excel修改流程
  - 使用线上测试文件和res.md中的Markdown数据
  - 验证生成的文件内容正确
  - 测试代码放在`tests/excel-modification/test_integration.py`

- [ ] 2. 创建Node.js API接口
  - 实现Excel修改API，调用Python脚本并返回下载URL
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2.1 创建/api/files/modify-excel.post.ts


  - 定义API接口，接收originalFilePath、aiResult、originalFileName
  - 验证输入参数（文件路径存在性、aiResult非空）
  - 构造Python脚本调用命令
  - _Requirements: 6.1_

- [x] 2.2 实现Python脚本调用逻辑

  - 使用child_process.spawn调用Python脚本
  - 传递参数：原文件路径、AI结果、输出路径
  - 捕获stdout和stderr输出
  - 处理脚本执行超时（设置30秒超时）
  - _Requirements: 6.2_

- [ ]* 2.3 编写Python脚本调用的属性测试
  - **Property 15: Python脚本调用成功返回**
  - **Validates: Requirements 6.2, 6.3**
  - 测试有效输入时返回下载URL
  - 测试代码放在`tests/excel-modification/api.test.ts`

- [ ]* 2.4 编写Python脚本失败处理的属性测试
  - **Property 16: Python脚本调用失败处理**
  - **Validates: Requirements 6.4**
  - 测试无效输入时返回错误信息
  - 测试代码放在`tests/excel-modification/api.test.ts`

- [x] 2.5 实现API响应处理

  - 解析Python脚本的输出（JSON格式）
  - 成功时返回downloadUrl和fileName
  - 失败时返回error信息和适当的HTTP状态码
  - _Requirements: 6.3, 6.4_

- [x] 2.6 添加错误处理和日志记录



  - 捕获所有异常并返回用户友好的错误信息
  - 使用logger记录详细的错误信息
  - 记录文件路径、AI结果长度、错误堆栈等
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 2.7 编写全局异常处理的属性测试
  - **Property 17: 全局异常处理和日志记录**
  - **Validates: Requirements 7.5**
  - 测试任意异常都能被捕获并记录
  - 测试代码放在`tests/excel-modification/api.test.ts`

- [ ] 3. 更新前端页面添加下载功能
  - 在document-analysis.vue中添加下载修改后Excel的按钮和逻辑
  - _Requirements: 1.4, 1.5_

- [x] 3.1 在分析结果中添加下载按钮


  - 当AI分析成功且返回Markdown表格时，显示"下载修改后的Excel"按钮
  - 按钮样式与现有UI保持一致
  - 添加loading状态和禁用逻辑
  - _Requirements: 1.4_

- [x] 3.2 实现downloadModifiedExcel()方法

  - 提取AI返回的content（Markdown表格）
  - 获取原文件的服务器路径（从uploadResponse中）
  - 调用/api/files/modify-excel接口
  - 处理loading状态和错误提示
  - _Requirements: 1.5_

- [x] 3.3 实现文件下载逻辑

  - 接收API返回的downloadUrl
  - 创建隐藏的<a>标签触发下载
  - 设置download属性为修改后的文件名
  - 显示成功提示信息
  - _Requirements: 1.5, 6.5_

- [x] 3.4 添加错误处理和用户提示


  - 处理API调用失败的情况
  - 显示友好的错误提示（使用message组件）
  - 处理网络超时和服务器错误
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 3.5 编写前端下载功能的单元测试
  - 测试下载按钮的显示条件
  - 测试API调用参数构造
  - 测试错误处理逻辑
  - 测试代码放在`tests/excel-modification/frontend.test.ts`

- [ ] 4. 端到端测试和文档
  - 进行完整流程测试，编写使用文档
  - _Requirements: 所有需求_

- [ ] 4.1 准备测试数据
  - 使用线上测试文件：http://47.99.61.90:5500/api/files/download/mj1b8ta94cj6fc9m1yl
  - 准备对应的AI返回Markdown表格数据（从res.md中提取）
  - 所有测试代码集中在`tests/excel-modification/`目录，方便后续删除
  - _Requirements: 所有需求_

- [ ] 4.2 执行端到端测试
  - 测试完整流程：上传Excel -> 填写提示词 -> AI分析 -> 下载修改后文件
  - 验证修改后文件的内容正确性
  - 测试各种边界情况和错误场景
  - _Requirements: 所有需求_

- [ ] 4.3 性能测试
  - 测试大文件（1000+行）的处理时间
  - 测试并发请求的处理能力
  - 优化性能瓶颈
  - _Requirements: 5.4_

- [ ] 4.4 编写用户文档
  - 编写功能使用说明
  - 说明支持的Excel格式和限制
  - 提供示例和常见问题解答
  - _Requirements: 所有需求_

- [ ] 5. Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户
