#!/bin/bash
# Poetry演示脚本

echo "================================"
echo "Python Poetry 包管理演示"
echo "================================"
echo ""

# 检查是否安装poetry
if ! command -v poetry &> /dev/null; then
    echo "⚠️  Poetry未安装，正在安装..."
    pip install poetry
fi
echo "✅ Poetry版本:"
poetry --version
echo ""

# 1. 创建项目
echo "1. 创建新项目..."
poetry new poetry-demo --name poetry_demo
cd poetry_demo
echo "✅ 项目已创建"
ls -la
echo ""

# 2. 查看pyproject.toml
echo "2. pyproject.toml内容:"
cat pyproject.toml
echo ""

# 3. 安装依赖
echo "3. 安装基础依赖..."
poetry install
echo ""

# 4. 添加包
echo "4. 添加requests包..."
poetry add requests
echo ""

# 5. 添加开发依赖
echo "5. 添加开发依赖pytest..."
poetry add --dev pytest
echo ""

# 6. 查看依赖
echo "6. 查看项目依赖..."
poetry show
echo ""

# 7. 查看依赖树
echo "7. 查看依赖树..."
poetry show --tree
echo ""

# 8. 运行脚本
echo "8. 创建并运行脚本..."
cat > test_script.py << 'EOF'
import requests

print("=== Poetry测试脚本 ===")
print(f"Python版本: {__import__('sys').version}")
print(f"requests版本: {requests.__version__}")
EOF

poetry run python test_script.py
echo ""

# 9. 锁定依赖
echo "9. 锁定依赖..."
poetry lock
echo "✅ 依赖已锁定"
ls -la
echo ""

# 10. 查看虚拟环境
echo "10. 查看虚拟环境信息..."
poetry env info
echo ""

# 11. 返回上级目录并清理
cd ..
echo "12. 清理..."
poetry --rm
rm -rf poetry-demo
echo "✅ 已清理"
echo ""

echo "================================"
echo "Poetry演示完成！"
echo "================================"
