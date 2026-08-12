# Flutter 安装和配置指南

## 📋 当前状态

**Flutter 安装状态**: 🔄 安装中...

**安装方式**: Homebrew (macOS推荐方式)

**预计时间**: 5-15分钟（取决于网络速度）

---

## 🚀 安装步骤

### 步骤1：使用Homebrew安装（已完成/进行中）

```bash
brew install --cask flutter
```

### 步骤2：验证安装

Flutter安装完成后，运行以下命令验证：

```bash
# 检查Flutter版本
flutter --version

# 运行Flutter doctor检查环境
flutter doctor
```

### 步骤3：配置环境（如需要）

#### macOS 环境变量配置

```bash
# 编辑shell配置
nano ~/.zshrc

# 添加以下内容（如果需要）
export PATH="$PATH:$HOME/development/flutter/bin"

# 使配置生效
source ~/.zshrc
```

### 步骤4：接受Android协议

```bash
flutter doctor --android-licenses
```

---

## 📦 安装内容

### 1. Flutter SDK
- Dart SDK（内置）
- Flutter命令行工具
- 构建工具

### 2. 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | macOS 10.14 或更高 |
| 磁盘空间 | 2.8 GB+ |
| Xcode | 最新版本 |
| Android SDK | 可选（用于Android开发） |

---

## 🛠️ 开发工具设置

### VS Code 配置

1. 安装VS Code: https://code.visualstudio.com/
2. 安装扩展：
   - Flutter (Dart-Code)
   - Flutter Intl (本地化)

### Android Studio 配置

1. 下载Android Studio: https://developer.android.com/studio
2. 安装Flutter和Dart插件
3. 配置Android模拟器

---

## 🔍 验证安装

### 1. 检查Flutter版本

```bash
flutter --version
```

预期输出：
```
Flutter 3.x.x • channel stable • ...
Dart 3.x.x • ...
```

### 2. 运行Flutter Doctor

```bash
flutter doctor -v
```

预期检查项：
- [✓] Flutter (已安装)
- [✓] Android toolchain (Android SDK)
- [✓] Xcode (iOS/macOS开发)
- [✓] Chrome (Web开发)

### 3. 创建测试项目

```bash
# 创建新项目
flutter create test_app

# 进入目录
cd test_app

# 运行应用
flutter run
```

---

## ⚠️ 常见问题

### 1. 网络下载慢

使用国内镜像：
```bash
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
export PUB_HOSTED_URL=https://pub.flutter-io.cn
```

### 2. Android license未接受

```bash
flutter doctor --android-licenses
```

### 3. iOS模拟器问题

```bash
# 查看可用模拟器
xcrun simctl list devices available

# 启动模拟器
open -a Simulator
```

---

## 📚 学习资源

| 资源 | 链接 |
|------|------|
| Flutter官方文档 | https://flutter.dev/docs |
| Flutter中文网 | https://flutterchina.club/ |
| Dart官方文档 | https://dart.dev/guides |
| Flutter示例 | https://flutter.dev/showcase |
| 组件目录 | https://flutter.dev/community |

---

## 🚀 后续学习

安装完成后，建议按以下顺序学习：

1. **Flutter基础** - 组件、布局、状态
2. **常用组件** - Text、Button、List等
3. **布局组件** - Row、Column、Stack等
4. **状态管理** - StatefulWidget、Provider
5. **路由导航** - Navigator、路由管理
6. **网络请求** - HTTP、REST API
7. **数据存储** - SharedPreferences、SQLite
8. **项目实战** - 开发完整应用

---

**创建时间**: 2026-08-10
**最后更新**: 2026-08-10
**状态**: 待验证（安装中）
