#!/bin/bash
# 快速启动 LibreOffice 服务脚本
# 用于排查连接问题

set -e

PORT=2002
HOST="127.0.0.1"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}LibreOffice 快速启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 LibreOffice 是否安装
if ! command -v libreoffice &> /dev/null; then
    echo -e "${RED}✗ LibreOffice 未安装${NC}"
    echo ""
    echo "安装方法:"
    echo "  Ubuntu/Debian: sudo apt-get install libreoffice python3-uno"
    echo "  CentOS/RHEL:   sudo yum install libreoffice libreoffice-pyuno"
    exit 1
fi

echo -e "${GREEN}✓ LibreOffice 已安装${NC}"
libreoffice --version

# 检查端口是否已被占用
if netstat -tuln 2>/dev/null | grep -q ":$PORT " || ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo -e "${YELLOW}⚠ 端口 $PORT 已被占用${NC}"
    echo ""
    echo "检查进程:"
    lsof -i :$PORT 2>/dev/null || true
    echo ""
    echo "是否要停止现有进程并重启？(y/n)"
    read -r answer
    if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
        echo "停止现有进程..."
        pkill -f "soffice.*$PORT" || true
        sleep 2
    else
        echo "退出。请手动停止进程后重试。"
        exit 0
    fi
fi

# 启动 LibreOffice
echo ""
echo -e "${BLUE}正在启动 LibreOffice headless 服务...${NC}"
echo "端口: $PORT"
echo "地址: $HOST"
echo ""

# 启动服务
libreoffice --headless \
    --accept="socket,host=$HOST,port=$PORT;urp;" \
    --nofirststartwizard &

LIBREOFFICE_PID=$!
echo "进程 ID: $LIBREOFFICE_PID"

# 等待服务启动
echo ""
echo "等待服务启动..."
for i in {1..10}; do
    echo -n "."
    sleep 1
    
    if netstat -tuln 2>/dev/null | grep -q ":$PORT " || ss -tuln 2>/dev/null | grep -q ":$PORT "; then
        echo ""
        echo -e "${GREEN}✓ LibreOffice 服务启动成功！${NC}"
        echo ""
        echo "连接信息:"
        echo "  - 地址: $HOST:$PORT"
        echo "  - 进程 ID: $LIBREOFFICE_PID"
        echo ""
        
        # 测试 Python 连接
        echo "测试 Python UNO 连接..."
        if python3 -c "
import uno
try:
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        'com.sun.star.bridge.UnoUrlResolver', local_context
    )
    ctx = resolver.resolve(
        'uno:socket,host=$HOST,port=$PORT;urp;StarOffice.ComponentContext'
    )
    print('✓ Python UNO 连接成功')
    exit(0)
except Exception as e:
    print(f'✗ Python UNO 连接失败: {e}')
    exit(1)
" 2>/dev/null; then
            echo -e "${GREEN}✓ Python UNO 连接测试通过${NC}"
        else
            echo -e "${YELLOW}⚠ Python UNO 连接失败${NC}"
            echo ""
            echo "可能的原因:"
            echo "  1. python3-uno 未安装"
            echo "  2. 服务刚启动，请等待几秒后重试"
            echo ""
            echo "安装 python3-uno:"
            echo "  sudo apt-get install python3-uno"
        fi
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}服务已启动并在后台运行${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "管理命令:"
        echo "  查看状态: pnpm libreoffice:status"
        echo "  停止服务: pnpm libreoffice:stop"
        echo "  重启服务: pnpm libreoffice:restart"
        echo ""
        echo "日志位置: logs/libreoffice-*.log"
        echo ""
        
        exit 0
    fi
done

# 超时
echo ""
echo -e "${RED}✗ 服务启动失败（超时）${NC}"
echo ""
echo "排查步骤:"
echo "  1. 检查进程是否存在: ps aux | grep soffice"
echo "  2. 查看错误日志: journalctl -xe"
echo "  3. 手动测试启动: libreoffice --version"
echo "  4. 运行完整诊断: pnpm diagnose:linux"
echo ""

exit 1
