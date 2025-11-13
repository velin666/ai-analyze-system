@echo off
echo 正在启动 AI 文件分析系统...
echo.

REM 检查 Node.js 是否安装
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

REM 检查是否存在 node_modules
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查环境变量文件
if not exist ".env" (
    echo 警告: 未找到 .env 文件
    echo 请复制 .env.example 为 .env 并配置您的 DeepSeek API Key
    echo.
    copy .env.example .env
    echo 已创建 .env 文件，请编辑并添加您的 API Key
    pause
)

echo 正在启动开发服务器...
echo 访问 http://localhost:3000 查看应用
echo 按 Ctrl+C 停止服务器
echo.

npm run dev
