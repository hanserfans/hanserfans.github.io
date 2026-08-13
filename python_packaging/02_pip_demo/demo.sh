#!/bin/bash
# pip包管理演示脚本

echo "================================"
echo "Python pip 包管理演示"
echo "================================"
echo ""

# 1. 检查pip版本
echo "1. 检查pip版本..."
pip --version
echo ""

# 2. 查看已安装的包数量
echo "2. 已安装的包数量..."
pip list | wc -l
echo ""

# 3. 列出可升级的包
echo "3. 可升级的包（前10个）..."
pip list --outdated | head -10
echo ""

# 4. 创建测试目录
echo "4. 创建测试目录..."
mkdir -p pip-demo
cd pip-demo
echo "✅ 已创建并进入 pip-demo/"
echo ""

# 5. 安装指定版本
echo "5. 安装requests==2.28.0..."
pip install requests==2.28.0
echo ""

# 6. 验证安装
echo "6. 验证安装..."
pip show requests
echo ""

# 7. 安装多个包
echo "7. 安装多个包..."
pip install flask django numpy pandas
echo ""

# 8. 查看已安装
echo "8. 已安装的包..."
pip list
echo ""

# 9. 导出依赖
echo "9. 导出依赖到requirements.txt..."
pip freeze > requirements.txt
cat requirements.txt
echo ""

# 10. 测试包
echo "10. 测试包是否可用..."
python -c "import requests; print(f'requests版本: {requests.__version__}')"
python -c "import flask; print(f'flask版本: {flask.__version__}')"
echo ""

# 11. 卸载一个包
echo "11. 卸载pandas..."
pip uninstall -y pandas
echo ""

# 12. 查看最终状态
echo "12. 最终依赖..."
pip freeze
echo ""

# 13. 返回上级目录并清理
cd ..
echo "13. 清理测试目录..."
rm -rf pip-demo
echo "✅ 已清理"
echo ""

echo "================================"
echo "pip演示完成！"
echo "================================"
