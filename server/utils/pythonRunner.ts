/**
 * Python脚本调用工具
 * 用于执行Python脚本并处理结果
 */

import { spawn } from 'child_process'
import * as path from 'path'

export interface PythonScriptOptions {
  scriptPath: string
  args: string[]
  timeout?: number // 超时时间(毫秒)
  cwd?: string
}

export interface PythonScriptResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number | null
  error?: string
}

/**
 * 运行Python脚本
 */
export async function runPythonScript(options: PythonScriptOptions): Promise<PythonScriptResult> {
  const {
    scriptPath,
    args,
    timeout = 60000, // 默认60秒超时
    cwd
  } = options

  return new Promise((resolve) => {
    // 获取Python命令
    const pythonCmd = process.env.PYTHON_PATH || 'python3'
    
    // 构建命令参数
    const spawnArgs = [scriptPath, ...args]
    
    // 启动子进程
    const child = spawn(pythonCmd, spawnArgs, {
      cwd: cwd || process.cwd(),
      env: process.env,
      shell: false
    })

    let stdout = ''
    let stderr = ''
    let timeoutHandle: NodeJS.Timeout | null = null
    let isTimedOut = false

    // 设置超时
    if (timeout > 0) {
      timeoutHandle = setTimeout(() => {
        isTimedOut = true
        child.kill('SIGTERM')
        
        // 如果3秒后还没结束,强制杀死
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL')
          }
        }, 3000)
      }, timeout)
    }

    // 收集stdout
    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    // 收集stderr
    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    // 进程结束
    child.on('close', (code) => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }

      if (isTimedOut) {
        resolve({
          success: false,
          stdout,
          stderr,
          exitCode: null,
          error: 'TIMEOUT'
        })
      } else {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code
        })
      }
    })

    // 进程错误
    child.on('error', (err) => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }

      resolve({
        success: false,
        stdout,
        stderr,
        exitCode: null,
        error: err.message
      })
    })
  })
}

/**
 * 解析Python脚本的JSON输出
 */
export function parsePythonJsonOutput<T = any>(result: PythonScriptResult): T | null {
  if (!result.success) {
    console.error('Python脚本执行失败:', result.stderr || result.error)
    return null
  }

  try {
    // 尝试从stdout解析JSON
    const json = JSON.parse(result.stdout.trim())
    return json as T
  } catch (error) {
    console.error('解析Python输出失败:', error)
    console.error('原始输出:', result.stdout)
    return null
  }
}

/**
 * 运行Excel修正脚本
 */
export async function runExcelModificationScript(
  inputFile: string,
  outputFile: string,
  modificationData: any[],
  logFile?: string
): Promise<{
  success: boolean
  result?: any
  error?: string
}> {
  try {
    // 脚本路径
    const scriptPath = path.join(process.cwd(), 'server', 'api', 'files', 'modify_excel.py')
    
    // 构建参数
    const args = [
      '--input-file', inputFile,
      '--output-file', outputFile,
      '--modification-data', JSON.stringify(modificationData)
    ]
    
    if (logFile) {
      args.push('--log-file', logFile)
    }

    // 执行脚本
    const result = await runPythonScript({
      scriptPath,
      args,
      timeout: 60000 // 60秒超时
    })

    // 解析输出
    if (result.success) {
      const output = parsePythonJsonOutput(result)
      if (output && output.success) {
        return {
          success: true,
          result: output
        }
      } else {
        return {
          success: false,
          error: output?.message || '未知错误'
        }
      }
    } else {
      // 尝试从stderr解析错误
      try {
        const errorOutput = JSON.parse(result.stderr.trim())
        return {
          success: false,
          error: errorOutput.message || result.error || '脚本执行失败'
        }
      } catch {
        return {
          success: false,
          error: result.error || result.stderr || '脚本执行失败'
        }
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '调用Python脚本失败'
    }
  }
}
