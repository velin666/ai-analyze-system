import type { DeepSeekResponse, FileAnalysis, FileError } from '~/types'

interface DeepSeekConfig {
  apiKey: string
  apiUrl: string
}

export class DeepSeekService {
  private config: DeepSeekConfig

  constructor(config: DeepSeekConfig) {
    this.config = config
  }

  async analyzeFile(content: string, filename: string, fileType: string): Promise<FileAnalysis> {
    const prompt = this.createAnalysisPrompt(content, filename, fileType)
    
    try {
      const response = await this.callDeepSeekAPI(prompt)
      return this.parseAnalysisResponse(response)
    } catch (error) {
      console.error('DeepSeek analysis error:', error)
      throw new Error('文件分析失败')
    }
  }

  async detectErrors(content: string, filename: string, fileType: string): Promise<FileError[]> {
    const prompt = this.createErrorDetectionPrompt(content, filename, fileType)
    
    try {
      const response = await this.callDeepSeekAPI(prompt)
      return this.parseErrorResponse(response)
    } catch (error) {
      console.error('DeepSeek error detection error:', error)
      return []
    }
  }

  private createAnalysisPrompt(content: string, filename: string, fileType: string): string {
    const language = this.detectLanguage(filename)
    const isCodeFile = language !== null
    
    return `你是一位资深的AI代码分析专家，拥有丰富的软件开发和代码审查经验。请深度分析以下文件：

📁 文件名: ${filename}
🏷️ 文件类型: ${fileType}
💻 检测语言: ${language || '非代码文件'}

📄 文件内容:
\`\`\`${language?.toLowerCase() || ''}
${content.length > 10000 ? content.substring(0, 10000) + '\n...(内容已截断，共' + content.length + '字符)' : content}
\`\`\`

请提供全面深入的分析，返回JSON格式：
{
  "category": "精确分类(code/document/data/config/test/other)",
  "language": "${language || null}",
  "summary": "文件功能和内容的详细描述(150字以内)",
  "complexity": "复杂度评估(low/medium/high/expert)",
  "qualityScore": "代码质量评分(1-10，仅代码文件)",
  "securityRisk": "安全风险等级(low/medium/high)",
  "maintainability": "可维护性评级(excellent/good/fair/poor)",
  "performance": "性能评估(excellent/good/fair/poor/unknown)",
  "suggestions": [
    {
      "type": "优化建议类型(architecture/performance/security/style/documentation)",
      "priority": "优先级(high/medium/low)",
      "description": "具体的改进建议",
      "example": "代码示例或详细说明(可选)"
    }
  ],
  "insights": [
    "深度洞察和分析要点"
  ],
  "technologies": ["检测到的技术栈、框架、库"],
  "patterns": ["识别的设计模式或代码模式"],
  "metrics": {
    "linesOfCode": "总行数",
    "functionalLines": "功能性代码行数",
    "comments": "注释行数",
    "functions": "函数/方法数量",
    "classes": "类数量",
    "complexity": "圈复杂度(仅代码文件)",
    "duplication": "代码重复度评估",
    "testCoverage": "测试覆盖度评估(如果是测试文件)"
  },
  "keywords": ["文件相关的关键词标签"],
  "fileSize": "文件大小评估(small/medium/large)",
  "dependencies": ["检测到的依赖项"],
  "apiUsage": ["使用的API或接口"]
}

${isCodeFile ? `
🎯 代码文件专项分析要求：
- 深入分析架构设计和代码结构
- 识别潜在的性能瓶颈和优化点
- 评估代码的可扩展性和可维护性
- 检查是否遵循最佳实践和设计模式
- 分析异常处理和边界条件处理
- 评估代码安全性和潜在漏洞
` : `
📖 文档文件专项分析要求：
- 分析文档结构和内容组织
- 评估信息的完整性和准确性
- 检查格式规范和可读性
- 识别缺失的关键信息
`}

⚠️ 重要提示：
1. 分析要深入且专业，体现AI专家的洞察力
2. 建议要具体可行，提供实际价值
3. 评分要客观公正，基于行业标准
4. 洞察要有深度，不要停留在表面
5. **严格按照JSON格式返回，不要包含任何其他文字**`
  }

