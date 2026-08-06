#!/bin/bash

# 智能体写作系统启动脚本

echo "🚀 智能体写作系统启动中..."

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 安装Python依赖..."
    pip install -r requirements.txt
else
    echo "✅ 虚拟环境已存在"
    source venv/bin/activate
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
else
    echo "✅ 前端依赖已安装"
fi

# 创建日志目录
mkdir -p logs

echo "🔧 启动服务..."

# 启动后端服务
echo "📡 启动后端服务 (端口 5000)..."
python app.py > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 启动前端服务
echo "🎨 启动前端服务 (端口 3000)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务 PID: $FRONTEND_PID"
cd ..

# 保存PID
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo ""
echo "🎉 智能体写作系统已启动！"
echo ""
echo "📱 前端地址: http://localhost:3000"
echo "🔌 后端API: http://localhost:5000"
echo ""
echo "📋 查看日志:"
echo "   后端: tail -f logs/backend.log"
echo "   前端: tail -f logs/frontend.log"
echo ""
echo "🛑 停止服务: ./stop.sh"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait