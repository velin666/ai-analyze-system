# Implementation Plan

- [x] 1. 创建新的Python处理文件modify_excel_by_sequence.py


  - 创建独立的处理文件，不影响现有的modify_excel.py
  - 实现基于序号列的简化匹配逻辑
  - _Requirements: All_



- [ ] 1.1 实现TableExtractor类
  - 编写extract_all_tables方法从Markdown提取所有表格
  - 编写parse_table方法解析单个表格为TableData结构
  - 解析表头和数据行，将数据行转换为字典格式（列名到值）
  - 检测表格是否包含"序号"列

  - _Requirements: 1.1, 1.2, 1.3, 3.1_

- [ ] 1.2 编写Property测试：表格提取完整性
  - **Property 1: Table extraction completeness and structure**
  - **Validates: Requirements 1.1, 1.2, 1.3**
  - 使用hypothesis生成包含不同数量表格的Markdown文本

  - 验证提取的表格数量和结构正确性

- [ ] 1.3 实现SequenceColumnLocator类
  - 编写locate_sequence_column方法在Excel中定位"序号"列
  - 在前20行中查找包含"序号"的表头行

  - 编写parse_headers方法解析表头并创建列名到列索引的映射
  - 处理多个"序号"列的情况（使用第一个）
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 1.4 编写Property测试：序号列定位
  - **Property 2: Sequence column location**
  - **Validates: Requirements 2.1, 2.2, 2.5**

  - 使用hypothesis生成不同位置的序号列
  - 验证定位功能的正确性

- [x] 1.5 实现SequenceMatcher类

  - 编写normalize_sequence静态方法标准化序号值
  - 处理数字、字符串、前导零、空格等情况
  - 编写_build_sequence_map方法构建序号到行号的映射表
  - 编写find_row_by_sequence方法通过序号查找行号
  - _Requirements: 4.1, 4.3, 4.4, 8.1, 8.2_


- [ ] 1.6 编写Property测试：序号标准化
  - **Property 5: Sequence value normalization**
  - **Validates: Requirements 8.1, 8.2**
  - 使用hypothesis生成各种格式的序号值
  - 验证标准化的一致性和幂等性

- [ ] 1.7 编写Property测试：序号匹配
  - **Property 6: Sequence-based row matching**

  - **Validates: Requirements 4.3, 4.4**
  - 使用hypothesis生成序号映射表

  - 验证查找功能的正确性

- [ ] 1.8 实现DataReplacer类
  - 编写replace_row方法替换指定行的数据
  - 根据列名匹配替换对应列
  - 跳过不存在的列
  - 保留未在AI表格中出现的列
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 1.9 编写Property测试：列级数据替换

  - **Property 8: Column-based data replacement**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  - 验证只替换匹配的列，其他列保持不变

- [ ] 1.10 实现数据模型类
  - 定义TableData数据类（包含has_sequence和sequence_col_index字段）
  - 定义SequenceColumnInfo数据类
  - 定义ProcessingStatistics数据类
  - 定义ProcessingResult数据类
  - 定义ProcessingConfig配置类

  - _Requirements: All_

- [ ] 2. 实现ExcelSequenceProcessor主处理器
  - 编写__init__方法初始化处理器
  - 编写process方法协调整个处理流程

  - 编写process_single_table方法处理单个表格
  - 实现表格顺序处理逻辑
  - 实现表格处理隔离（一个失败不影响其他）
  - 收集和返回处理统计信息
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 9.1, 9.2_

- [ ] 2.1 编写Property测试：顺序处理和隔离
  - **Property 9: Sequential table processing**
  - **Property 10: Table processing isolation**
  - **Validates: Requirements 6.1, 6.2, 6.3**
  - 验证表格按顺序处理且失败隔离



- [ ] 2.2 编写Property测试：统计一致性
  - **Property 11: Statistics consistency**
  - **Validates: Requirements 9.1, 9.2**
  - 验证统计数字的一致性（总数=成功+跳过）

- [x] 3. 实现modify_excel_by_sequence主函数

  - 创建主函数作为API入口
  - 调用ExcelSequenceProcessor执行处理
  - 处理文件保存和命名

  - 返回符合API接口的结果结构
  - _Requirements: All_

- [ ] 4. 增强错误处理
  - 实现ErrorHandler类统一错误处理

  - 处理SequenceColumnNotFoundError（未找到序号列）
  - 处理文件操作错误
  - 实现错误恢复机制（继续处理其他项）
  - 返回用户友好的错误信息
  - _Requirements: 2.4, 8.5, 9.5_

- [x] 4.1 编写Property测试：错误处理

  - **Property 12: Error information completeness**
  - **Validates: Requirements 8.5, 9.5**
  - 验证异常情况下的错误信息完整性

- [ ] 5. 实现日志记录
  - 添加处理开始/结束日志
  - 添加序号列定位日志
  - 添加序号匹配成功/失败日志
  - 添加表格跳过警告日志
  - 添加最终统计信息日志
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. 创建或更新TypeScript API接口

  - 创建新的API端点或更新现有端点
  - 调用modify_excel_by_sequence.py
  - 处理请求参数和响应
  - 返回包含统计信息的响应
  - _Requirements: All_


- [ ] 7. 集成测试
  - 使用实际的Excel文件（KHG51-SD01 烘烤炉电气件清单.xlsx）测试
  - 使用res.md或res2.md作为AI结果测试
  - 验证序号列定位功能
  - 验证序号匹配和替换功能
  - 验证统计信息准确性

  - 手动检查输出文件的正确性
  - _Requirements: All_



- [ ] 7.1 编写单元测试：边界情况
  - 测试空表格处理
  - 测试未找到序号列的情况

  - 测试AI表格不包含序号列的情况
  - 测试序号未找到的情况
  - 测试重复序号的处理
  - 测试特殊字符和空值处理
  - _Requirements: 1.4, 2.4, 3.3, 3.4, 4.2, 8.3, 8.4_

- [ ] 8. 性能验证
  - 测试序号映射表的构建性能
  - 测试O(1)查找性能
  - 对比与之前多列匹配方案的性能差异
  - 验证大文件处理性能
  - _Requirements: All_

- [ ] 9. 文档更新
  - 更新API文档说明新的处理方式
  - 添加配置参数说明
  - 添加使用示例和对比说明
  - 说明与之前方案的区别和适用场景
  - _Requirements: All_

- [ ] 10. 最终检查点
  - 确保所有测试通过
  - 确认输出文件正确
  - 验证错误处理和日志记录
  - 检查代码质量和注释
  - 询问用户是否有问题
