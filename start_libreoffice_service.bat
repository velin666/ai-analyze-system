@echo off
REM Windows 下启动 LibreOffice 服务的辅助脚本（如果需要）

echo ========================================
echo LibreOffice 服务启动脚本
echo ========================================
echo.

REM 检查 LibreOffice 是否安装
where libreoffice >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 LibreOffice
    echo.
    echo 在 Windows 下，建议使用 win32com 而非 LibreOffice
    echo 如果您确实需要 LibreOffice，请从以下地址下载安装：
    echo https://www.libreoffice.org/download/
    echo.
    pause
    exit /b 1
)

echo [信息] 检测到 LibreOffice 已安装
echo [信息] 正在启动 LibreOffice 服务...
echo.

REM 启动 LibreOffice 监听服务
start /B libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard

timeout /t 3 >nul

echo [完成] LibreOffice 服务已启动
echo [信息] 监听地址: 127.0.0.1:2002
echo.
echo 提示: Windows 平台推荐使用 win32com（需要安装 Microsoft Word）
echo       只有在没有 Word 的情况下才需要使用 LibreOffice
echo.

pause
