#!/bin/bash
# Linux 环境诊断脚本 - 用于排查 DOCX 拆分问题

echo "=========================================="
echo "Linux 环境 DOCX 拆分功能诊断"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "ℹ $1"
}

# 1. 检查 Python
echo "1. 检查 Python 环境"
echo "-------------------"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    success "Python 已安装: $PYTHON_VERSION"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    success "Python 已安装: $PYTHON_VERSION"
    PYTHON_CMD="python"
else
    error "Python 未安装"
    echo "  安装方法: sudo apt-get install python3"
    exit 1
fi
echo ""

# 2. 检查 LibreOffice
echo "2. 检查 LibreOffice"
echo "-------------------"
if command -v libreoffice &> /dev/null; then
    LIBREOFFICE_VERSION=$(libreoffice --version 2>&1 | head -n 1)
    success "LibreOffice 已安装: $LIBREOFFICE_VERSION"
else
    error "LibreOffice 未安装"
    echo "  安装方法: sudo apt-get install libreoffice"
    exit 1
fi
echo ""

# 3. 检查 python3-uno
echo "3. 检查 Python UNO 桥接"
echo "----------------------"
if $PYTHON_CMD -c "import uno; print('UNO version:', uno.__file__)" 2>/dev/null; then
    success "python3-uno 已安装"
    $PYTHON_CMD -c "import uno; print('  路径:', uno.__file__)"
else
    error "python3-uno 未安装"
    echo "  安装方法: sudo apt-get install python3-uno"
    exit 1
fi
echo ""

# 4. 检查 LibreOffice 服务
echo "4. 检查 LibreOffice 服务"
echo "----------------------"
if netstat -tuln 2>/dev/null | grep -q ":2002 "; then
    success "LibreOffice 服务正在运行 (端口 2002)"
    LIBREOFFICE_PID=$(lsof -ti:2002 2>/dev/null)
    if [ ! -z "$LIBREOFFICE_PID" ]; then
        echo "  进程 ID: $LIBREOFFICE_PID"
    fi
elif ss -tuln 2>/dev/null | grep -q ":2002 "; then
    success "LibreOffice 服务正在运行 (端口 2002)"
else
    warning "LibreOffice 服务未运行"
    echo "  启动方法: npm run libreoffice:start"
    echo "  或手动: libreoffice --headless --accept='socket,host=127.0.0.1,port=2002;urp;' &"
fi
echo ""

# 5. 测试 Python 脚本
echo "5. 测试 Python 脚本"
echo "-------------------"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
UNIFIED_SCRIPT="$SCRIPT_DIR/server/api/files/split_docx_pages_unified.py"

if [ -f "$UNIFIED_SCRIPT" ]; then
    success "找到脚本: $UNIFIED_SCRIPT"
    
    # 测试脚本是否可执行
    info "测试脚本导入..."
    if $PYTHON_CMD -c "import sys; sys.path.insert(0, '$SCRIPT_DIR/server/api/files'); from split_docx_pages_unified import get_platform_handler; print('✓ 导入成功')" 2>/dev/null; then
        success "脚本可以正常导入"
    else
        error "脚本导入失败"
        echo "  尝试手动运行查看详细错误:"
        echo "  $PYTHON_CMD $UNIFIED_SCRIPT"
    fi
else
    error "未找到脚本: $UNIFIED_SCRIPT"
fi
echo ""

# 6. 检查测试文件
echo "6. 检查测试环境"
echo "---------------"
UPLOAD_DIR="$SCRIPT_DIR/uploads"
if [ -d "$UPLOAD_DIR" ]; then
    success "上传目录存在: $UPLOAD_DIR"
    
    # 检查权限
    if [ -w "$UPLOAD_DIR" ]; then
        success "上传目录可写"
    else
        error "上传目录不可写"
        echo "  修复方法: sudo chmod -R 755 $UPLOAD_DIR"
    fi
    
    # 列出 DOCX 文件
    DOCX_COUNT=$(find "$UPLOAD_DIR" -name "*.docx" 2>/dev/null | wc -l)
    if [ $DOCX_COUNT -gt 0 ]; then
        info "找到 $DOCX_COUNT 个 DOCX 文件"
    fi
else
    warning "上传目录不存在: $UPLOAD_DIR"
    echo "  创建目录: mkdir -p $UPLOAD_DIR"
fi
echo ""

# 7. 测试 LibreOffice 连接
echo "7. 测试 LibreOffice 连接"
echo "----------------------"
TEST_CONNECTION=$(cat << 'EOF'
import sys
try:
    import uno
    from com.sun.star.beans import PropertyValue
    
    # 连接到 LibreOffice
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context
    )
    
    ctx = resolver.resolve(
        "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"
    )
    
    print("✓ LibreOffice 连接成功")
    sys.exit(0)
except Exception as e:
    print(f"✗ LibreOffice 连接失败: {e}")
    sys.exit(1)
EOF
)

if netstat -tuln 2>/dev/null | grep -q ":2002 " || ss -tuln 2>/dev/null | grep -q ":2002 "; then
    if $PYTHON_CMD -c "$TEST_CONNECTION" 2>&1; then
        success "LibreOffice UNO 连接测试通过"
    else
        error "LibreOffice UNO 连接测试失败"
        echo ""
        echo "可能的原因:"
        echo "  1. LibreOffice 服务刚启动，需要等待几秒"
        echo "  2. 端口被其他程序占用"
        echo "  3. 防火墙阻止了连接"
        echo ""
        echo "排查步骤:"
        echo "  1. 重启 LibreOffice 服务: npm run libreoffice:restart"
        echo "  2. 检查端口: netstat -tuln | grep 2002"
        echo "  3. 查看进程: ps aux | grep soffice"
    fi
else
    warning "LibreOffice 服务未运行，跳过连接测试"
    echo "  先启动服务: npm run libreoffice:start"
fi
echo ""

# 8. 提供建议
echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""

# 检查是否所有测试都通过
if command -v python3 &> /dev/null && \
   command -v libreoffice &> /dev/null && \
   $PYTHON_CMD -c "import uno" 2>/dev/null; then
    
    if netstat -tuln 2>/dev/null | grep -q ":2002 " || ss -tuln 2>/dev/null | grep -q ":2002 "; then
        echo -e "${GREEN}✓ 所有检查通过！系统已准备就绪${NC}"
        echo ""
        echo "可以开始使用:"
        echo "  pnpm dev:with-libreoffice    # 开发模式"
        echo "  pnpm pm2:start              # 生产模式"
    else
        echo -e "${YELLOW}⚠ 环境已安装，但 LibreOffice 服务未运行${NC}"
        echo ""
        echo "启动服务:"
        echo "  npm run libreoffice:start"
        echo "  或"
        echo "  ./start_libreoffice_service.sh"
    fi
else
    echo -e "${RED}✗ 环境配置不完整${NC}"
    echo ""
    echo "请按照上述错误提示安装缺失的组件"
fi
echo ""

# 9. 如果需要，提供详细的调试命令
echo "调试命令:"
echo "----------"
echo "查看服务器日志:"
echo "  tail -f logs/*.log"
echo ""
echo "手动测试 Python 脚本:"
echo "  $PYTHON_CMD $UNIFIED_SCRIPT /path/to/input.docx /path/to/output 30"
echo ""
echo "查看 LibreOffice 进程:"
echo "  ps aux | grep soffice"
echo ""
echo "重启 LibreOffice:"
echo "  pkill -f soffice"
echo "  npm run libreoffice:start"
echo ""
