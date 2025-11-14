export interface FileInfo {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  category: FileCategory
  uploadedAt: Date
  path: string
  preview?: string
  analysis?: FileAnalysis
  errors?: FileError[]
}

export interface FileAnalysis {
  category: FileCategory
  language?: string
  summary: string
  complexity: 'low' | 'medium' | 'high' | 'expert'
  qualityScore?: number
  securityRisk?: 'low' | 'medium' | 'high'
  maintainability?: 'excellent' | 'good' | 'fair' | 'poor'
  performance?: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  suggestions: AnalysisSuggestion[]
  insights?: string[]
  technologies?: string[]
  patterns?: string[]
  keywords?: string[]
  fileSize?: 'small' | 'medium' | 'large'
  dependencies?: string[]
  apiUsage?: string[]
  metrics?: {
    linesOfCode?: number
    functionalLines?: number
    functions?: number
    classes?: number
    comments?: number
    complexity?: number
    duplication?: string
    testCoverage?: string
  }
}

export interface AnalysisSuggestion {
  type: 'architecture' | 'performance' | 'security' | 'style' | 'documentation'
  priority: 'high' | 'medium' | 'low'
  description: string
  example?: string
}

export interface FileError {
  line: number
  column?: number
  message: string
  severity: 'critical' | 'error' | 'warning' | 'info'
  category?: 'security' | 'performance' | 'logic' | 'style' | 'best-practice'
  rule?: string
  impact?: string
  suggestion?: string
  confidence?: 'high' | 'medium' | 'low'
  cweId?: string
}

export type FileCategory = 
  | 'document'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'data'
  | 'config'
  | 'test'
  | 'archive'
  | 'other'

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AnalysisRequest {
  content: string
  filename: string
  type: string
}

export interface LogEntry {
  id: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: string
  service?: string
  userId?: string
  requestId?: string
  duration?: number
  ip?: string
  userAgent?: string
  method?: string
  url?: string
  statusCode?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}

export interface LogFilter {
  level?: string[]
  service?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
  offset?: number
}

export interface LogResponse {
  logs: LogEntry[]
  total: number
  hasMore: boolean
}