  private createErrorDetectionPrompt(content: string, filename: string, fileType: string): string {
    const language = this.detectLanguage(filename)
    const lines = content.split('\n')
    
    return `🔍 你是一位顶级的AI代码审查专家，具有丰富的软件安全、性能优化和代码质量评估经验。请对以下${language || ''}文件进行深度代码审查：

📁 文件信息:
- 文件名: ${filename}
- 语言: ${language || '未知'}
- 总行数: ${lines.length}

📄 代码内容:
\`\`\`${language?.toLowerCase() || ''}
${lines.map((line, index) => `${String(index + 1).padStart(3, ' ')}│ ${line}`).join('\n').substring(0, 12000)}
${content.length > 12000 ? '\n...(内容已截断)' : ''}
\`\`\`

🎯 深度审查要求:
请进行全方位代码审查，重点关注：

🚨 **安全漏洞检测**:
- SQL注入、XSS、CSRF等安全漏洞
- 输入验证和数据清理问题
- 权限控制和访问控制缺陷
- 敏感信息泄露风险

⚡ **性能问题分析**:
- 算法复杂度过高
- 内存泄漏和资源管理
- 数据库查询优化
- 缓存策略缺失

🐛 **逻辑错误识别**:
- 边界条件处理错误
- 空值和异常处理缺失
- 条件判断逻辑错误
- 并发安全问题

📏 **代码质量评估**:
- 命名规范和可读性
- 代码重复和冗余
- 函数复杂度过高
- 设计模式误用

🔧 **最佳实践检查**:
- 错误处理和日志记录
- 单元测试覆盖度
- 文档和注释完整性
- 代码结构和组织

返回JSON数组格式，每个问题包含详细信息：
[
  {
    "line": "具体行号(必须精确)",
    "column": "列号(可选，但建议提供)",
    "message": "问题的详细描述和影响分析",
    "severity": "严重程度(critical/error/warning/info)",
    "category": "问题类别(security/performance/logic/style/best-practice)",
    "rule": "违反的具体规则或标准",
    "impact": "问题可能造成的影响",
    "suggestion": "具体的修复建议",
    "confidence": "检测置信度(high/medium/low)",
    "cweId": "相关的CWE安全漏洞ID(如果适用)"
  }
]

⚠️ 审查要求:
1. **精确定位**: 提供准确的行号和列号
2. **深度分析**: 不仅指出问题，还要分析根本原因
3. **实用建议**: 提供可操作的修复方案
4. **风险评估**: 评估问题的严重程度和影响范围
5. **零误报**: 确保报告的问题确实存在
6. **专业性**: 体现高级代码审查专家的专业水准

${language ? `
🎯 **${language}特定检查项**:
${this.getLanguageSpecificChecks(language)}
` : ''}

**📋 如果代码质量良好，没有发现问题，请返回空数组 []**
**⚠️ 严格按照JSON数组格式返回，不要包含任何其他文字**`
  }

  private getLanguageSpecificChecks(language: string): string {
    const checks: Record<string, string> = {
      'JavaScript': `
- 使用 === 而非 == 进行比较
- 避免全局变量污染
- 正确处理异步操作和Promise
- 检查事件监听器的内存泄漏
- 验证DOM操作的安全性`,
      
      'TypeScript': `
- 类型定义的准确性和完整性
- 泛型使用的正确性
- 接口和类型的合理设计
- 严格模式下的类型检查
- 装饰器使用的最佳实践`,
      
      'Python': `
- PEP 8编码规范遵守情况
- 异常处理的完整性
- 内存管理和资源释放
- 安全的文件和网络操作
- 性能敏感代码的优化`,
      
      'Java': `
- 异常处理机制的正确性
- 内存管理和GC优化
- 并发安全和线程同步
- 反射和序列化的安全性
- 设计模式的正确应用`,
      
      'C++': `
- 内存管理和指针安全
- 资源获取即初始化(RAII)
- 异常安全保证
- 模板使用的正确性
- 性能关键代码的优化`
    }
    
    return checks[language] || '- 遵循该语言的最佳实践和编码规范'
  }

