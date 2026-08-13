#!/bin/bash
# venv虚拟环境演示脚本

echo "================================"
echo "Python venv 虚拟环境演示"
echo "================================"
echo ""

# 1. 检查Python版本
echo "1. 检查Python版本..."
python --version
echo ""

# 2. 创建虚拟环境
echo "2. 创建虚拟环境..."
python -m venv demo-env
echo "✅ 虚拟环境已创建: demo-env/"
echo ""

# 3. 激活虚拟环境
echo "3. 激活虚拟环境..."
source demo-env/bin/activate
echo "✅ 虚拟环境已激活"
echo ""

# 4. 检查pip版本
echo "4. 检查pip版本..."
pip --version
echo ""

# 5. 安装示例包
echo "5. 安装示例包..."
pip install requests flask
echo "✅ 已安装 requests 和 flask"
echo ""

# 6. 查看已安装的包
echo "6. 查看已安装的包..."
pip list
echo ""

# 7. 导出依赖
echo "7. 导出依赖到requirements.txt..."
pip freeze > requirements.txt
echo "✅ 依赖已导出"
echo ""

# 8. 显示导出的内容
echo "8. requirements.txt内容:"
cat requirements.txt
echo ""

# 9. 退出虚拟环境
echo "9. 退出虚拟环境..."
deactivate
echo "✅ 已退出虚拟环境"
echo ""

# 10. 清理
echo "10. 清理演示环境..."
rm -rf demo-env requirements.txt
echo "✅ 已清理"
echo ""

echo "================================"
echo "演示完成！"
echo "================================"
