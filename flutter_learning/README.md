# Flutter 学习文件夹

## 📁 目录结构

```
flutter_learning/
├── install_flutter.sh       # Flutter安装脚本
├── 01_setup/                # 环境配置
├── 02_basics/               # Flutter基础
├── 03_widgets/              # 组件学习
├── 04_state_management/     # 状态管理
├── 05_networking/           # 网络请求
├── 06_storage/              # 数据存储
├── 07_projects/             # 项目实践
└── README.md                # 学习指南
```

## 🚀 安装指南

### 方法一：使用 Homebrew（推荐）

```bash
# 安装Flutter
brew install --cask flutter

# 验证安装
flutter --version

# 运行Flutter doctor检查环境
flutter doctor

# 接受Android协议
flutter doctor --android-licenses
```

### 方法二：手动下载

1. **下载Flutter SDK**
   ```bash
   # 创建开发目录
   mkdir -p ~/development
   cd ~/development

   # 克隆Flutter仓库（可能需要较长时间）
   git clone https://github.com/flutter/flutter.git -b stable --depth 1
   ```

2. **配置环境变量**
   ```bash
   # 编辑shell配置
   nano ~/.zshrc  # 或使用你喜欢的编辑器

   # 添加以下行
   export PATH="$PATH:$HOME/development/flutter/bin"
   ```

3. **使配置生效**
   ```bash
   source ~/.zshrc
   ```

4. **验证安装**
   ```bash
   flutter --version
   flutter doctor
   ```

## 📋 Flutter 环境要求

### macOS

- **操作系统**: macOS 10.14 或更高版本
- **磁盘空间**: 至少 2.8 GB
- **工具**: Git, Xcode Command Line Tools

### Xcode

```bash
# 检查Xcode版本
xcodebuild -version

# 安装Xcode Command Line Tools
xcode-select --install
```

### Android SDK

Flutter需要Android SDK，你可以：

1. **使用Android Studio**（推荐，自动配置）
2. **单独安装Android SDK**
3. **使用命令行工具**

```bash
# 配置Android SDK路径
export ANDROID_SDK_ROOT=~/Library/Android/sdk
export PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools"
```

## 🔍 验证安装

### 1. 运行 flutter doctor

```bash
flutter doctor
```

预期输出：
```
Doctor summary (to see all findings, run flutter doctor -v):
[✓] Flutter (Channel stable)
[✓] Android toolchain - develop for Android devices
[✓] Xcode - develop for iOS and macOS
[✓] Chrome - develop for the web
[✓] Edge - develop for the web
[✓] Web Server
```

### 2. 创建第一个项目

```bash
# 创建项目
flutter create my_first_app

# 进入目录
cd my_first_app

# 运行应用
flutter run
```

## 🛠️ 开发工具配置

### VS Code

安装扩展：
- Flutter
- Dart

### Android Studio / IntelliJ IDEA

安装插件：
- Flutter plugin
- Dart plugin

### 配置模拟器

```bash
# 查看可用模拟器
xcrun simctl list devices available

# 启动iOS模拟器
open -a Simulator

# 列出已连接的设备
flutter devices
```

## 📚 学习路径

### 第一阶段：环境搭建
- [ ] 安装Flutter SDK
- [ ] 配置开发环境
- [ ] 运行flutter doctor
- [ ] 创建第一个项目

### 第二阶段：基础组件
- [ ] 了解Widget概念
- [ ] 学习常用组件
- [ ] 布局组件
- [ ] 表单组件

### 第三阶段：状态管理
- [ ] StatefulWidget
- [ ] Provider
- [ ] Riverpod
- [ ] BLoC

### 第四阶段：进阶技能
- [ ] 网络请求
- [ ] 数据存储
- [ ] 路由管理
- [ ] 动画

### 第五阶段：项目实践
- [ ] 完整项目开发
- [ ] 性能优化
- [ ] 发布应用

## 🎯 学习资源

- [Flutter官方文档](https://flutter.dev/docs)
- [Flutter中文网](https://flutterchina.club/)
- [Flutter组件库](https://flutter.dev/community)
- [Dart语言教程](https://dart.dev/guides)
- [Awesome Flutter](https://github.com/Solido/awesome-flutter)

## 🚀 常用命令

```bash
# 创建项目
flutter create project_name

# 运行应用
flutter run

# 构建应用
flutter build apk          # Android
flutter build ios          # iOS
flutter build web          # Web

# 获取依赖
flutter pub get

# 添加依赖
flutter pub add package_name

# 热重载
# 在运行应用时按 'r' 键

# 清理项目
flutter clean
```

## ⚠️ 常见问题

### 1. Android license未接受

```bash
flutter doctor --android-licenses
```

### 2. iOS模拟器无法启动

```bash
# 重置模拟器
xcret simctl shutdown all
xcrun simctl boot all
```

### 3. Flutter命令找不到

确保已将Flutter bin目录添加到PATH：
```bash
export PATH="$PATH:$HOME/development/flutter/bin"
```

### 4. 网络问题导致下载失败

可以使用国内镜像：
```bash
# 临时设置镜像
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
export PUB_HOSTED_URL=https://pub.flutter-io.cn

# 或者永久设置，添加到 ~/.zshrc
```

## 📝 笔记

在学习过程中，将遇到的问题和解决方案记录在这里：

### 问题1：[填写问题]
**解决方案**: [填写答案]

### 问题2：[填写问题]
**解决方案**: [填写答案]

---

**创建时间**: 2026-08-10
**学习目标**: 掌握Flutter开发技能，能够独立开发跨平台应用