  private async callDeepSeekAPI(prompt: string): Promise<string> {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as DeepSeekResponse
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from DeepSeek API')
    }

    return data.choices[0].message.content
  }

  private parseAnalysisResponse(response: string): FileAnalysis {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : response
      
      const parsed = JSON.parse(jsonStr)
      
      // Process suggestions to handle both old and new formats
      let suggestions = []
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions.map((suggestion: any) => {
          if (typeof suggestion === 'string') {
            return {
              type: 'style',
              priority: 'medium',
              description: suggestion
            }
          }
          return {
            type: suggestion.type || 'style',
            priority: suggestion.priority || 'medium',
            description: suggestion.description || suggestion,
            example: suggestion.example
          }
        })
      }
      
      return {
        category: parsed.category || 'other',
        language: parsed.language || undefined,
        summary: parsed.summary || '暂无分析结果',
        complexity: parsed.complexity || 'medium',
        qualityScore: parsed.qualityScore ? Number(parsed.qualityScore) : undefined,
        securityRisk: parsed.securityRisk || undefined,
        maintainability: parsed.maintainability || undefined,
        performance: parsed.performance || undefined,
        suggestions,
        insights: Array.isArray(parsed.insights) ? parsed.insights : undefined,
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : undefined,
        patterns: Array.isArray(parsed.patterns) ? parsed.patterns : undefined,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : undefined,
        fileSize: parsed.fileSize || undefined,
        dependencies: Array.isArray(parsed.dependencies) ? parsed.dependencies : undefined,
        apiUsage: Array.isArray(parsed.apiUsage) ? parsed.apiUsage : undefined,
        metrics: parsed.metrics ? {
          linesOfCode: parsed.metrics.linesOfCode ? Number(parsed.metrics.linesOfCode) : undefined,
          functionalLines: parsed.metrics.functionalLines ? Number(parsed.metrics.functionalLines) : undefined,
          functions: parsed.metrics.functions ? Number(parsed.metrics.functions) : undefined,
          classes: parsed.metrics.classes ? Number(parsed.metrics.classes) : undefined,
          comments: parsed.metrics.comments ? Number(parsed.metrics.comments) : undefined,
          complexity: parsed.metrics.complexity ? Number(parsed.metrics.complexity) : undefined,
          duplication: parsed.metrics.duplication || undefined,
          testCoverage: parsed.metrics.testCoverage || undefined
        } : undefined
      }
    } catch (error) {
      console.error('Failed to parse analysis response:', error)
      return {
        category: 'other',
        summary: '分析结果解析失败',
        complexity: 'medium',
        suggestions: []
      }
    }
  }

  private parseErrorResponse(response: string): FileError[] {
    try {
      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      const jsonStr = jsonMatch ? jsonMatch[0] : response
      
      const parsed = JSON.parse(jsonStr)
      
      if (!Array.isArray(parsed)) {
        return []
      }
      
      return parsed.map(error => ({
        line: Number(error.line) || 1,
        column: error.column ? Number(error.column) : undefined,
        message: error.message || '未知错误',
        severity: error.severity || 'info',
        category: error.category || undefined,
        rule: error.rule || undefined,
        impact: error.impact || undefined,
        suggestion: error.suggestion || undefined,
        confidence: error.confidence || undefined,
        cweId: error.cweId || undefined
      }))
    } catch (error) {
      console.error('Failed to parse error response:', error)
      return []
    }
  }

  private detectLanguage(filename: string): string | null {
    const ext = filename.split('.').pop()?.toLowerCase()
    
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'JavaScript React',
      'ts': 'TypeScript',
      'tsx': 'TypeScript React',
      'py': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'cc': 'C++',
      'cxx': 'C++',
      'h': 'C Header',
      'hpp': 'C++ Header',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'html': 'HTML',
      'htm': 'HTML',
      'xml': 'XML',
      'json': 'JSON',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'sql': 'SQL',
      'sh': 'Shell',
      'ps1': 'PowerShell',
      'bat': 'Batch'
    }
    
    return ext ? languageMap[ext] || null : null
  }
}
