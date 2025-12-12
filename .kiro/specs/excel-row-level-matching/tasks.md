# Implementation Plan

- [x] 1. 重构modify_excel.py核心逻辑






  - 将现有的整表替换逻辑改为行级匹配替换逻辑
  - 实现多表格遍历处理
  - 实现表头匹配验证机制
  - 实现行级内容比对和匹配
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_

- [x] 1.1 实现TableExtractor类



  - 编写extract_all_tables方法提取所有Markdown表格
  - 编写parse_table方法解析单个表格为TableData结构
  - 处理表格边界识别和分隔
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_


- [x] 1.2 实现HeaderMatcher类


  - 编写match_header方法进行表头匹配
  - 实现50%匹配阈值逻辑
  - 编写create_column_mapping方法生成列映射
  - 支持精确匹配、包含匹配和模糊匹配
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [x] 1.3 实现RowMatcher类


  - 编写find_matching_row方法查找匹配行
  - 实现compare_rows方法比对两行数据
  - 实现2列匹配阈值逻辑
  - 实现行指针机制优化查找性能
  - 实现回环搜索功能

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.4_

- [x] 1.4 实现DataReplacer类


  - 编写replace_row方法替换行数据
  - 根据列映射仅替换匹配的列
  - 保留未映射列的原始数据
  - 处理空值和特殊字符
  - _Requirements: 5.1, 5.2, 5.3, 9.2_


- [x] 1.5 实现ExcelProcessor主处理器


  - 编写process方法协调整个处理流程
  - 编写process_single_table方法处理单个表格
  - 实现表格顺序处理逻辑
  - 实现表格处理隔离（一个失败不影响其他）
  - 收集和返回处理统计信息
  - _Requirements: 7.1, 7.2, 7.3, 7.4_


- [x] 1.6 实现数据模型类



  - 定义TableData数据类
  - 定义HeaderMatchResult数据类
  - 定义RowMatchResult数据类
  - 定义ProcessingStatistics数据类
  - 定义ProcessingResult数据类
  - 定义ProcessingConfig配置类
  - _Requirements: All_

- [x] 2. 更新modify_excel函数





  - 重构主函数使用新的ExcelProcessor
  - 更新错误处理逻辑
  - 更新返回结果结构包含统计信息
  - 保持与现有API接口的兼容性
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. 增强日志记录





  - 添加表格处理开始/结束日志
  - 添加表头匹配成功/失败日志
  - 添加行匹配成功/失败详细日志
  - 添加跳过表格/行的警告日志
  - 添加最终统计信息日志
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. 实现错误处理机制






  - 实现ErrorHandler类统一错误处理
  - 分类处理不同类型的错误
  - 实现错误恢复机制（继续处理其他项）
  - 返回用户友好的错误信息
  - _Requirements: 7.3, 9.5, 1.5_

- [x] 5. 更新TypeScript API接口



  - 更新modify-excel.post.ts接收和返回统计信息
  - 更新响应类型定义包含statistics字段
  - 保持向后兼容性
  - _Requirements: 6.1, 6.3_

- [x] 6. 集成测试





  - 使用res.md，res2.md和实际Excel文件测试完整流程
  - 验证多表格处理功能
  - 验证表头匹配功能
  - 验证行级匹配和替换功能
  - 验证统计信息准确性
  - 手动检查输出文件的正确性
  - _Requirements: All_

- [x] 7. 性能优化验证




  - 测试行指针机制的性能提升
  - 测试回环搜索功能
  - 验证大文件处理性能
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. 边界情况测试





  - 测试空表格处理
  - 测试表头不匹配的情况
  - 测试行完全不匹配的情况
  - 测试特殊字符和空值处理
  - 测试列数不一致的情况
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 9. 文档更新





  - 更新API文档说明新的返回结构
  - 添加配置参数说明
  - 添加使用示例
  - _Requirements: All_

- [x] 10. 清理和优化






  - 删除旧的整表替换逻辑代码
  - 优化代码结构和可读性
  - 添加必要的代码注释
  - 确保代码符合Python编码规范
  - _Requirements: All_
