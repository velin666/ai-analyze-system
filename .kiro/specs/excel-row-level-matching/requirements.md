# Requirements Document

## Introduction

本系统需要实现Excel表格的智能行级匹配和替换功能。当AI分析返回多个表格时，系统需要：
1. 遍历AI返回的每个表格
2. 通过表头匹配找到对应的原文件表格
3. 对每个表格的数据行，通过多列内容比对找到原文件中的目标行
4. 精确替换目标行的数据，而非整表替换

这是对现有Excel修改功能的重大改进，从"整表替换"升级为"智能行级匹配替换"。

## Glossary

- **AI分析结果**: Coze工作流返回的包含多个表格的Markdown格式内容
- **表格**: AI返回结果中的一个Markdown表格，包含表头和数据行
- **表头匹配**: 将AI表格的第一行（表头）与原Excel文件的表头进行比对的过程
- **行匹配**: 通过比对多列内容，在原Excel文件中找到与AI表格某一行对应的目标行
- **匹配阈值**: 判定两行是否匹配的标准，当至少2个列的内容一致时认为匹配
- **行指针**: 记录当前匹配位置的指针，用于优化后续行的查找
- **原文件**: 用户上传的Excel文件
- **修改后文件**: 经过行级替换后生成的新Excel文件

## Requirements

### Requirement 1

**User Story:** 作为系统，我需要从AI分析结果中提取所有表格，以便逐个处理每个表格的数据。

#### Acceptance Criteria

1. WHEN 系统接收到AI分析结果 THEN 系统SHALL解析Markdown内容提取所有表格
2. WHEN 发现表格标记（包含|符号的连续行） THEN 系统SHALL将其识别为一个完整表格
3. WHEN 提取完成 THEN 系统SHALL返回表格列表，每个表格包含完整的Markdown文本
4. WHEN AI结果中没有表格 THEN 系统SHALL返回空列表
5. WHEN 提取过程出错 THEN 系统SHALL记录错误并继续处理其他表格

### Requirement 2

**User Story:** 作为系统，我需要解析每个表格的表头和数据行，以便进行后续的匹配操作。

#### Acceptance Criteria

1. WHEN 系统处理一个表格 THEN 系统SHALL提取第一行作为表头
2. WHEN 解析表头 THEN 系统SHALL按|分隔符拆分并去除空白字符
3. WHEN 解析数据行 THEN 系统SHALL从第三行开始提取（跳过分隔符行）
4. WHEN 数据行为空或全为空白 THEN 系统SHALL跳过该行
5. WHEN 解析完成 THEN 系统SHALL返回包含表头列表和数据行列表的结构

### Requirement 3

**User Story:** 作为系统，我需要将AI表格的表头与原Excel文件的表头进行匹配，以便确定该表格是否适用于原文件。

#### Acceptance Criteria

1. WHEN 系统获得AI表格的表头 THEN 系统SHALL在原Excel文件中查找匹配的表头行
2. WHEN 比对表头 THEN 系统SHALL检查AI表头的列名是否在原文件表头中存在
3. WHEN 至少50%的AI表头列在原文件中找到匹配 THEN 系统SHALL认为表头匹配成功
4. WHEN 表头匹配失败 THEN 系统SHALL跳过该表格并记录日志
5. WHEN 表头匹配成功 THEN 系统SHALL记录列映射关系并继续处理该表格

### Requirement 4

**User Story:** 作为系统，我需要对AI表格的每一行数据，在原Excel文件中找到对应的目标行，以便进行精确替换。

#### Acceptance Criteria

1. WHEN 系统处理AI表格的一行数据 THEN 系统SHALL从当前行指针位置开始遍历原文件
2. WHEN 比对两行数据 THEN 系统SHALL逐列比较内容是否一致
3. WHEN 至少2个列的内容完全一致 THEN 系统SHALL认为找到目标行
4. WHEN 找到目标行 THEN 系统SHALL更新行指针到当前位置
5. WHEN 遍历完所有行仍未找到匹配 THEN 系统SHALL跳过该AI数据行并记录警告

### Requirement 5

**User Story:** 作为系统，我需要将AI数据行的内容替换到原Excel文件的目标行，以便实现精确的行级修改。

#### Acceptance Criteria

1. WHEN 系统找到目标行 THEN 系统SHALL根据列映射关系替换对应列的数据
2. WHEN 替换数据 THEN 系统SHALL保留原文件中未在AI表格中出现的列
3. WHEN AI数据列在原文件中不存在 THEN 系统SHALL跳过该列
4. WHEN 替换完成 THEN 系统SHALL保持原文件的格式和样式
5. WHEN 所有行处理完成 THEN 系统SHALL保存修改后的文件

### Requirement 6

**User Story:** 作为系统，我需要使用行指针优化查找性能，以便快速处理大型Excel文件。

#### Acceptance Criteria

1. WHEN 系统开始处理表格 THEN 系统SHALL初始化行指针为表头行的下一行
2. WHEN 找到匹配行 THEN 系统SHALL将行指针更新为匹配行的位置
3. WHEN 查找下一行 THEN 系统SHALL从当前行指针位置开始向下搜索
4. WHEN 到达文件末尾仍未找到 THEN 系统SHALL从表头下一行重新开始搜索一次
5. WHEN 两次搜索都未找到 THEN 系统SHALL跳过该行并继续处理下一行

### Requirement 7

**User Story:** 作为系统，我需要处理多个AI表格的顺序处理，以便完整应用所有修改。

#### Acceptance Criteria

1. WHEN 系统获得多个AI表格 THEN 系统SHALL按顺序处理每个表格
2. WHEN 处理一个表格 THEN 系统SHALL完成该表格的所有行匹配和替换后再处理下一个
3. WHEN 某个表格处理失败 THEN 系统SHALL记录错误并继续处理下一个表格
4. WHEN 所有表格处理完成 THEN 系统SHALL生成最终的修改后文件
5. WHEN 没有任何表格成功处理 THEN 系统SHALL返回错误信息

### Requirement 8

**User Story:** 作为系统，我需要提供详细的日志记录，以便用户了解修改过程和排查问题。

#### Acceptance Criteria

1. WHEN 系统开始处理 THEN 系统SHALL记录AI表格总数和原文件信息
2. WHEN 表头匹配失败 THEN 系统SHALL记录该表格的表头内容和失败原因
3. WHEN 行匹配成功 THEN 系统SHALL记录匹配的行号和匹配的列
4. WHEN 行匹配失败 THEN 系统SHALL记录AI数据行内容和失败原因
5. WHEN 处理完成 THEN 系统SHALL记录成功替换的行数和跳过的行数

### Requirement 9

**User Story:** 作为系统，我需要处理各种边界情况和异常，以便提供稳定可靠的服务。

#### Acceptance Criteria

1. WHEN AI表格的列数与原文件不一致 THEN 系统SHALL仅处理匹配的列
2. WHEN 数据行包含空值或特殊字符 THEN 系统SHALL正确处理并比对
3. WHEN 原文件包含合并单元格 THEN 系统SHALL正确读取和写入数据
4. WHEN 原文件包含公式 THEN 系统SHALL保留公式或替换为计算值
5. WHEN 任何步骤发生异常 THEN 系统SHALL记录详细错误信息并返回用户友好提示
