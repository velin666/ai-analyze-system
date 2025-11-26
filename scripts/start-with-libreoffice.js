#!/usr/bin/env node
/**
 * 开发模式启动脚本
 * 自动启动 LibreOffice 服务（非 Windows 平台），然后启动 Nuxt dev
 */

import { spawn } from 'child_process'
import os from 'os'
import net from 'net'

const platform = os.platform()
const LIBREOFFICE_PORT = 2002

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * 检查端口是否被占用
 */
async function isPortInUse(port, host = '127.0.0.1') {
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
 * 启动 LibreOffice 服务
 */
async function startLibreOffice() {
  if (platform === 'win32') {
    log('ℹ Windows 平台，跳过 LibreOffice 启动（使用 win32com）', 'yellow')
    return
  }

  log('检查 LibreOffice 服务状态...', 'cyan')

  const isRunning = await isPortInUse(LIBREOFFICE_PORT)
  if (isRunning) {
    log(`✓ LibreOffice 服务已在运行 (端口 ${LIBREOFFICE_PORT})`, 'green')
    return
  }

  log('启动 LibreOffice 服务...', 'cyan')

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
  await new Promise(resolve => setTimeout(resolve, 3000))

  const isStarted = await isPortInUse(LIBREOFFICE_PORT)
  if (isStarted) {
    log('✓ LibreOffice 服务已启动', 'green')
  } else {
    log('⚠ LibreOffice 服务可能启动失败，但继续运行开发服务器', 'yellow')
  }
}

/**
 * 启动 Nuxt 开发服务器
 */
function startNuxtDev() {
  log('\n启动 Nuxt 开发服务器...', 'cyan')

  const nuxtProcess = spawn('npx', ['nuxt', 'dev', '--host', '0.0.0.0'], {
    stdio: 'inherit',
    shell: true,
  })

  nuxtProcess.on('error', error => {
    console.error('启动 Nuxt 失败:', error)
    process.exit(1)
  })

  // 处理退出信号
  process.on('SIGINT', () => {
    log('\n正在关闭...', 'yellow')
    nuxtProcess.kill('SIGINT')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    nuxtProcess.kill('SIGTERM')
    process.exit(0)
  })
}

/**
 * 主函数
 */
async function main() {
  log('\n' + '='.repeat(60), 'cyan')
  log('  开发环境启动 (带 LibreOffice 支持)', 'cyan')
  log('='.repeat(60) + '\n', 'cyan')

  try {
    // 1. 启动 LibreOffice (非 Windows 平台)
    await startLibreOffice()

    // 2. 启动 Nuxt
    startNuxtDev()
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

main()
