#!/bin/bash
# Flutter 安装脚本

echo "🚀 开始安装 Flutter..."
echo "================================"

# 1. 检查系统
echo "📋 检查系统环境..."
uname -s

# 2. 检查是否已安装Flutter
if command -v flutter &> /dev/null; then
    echo "✅ Flutter 已安装: $(flutter --version)"
    echo "📍 安装路径: $(which flutter)"
else
    echo "❌ Flutter 未安装，开始安装..."
fi

# 3. 检查Homebrew
if command -v brew &> /dev/null; then
    echo "✅ Homebrew 已安装"
else
    echo "❌ 请先安装 Homebrew: https://brew.sh"
fi

# 4. 检查 Xcode Command Line Tools
if command -v xcodebuild &> /dev/null; then
    echo "✅ Xcode Command Line Tools 已安装"
else
    echo "⚠️ 建议安装 Xcode Command Line Tools"
fi

echo ""
echo "📝 Flutter 安装步骤："
echo "================================"
echo "1. 下载 Flutter SDK"
echo "   方法1: Homebrew"
echo "   命令: brew install --cask flutter"
echo ""
echo "   方法2: 手动下载"
echo "   下载地址: https://docs.flutter.dev/get-started/install/macos"
echo ""
echo "2. 配置环境变量"
echo "   将以下内容添加到 ~/.zshrc 或 ~/.bash_profile"
echo '   export PATH="$PATH:$HOME/development/flutter/bin"'
echo ""
echo "3. 验证安装"
echo "   flutter doctor"
echo ""
echo "4. 接受协议"
echo "   flutter doctor --android-licenses"
echo ""
echo "================================"
echo "📚 详细文档: https://flutter.dev/docs/get-started/install"
