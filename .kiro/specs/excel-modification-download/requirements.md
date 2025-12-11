# Requirements Document

## Introduction

本系统需要实现一个Excel表格智能修改功能。用户上传Excel文件并提供修改需求（WorkRequirements），通过AI分析后返回修改建议。系统需要根据AI返回的修改结果，自动生成一个修改后的Excel文件供用户下载。

核心挑战在于：
1. AI返回的表格数据列顺序可能与原文件不一致
2. 原文件的表头位置和内容不固定（可能从第4行开始，也可能其他行）
3. 需要智能匹配表头，将AI返回的修改内容准确替换到原文件对应位置

## Glossary

- **Excel文件**: 用户上传的.xlsx或.xls格式的电子表格文件
- **WorkRequirements**: 用户输入的修改需求提示词，描述需要对Excel进行的修改操作
- **AI分析结果**: Coze工作流返回的包含修改后表格数据的结构化内容
- **表头**: Excel表格中定义列名称的行，位置不固定
- **修改后文件**: 系统根据AI分析结果生成的新Excel文件，文件名为"原文件名(修改后).xlsx"
- **openpyxl**: Python库，用于读写Excel文件
- **列匹配**: 通过表头名称将AI返回的列数据与原文件列进行对应的过程

## Requirements

### Requirement 1

**User Story:** 作为用户，我希望上传Excel文件并提供修改需求后，能够下载到修改后的Excel文件，以便快速完成表格数据的批量修改。

#### Acceptance Criteria

1. WHEN 用户在文档分析页面上传Excel文件并填写WorkRequirements THEN 系统SHALL显示Excel提示词输入区域
2. WHEN 用户点击"开始AI分析"按钮 THEN 系统SHALL调用Coze工作流并传递文件URL和WorkRequirements
3. WHEN AI分析完成 THEN 系统SHALL在分析结果区域显示AI返回的内容
4. WHEN AI分析成功返回修改建议 THEN 系统SHALL提供"下载修改后的Excel"按钮
5. WHEN 用户点击下载按钮 THEN 系统SHALL生成修改后的Excel文件并触发浏览器下载

### Requirement 2

**User Story:** 作为系统，我需要解析AI返回的表格数据，以便提取出修改后的列和行信息。

#### Acceptance Criteria

1. WHEN 系统接收到AI分析结果 THEN 系统SHALL从结果中提取表格数据结构
2. WHEN AI返回的内容包含Markdown表格格式 THEN 系统SHALL解析Markdown表格为结构化数据
3. WHEN AI返回的内容包含JSON格式表格 THEN 系统SHALL解析JSON为结构化数据
4. WHEN 解析完成 THEN 系统SHALL生成包含表头和数据行的数据结构
5. WHEN 解析失败 THEN 系统SHALL返回明确的错误信息

### Requirement 3

**User Story:** 作为系统，我需要读取原始Excel文件并定位表头位置，以便准确识别数据区域。

#### Acceptance Criteria

1. WHEN 系统读取Excel文件 THEN 系统SHALL使用openpyxl库打开文件
2. WHEN 扫描工作表 THEN 系统SHALL从第1行开始逐行检查以定位表头
3. WHEN 某一行包含多个非空单元格 THEN 系统SHALL将该行识别为潜在表头行
4. WHEN 识别到表头行 THEN 系统SHALL记录表头行号和各列的表头名称
5. WHEN 无法识别表头 THEN 系统SHALL返回错误信息

### Requirement 4

**User Story:** 作为系统，我需要将AI返回的列与原文件的列进行智能匹配，以便正确替换数据。

#### Acceptance Criteria

1. WHEN 系统获得AI返回的表头列表和原文件表头列表 THEN 系统SHALL对每个AI列名在原文件中查找匹配
2. WHEN 列名完全匹配 THEN 系统SHALL建立该列的映射关系
3. WHEN 列名不完全匹配但相似度高 THEN 系统SHALL使用模糊匹配建立映射关系
4. WHEN 某列在原文件中不存在 THEN 系统SHALL跳过该列并记录警告
5. WHEN 匹配完成 THEN 系统SHALL生成列索引映射表

### Requirement 5

**User Story:** 作为系统，我需要将AI返回的修改数据写入原Excel文件的对应位置，以便生成修改后的文件。

#### Acceptance Criteria

1. WHEN 系统开始写入数据 THEN 系统SHALL保留原文件的表头行及之前的所有内容
2. WHEN 写入数据行 THEN 系统SHALL根据列映射表将AI数据写入对应列
3. WHEN 某列在AI结果中不存在 THEN 系统SHALL保留原文件该列的数据
4. WHEN 写入完成 THEN 系统SHALL保存文件到临时目录
5. WHEN 保存成功 THEN 系统SHALL生成文件名为"原文件名(修改后).xlsx"

### Requirement 6

**User Story:** 作为系统，我需要提供API接口供前端调用，以便触发Excel修改和下载流程。

#### Acceptance Criteria

1. WHEN 前端发送修改请求 THEN 系统SHALL接收原文件路径和AI分析结果
2. WHEN 系统处理修改请求 THEN 系统SHALL调用Python脚本执行Excel修改
3. WHEN Python脚本执行成功 THEN 系统SHALL返回修改后文件的下载URL
4. WHEN Python脚本执行失败 THEN 系统SHALL返回错误信息和状态码
5. WHEN 前端接收到下载URL THEN 系统SHALL触发浏览器下载文件

### Requirement 7

**User Story:** 作为系统，我需要处理各种异常情况，以便提供稳定可靠的服务。

#### Acceptance Criteria

1. WHEN 原文件不存在或无法读取 THEN 系统SHALL返回文件错误信息
2. WHEN AI返回的数据格式无法解析 THEN 系统SHALL返回解析错误信息
3. WHEN 表头匹配失败 THEN 系统SHALL返回匹配错误信息
4. WHEN 文件写入失败 THEN 系统SHALL返回写入错误信息
5. WHEN 任何步骤发生异常 THEN 系统SHALL记录详细日志并返回用户友好的错误提示
