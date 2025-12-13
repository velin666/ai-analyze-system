# Requirements Document

## Introduction

本系统需要实现基于"序号"列的Excel表格简化匹配和替换功能。与之前的多列匹配方案不同，本方案通过"序号"列直接定位目标行，实现更简单、更高效的数据替换。

核心改进：
1. 通过"序号"列直接匹配，无需多列比对
2. 简化匹配逻辑，提高处理速度
3. 减少误匹配的可能性
4. 保持对多表格的支持

## Glossary

- **序号列**: Excel表格中表头为"序号"的列，用于唯一标识每一行数据
- **AI分析结果**: Coze工作流返回的包含多个表格的Markdown格式内容
- **表格**: AI返回结果中的一个Markdown表格，包含表头和数据行
- **表头定位**: 在Excel文件中查找包含"序号"列的表头行
- **序号匹配**: 通过序号值在原Excel文件中找到对应行的过程
- **原文件**: 用户上传的Excel文件（如：KHG51-SD01 烘烤炉电气件清单.xlsx）
- **修改后文件**: 经过序号匹配替换后生成的新Excel文件

## Requirements

### Requirement 1

**User Story:** 作为系统，我需要从AI分析结果中提取所有表格，以便逐个处理每个表格的数据。

#### Acceptance Criteria

1. WHEN 系统接收到AI分析结果 THEN 系统SHALL解析Markdown内容提取所有表格
2. WHEN 发现表格标记（包含|符号的连续行） THEN 系统SHALL将其识别为一个完整表格
3. WHEN 提取完成 THEN 系统SHALL返回表格列表，每个表格包含表头和数据行
4. WHEN AI结果中没有表格 THEN 系统SHALL返回空列表
5. WHEN 提取过程出错 THEN 系统SHALL记录错误并继续处理其他表格

### Requirement 2

**User Story:** 作为系统，我需要在Excel文件中定位"序号"列，以便使用该列进行行匹配。

#### Acceptance Criteria

1. WHEN 系统打开Excel文件 THEN 系统SHALL遍历前20行查找包含"序号"的表头行
2. WHEN 找到"序号"列 THEN 系统SHALL记录该列的列索引和表头所在行号
3. WHEN 表头行中存在多个"序号"列 THEN 系统SHALL使用第一个找到的"序号"列
4. WHEN 前20行中未找到"序号"列 THEN 系统SHALL返回错误并停止处理
5. WHEN 找到表头行 THEN 系统SHALL解析所有列名并创建列名到列索引的映射

### Requirement 3

**User Story:** 作为系统，我需要验证AI表格是否包含"序号"列，以便确定该表格适用于序号匹配。

#### Acceptance Criteria

1. WHEN 系统解析AI表格 THEN 系统SHALL检查表头中是否存在"序号"列
2. WHEN AI表格包含"序号"列 THEN 系统SHALL记录该列在AI表格中的索引位置
3. WHEN AI表格不包含"序号"列 THEN 系统SHALL跳过该表格并记录警告
4. WHEN AI表格的"序号"列为空 THEN 系统SHALL跳过该表格
5. WHEN 验证成功 THEN 系统SHALL继续处理该表格的数据行

### Requirement 4

**User Story:** 作为系统，我需要通过序号值直接定位Excel中的目标行，以便进行精确替换。

#### Acceptance Criteria

1. WHEN 系统处理AI表格的一行数据 THEN 系统SHALL提取该行的序号值
2. WHEN 序号值为空或无效 THEN 系统SHALL跳过该行并记录警告
3. WHEN 系统获得序号值 THEN 系统SHALL在Excel的序号列中查找匹配的行
4. WHEN 找到匹配的序号 THEN 系统SHALL返回该行的行号
5. WHEN 未找到匹配的序号 THEN 系统SHALL跳过该行并记录警告

### Requirement 5

**User Story:** 作为系统，我需要将AI数据行的内容替换到Excel文件的目标行，以便实现精确的数据修改。

#### Acceptance Criteria

1. WHEN 系统找到目标行 THEN 系统SHALL根据列名匹配替换对应列的数据
2. WHEN AI表格的列名在Excel中存在 THEN 系统SHALL替换该列的值
3. WHEN AI表格的列名在Excel中不存在 THEN 系统SHALL跳过该列
4. WHEN Excel中的列在AI表格中不存在 THEN 系统SHALL保留该列的原始值
5. WHEN 替换完成 THEN 系统SHALL保持原文件的格式和样式

### Requirement 6

**User Story:** 作为系统，我需要按顺序处理多个AI表格，以便完整应用所有修改。

#### Acceptance Criteria

1. WHEN 系统获得多个AI表格 THEN 系统SHALL按顺序处理每个表格
2. WHEN 处理一个表格 THEN 系统SHALL完成该表格的所有行替换后再处理下一个
3. WHEN 某个表格处理失败 THEN 系统SHALL记录错误并继续处理下一个表格
4. WHEN 所有表格处理完成 THEN 系统SHALL生成最终的修改后文件
5. WHEN 没有任何表格成功处理 THEN 系统SHALL返回错误信息

### Requirement 7

**User Story:** 作为系统，我需要提供详细的日志记录，以便用户了解修改过程和排查问题。

#### Acceptance Criteria

1. WHEN 系统开始处理 THEN 系统SHALL记录AI表格总数和原文件信息
2. WHEN 找到序号列 THEN 系统SHALL记录序号列的位置和表头行号
3. WHEN 序号匹配成功 THEN 系统SHALL记录AI序号值和Excel行号
4. WHEN 序号匹配失败 THEN 系统SHALL记录AI序号值和失败原因
5. WHEN 处理完成 THEN 系统SHALL记录成功替换的行数和跳过的行数

### Requirement 8

**User Story:** 作为系统，我需要处理各种边界情况和异常，以便提供稳定可靠的服务。

#### Acceptance Criteria

1. WHEN 序号值包含前导零或空格 THEN 系统SHALL正确处理并匹配
2. WHEN 序号值为数字或字符串 THEN 系统SHALL统一转换为字符串进行比对
3. WHEN Excel中存在重复的序号 THEN 系统SHALL使用第一个匹配的行
4. WHEN 数据行包含空值或特殊字符 THEN 系统SHALL正确处理
5. WHEN 任何步骤发生异常 THEN 系统SHALL记录详细错误信息并返回用户友好提示

### Requirement 9

**User Story:** 作为系统，我需要生成处理统计信息，以便用户了解处理结果。

#### Acceptance Criteria

1. WHEN 处理完成 THEN 系统SHALL返回总表格数和成功处理的表格数
2. WHEN 处理完成 THEN 系统SHALL返回总行数、成功匹配行数和跳过行数
3. WHEN 处理完成 THEN 系统SHALL返回处理耗时
4. WHEN 有警告信息 THEN 系统SHALL在结果中包含警告列表
5. WHEN 处理失败 THEN 系统SHALL返回详细的错误信息
