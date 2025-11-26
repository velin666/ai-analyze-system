#!/bin/bash
# Linux/macOS 下启动 LibreOffice 服务的脚本

echo "========================================"
echo "LibreOffice 服务启动脚本"
echo "========================================"
echo ""

# 检查 LibreOffice 是否安装
if ! command -v libreoffice &> /dev/null; then
    echo "[错误] 未检测到 LibreOffice"
    echo ""
    echo "安装方法："
    echo "  Ubuntu/Debian: sudo apt-get install libreoffice python3-uno"
    echo "  CentOS/RHEL:   sudo yum install libreoffice libreoffice-pyuno"
    echo "  macOS:         brew install libreoffice"
    echo ""
    exit 1
fi

echo "[信息] 检测到 LibreOffice 已安装"

# 检查端口是否被占用
if lsof -Pi :2002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[警告] 端口 2002 已被占用"
    echo ""
    read -p "是否停止现有服务并重新启动？(y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "[信息] 停止现有 LibreOffice 服务..."
        pkill -f "soffice.*2002"
        sleep 2
    else
        echo "[取消] 保持现有服务运行"
        exit 0
    fi
fi

echo "[信息] 正在启动 LibreOffice 服务..."
echo ""

# 启动 LibreOffice 监听服务
libreoffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" --nofirststartwizard &

LIBREOFFICE_PID=$!

# 等待服务启动
sleep 3

# 检查服务是否成功启动
if ps -p $LIBREOFFICE_PID > /dev/null 2>&1; then
    echo "[完成] LibreOffice 服务已启动"
    echo "[信息] PID: $LIBREOFFICE_PID"
    echo "[信息] 监听地址: 127.0.0.1:2002"
    echo ""
    echo "停止服务: pkill -f 'soffice.*2002'"
    echo "查看状态: ps aux | grep soffice"
    echo ""
else
    echo "[错误] LibreOffice 服务启动失败"
    exit 1
fi

# 提示如何设置开机自启动
echo "=========================================="
echo "设置开机自启动（可选）"
echo "=========================================="
echo ""
echo "创建 systemd 服务："
echo ""
echo "sudo tee /etc/systemd/system/libreoffice-headless.service > /dev/null <<EOF"
echo "[Unit]"
echo "Description=LibreOffice Headless Service"
echo "After=network.target"
echo ""
echo "[Service]"
echo "Type=simple"
echo "User=$USER"
echo "ExecStart=$(which libreoffice) --headless --accept='socket,host=127.0.0.1,port=2002;urp;' --nofirststartwizard"
echo "Restart=always"
echo "RestartSec=10"
echo ""
echo "[Install]"
echo "WantedBy=multi-user.target"
echo "EOF"
echo ""
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable libreoffice-headless"
echo "sudo systemctl start libreoffice-headless"
echo ""
