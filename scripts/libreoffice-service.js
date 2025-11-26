#!/usr/bin/env node
/**
 * LibreOffice 服务管理脚本
 * 支持启动、停止、重启和查看状态
 */

import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import net from 'net'

const execAsync = promisify(exec)
const platform = os.platform()
const LIBREOFFICE_PORT = 2002
const LIBREOFFICE_HOST = '127.0.0.1'

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

/**
 * 检查端口是否被占用
 */
async function isPortInUse(port, host) {
  return new Promise(resolve => {
    const socket = new net.Socket()

    socket.setTimeout(1000)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })

    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })

    socket.once('error', () => {
      resolve(false)
    })

    socket.connect(port, host)
  })
}

/**
 * 获取 LibreOffice 进程 ID
 */
async function getLibreOfficeProcesses() {
  try {
    if (platform === 'win32') {
      // Windows
      const { stdout } = await execAsync(
        'tasklist /FI "IMAGENAME eq soffice.exe" /FO CSV /NH'
      )
      const lines = stdout
        .trim()
        .split('\n')
        .filter(line => line.includes('soffice.exe'))
      return lines
        .map(line => {
          const match = line.match(/"(\d+)"/)
          return match ? parseInt(match[1]) : null
        })
        .filter(pid => pid !== null)
    } else {
      // Linux/macOS
      const { stdout } = await execAsync('pgrep -f "soffice.*2002"')
      return stdout
        .trim()
        .split('\n')
        .map(pid => parseInt(pid))
        .filter(pid => !isNaN(pid))
    }
  } catch (error) {
    return []
  }
}

/**
 * 停止 LibreOffice 服务
 */
async function stopLibreOffice() {
  logInfo('正在停止 LibreOffice 服务...')

  const pids = await getLibreOfficeProcesses()

  if (pids.length === 0) {
    logWarning('LibreOffice 服务未运行')
    return
  }

  try {
    if (platform === 'win32') {
      // Windows
      for (const pid of pids) {
        await execAsync(`taskkill /F /PID ${pid}`)
      }
    } else {
      // Linux/macOS
      await execAsync(`pkill -f "soffice.*2002"`)
    }

    // 等待进程完全停止
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 验证是否已停止
    const remainingPids = await getLibreOfficeProcesses()
    if (remainingPids.length === 0) {
      logSuccess('LibreOffice 服务已停止')
    } else {
      logWarning('部分进程可能仍在运行')
    }
  } catch (error) {
    logError(`停止服务时出错: ${error.message}`)
    process.exit(1)
  }
}

/**
 * 启动 LibreOffice 服务
 */
async function startLibreOffice() {
  logInfo('正在启动 LibreOffice 服务...')

  // 检查平台
  if (platform === 'win32') {
    logWarning('Windows 平台推荐使用 win32com，无需启动 LibreOffice 服务')
    logInfo('如果您确实需要 LibreOffice，请手动安装并运行启动脚本')
    return
  }

  // 检查是否已经在运行
  const isRunning = await isPortInUse(LIBREOFFICE_PORT, LIBREOFFICE_HOST)
  if (isRunning) {
    logWarning(`LibreOffice 服务已在运行 (端口 ${LIBREOFFICE_PORT})`)
    return
  }

  // 检查 LibreOffice 是否安装
  try {
    await execAsync('which libreoffice')
  } catch (error) {
    logError('LibreOffice 未安装')
    logInfo('安装方法:')
    if (platform === 'linux') {
      log('  Ubuntu/Debian: sudo apt-get install libreoffice python3-uno')
      log('  CentOS/RHEL:   sudo yum install libreoffice libreoffice-pyuno')
    } else if (platform === 'darwin') {
      log('  macOS: brew install libreoffice')
    }
    process.exit(1)
  }

  // 启动 LibreOffice
  const args = [
    '--headless',
    '--accept=socket,host=127.0.0.1,port=2002;urp;',
    '--nofirststartwizard',
  ]

  const child = spawn('libreoffice', args, {
    detached: true,
    stdio: 'ignore',
  })

  child.unref()

  // 等待服务启动
  logInfo('等待服务启动...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // 验证服务是否启动成功
  const isStarted = await isPortInUse(LIBREOFFICE_PORT, LIBREOFFICE_HOST)
  if (isStarted) {
    logSuccess(
      `LibreOffice 服务已启动 (${LIBREOFFICE_HOST}:${LIBREOFFICE_PORT})`
    )
    logInfo(`进程 ID: ${child.pid}`)
  } else {
    logError('LibreOffice 服务启动失败')
    logInfo('请检查日志: ./logs/libreoffice-*.log')
    process.exit(1)
  }
}

/**
 * 查看服务状态
 */
async function checkStatus() {
  log('\n' + '='.repeat(60), 'blue')
  log('  LibreOffice 服务状态', 'blue')
  log('='.repeat(60) + '\n', 'blue')

  // 平台信息
  log(
    `平台: ${
      platform === 'win32'
        ? 'Windows'
        : platform === 'darwin'
        ? 'macOS'
        : 'Linux'
    }`
  )
  log(
    `推荐方案: ${
      platform === 'win32'
        ? 'win32com (需要 Microsoft Word)'
        : 'LibreOffice + pyuno'
    }`
  )
  log('')

  // 检查端口
  const isRunning = await isPortInUse(LIBREOFFICE_PORT, LIBREOFFICE_HOST)
  if (isRunning) {
    logSuccess(`服务正在运行 (${LIBREOFFICE_HOST}:${LIBREOFFICE_PORT})`)
  } else {
    logError(`服务未运行 (端口 ${LIBREOFFICE_PORT} 未监听)`)
  }

  // 检查进程
  const pids = await getLibreOfficeProcesses()
  if (pids.length > 0) {
    log(`\n进程列表:`)
    pids.forEach(pid => {
      log(`  - PID: ${pid}`)
    })
  } else {
    log(`\n未找到 LibreOffice 进程`)
  }

  // 检查 LibreOffice 安装
  log('')
  try {
    if (platform === 'win32') {
      await execAsync('where libreoffice')
      logSuccess('LibreOffice 已安装')
    } else {
      const { stdout } = await execAsync('which libreoffice')
      logSuccess(`LibreOffice 已安装: ${stdout.trim()}`)
    }
  } catch (error) {
    logError('LibreOffice 未安装')
  }

  // 检查 pyuno
  if (platform !== 'win32') {
    log('')
    try {
      await execAsync('python3 -c "import uno; print(uno.__file__)"')
      logSuccess('python3-uno 已安装')
    } catch (error) {
      logError('python3-uno 未安装')
      logInfo('安装: sudo apt-get install python3-uno')
    }
  }

  log('\n' + '='.repeat(60) + '\n', 'blue')
}

/**
 * 主函数
 */
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'start':
      await startLibreOffice()
      break

    case 'stop':
      await stopLibreOffice()
      break

    case 'restart':
      await stopLibreOffice()
      await new Promise(resolve => setTimeout(resolve, 1000))
      await startLibreOffice()
      break

    case 'status':
      await checkStatus()
      break

    default:
      log('LibreOffice 服务管理工具\n', 'cyan')
      log('用法:')
      log('  npm run libreoffice:start   - 启动服务')
      log('  npm run libreoffice:stop    - 停止服务')
      log('  npm run libreoffice:restart - 重启服务')
      log('  npm run libreoffice:status  - 查看状态')
      log('')
      log('或直接使用:')
      log('  node scripts/libreoffice-service.js [start|stop|restart|status]')
      process.exit(1)
  }
}

main().catch(error => {
  logError(`执行失败: ${error.message}`)
  process.exit(1)
})
