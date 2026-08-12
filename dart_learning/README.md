# Dart 学习文件夹

## 📁 文件夹结构

```
dart_learning/
├── 01_basics/          # Dart 基础语法
├── 02_oop/             # 面向对象编程
├── 03_async/           # 异步编程
├── 04_collections/     # 集合类型
├── 05_packages/        # 包和依赖管理
├── 06_flutter_intro/   # Flutter 入门
├── 07_projects/        # 实践项目
└── README.md           # 学习指南
```

## 📚 学习路径

### 01_basics - Dart 基础
- [ ] 变量和数据类型
- [ ] 函数和闭包
- [ ] 运算符和表达式
- [ ] 控制流程（if/for/while）
- [ ] 异常处理
- [ ] 类和对象

### 02_oop - 面向对象编程
- [ ] 类和构造方法
- [ ] 继承和多态
- [ ] 抽象类和接口
- [ ] Mixin
- [ ] 泛型
- [ ] 扩展方法

### 03_async - 异步编程
- [ ] Future
- [ ] async/await
- [ ] Stream
- [ ] isolates（隔离）

### 04_collections - 集合类型
- [ ] List（列表）
- [ ] Set（集合）
- [ ] Map（映射）
- [ ] 集合操作和转换

### 05_packages - 包管理
- [ ] pubspec.yaml
- [ ] 常用标准库
- [ ] 第三方包
- [ ] 模块和导入

### 06_flutter_intro - Flutter 入门
- [ ] Widget 介绍
- [ ] 状态管理
- [ ] 布局组件
- [ ] 导航

### 07_projects - 实践项目
- [ ] 命令行工具
- [ ] Web 服务器
- [ ] Flutter 应用

## 🛠️ 环境准备

### 1. 安装 Dart SDK

访问 [Dart官网](https://dart.dev/get-dart)，下载安装包。

验证安装：

```bash
dart --version
```

### 2. IDE 推荐

- **VS Code** + Dart 插件
- **IntelliJ IDEA** / Android Studio
- **DartPad**（在线编辑器，无需安装）

### 3. 创建第一个项目

```bash
# 创建新项目
dart create my_app

# 进入目录
cd my_app

# 运行
dart run
```

### 4. pubspec.yaml 依赖管理

```yaml
name: my_app
description: A sample Dart project
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  http: ^1.0.0
  path: ^1.8.3

dev_dependencies:
  flutter_test:
    sdk: flutter
```

常用命令：

```bash
# 获取依赖
dart pub get

# 添加依赖
dart pub add http

# 运行
dart run

# 测试
dart test

# 编译
dart compile exe my_app.dart
```

## 📝 学习资源

- [Dart 官方文档](https://dart.dev/guides)
- [Dart 语言教程](https://dart.dev/tutorials)
- [Flutter 官方文档](https://flutter.dev/docs)
- [DartPad 在线编辑器](https://dartpad.dartlang.org/)

## 🚀 学习建议

1. **循序渐进**：从基础语法开始，逐步深入
2. **动手实践**：每学一个知识点，动手写代码
3. **阅读源码**：学习优秀开源项目的代码
4. **完成项目**：通过实际项目巩固知识

## 🎯 学习目标

- 掌握 Dart 语言基础语法
- 理解面向对象编程思想
- 熟练使用异步编程
- 能够开发 Flutter 应用
- 掌握包管理和项目构建

---

**创建时间**：2026-08-10
**学习目标**：系统掌握 Dart 编程技能和 Flutter 开发