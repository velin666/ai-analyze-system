import type { FileCategory } from '~/types'

export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  
  if (mimeType.includes('text/') || 
      mimeType.includes('application/json') ||
      mimeType.includes('application/xml')) {
    return 'document'
  }
  
  const codeTypes = [
    'application/javascript',
    'application/typescript',
    'text/css',
    'text/html',
    'application/x-python-code',
    'text/x-python',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-php'
  ]
  
  if (codeTypes.some(type => mimeType.includes(type))) {
    return 'code'
  }
  
  const archiveTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar'
  ]
  
  if (archiveTypes.some(type => mimeType.includes(type))) {
    return 'archive'
  }
  
  const dataTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf'
  ]
  
  if (dataTypes.some(type => mimeType.includes(type))) {
    return 'data'
  }
  
  return 'other'
}

export function getLanguageFromFilename(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'html': 'html',
    'htm': 'html',
    'xml': 'xml',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sql': 'sql',
    'sh': 'bash',
    'ps1': 'powershell',
    'bat': 'batch'
  }
  
  return ext ? languageMap[ext] : undefined
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isCodeFile(filename: string): boolean {
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'vue', 'py', 'java', 'c', 'cpp', 'cc', 
    'cxx', 'h', 'hpp', 'css', 'scss', 'sass', 'html', 'htm', 'xml',
    'json', 'yaml', 'yml', 'php', 'rb', 'go', 'rs', 'sql', 'sh'
  ]
  
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? codeExtensions.includes(ext) : false
}

export function generateFileId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
