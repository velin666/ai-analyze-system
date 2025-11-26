const os = require('os')
const platform = os.platform()

// LibreOffice 配置（仅在非 Windows 平台启动）
const libreofficeApp =
  platform !== 'win32'
    ? {
        name: 'libreoffice-headless',
        script: 'libreoffice',
        args: '--headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard',
        interpreter: 'none', // 直接执行命令，不使用 Node.js
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        restart_delay: 3000,
        error_file: './logs/libreoffice-err.log',
        out_file: './logs/libreoffice-out.log',
        log_file: './logs/libreoffice-combined.log',
        time: true,
        env: {
          DISPLAY: ':0', // 某些 Linux 发行版可能需要
        },
      }
    : null

// 应用配置
const apps = [
  {
    name: 'file-analysis-system',
    script: './.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5500,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
      LIBREOFFICE_HOST: '127.0.0.1',
      LIBREOFFICE_PORT: 2002,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5500,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
  },
]

// 在非 Windows 平台添加 LibreOffice 服务
if (libreofficeApp) {
  apps.push(libreofficeApp)
}

module.exports = { apps }
