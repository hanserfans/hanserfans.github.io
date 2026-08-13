# pip包管理实践

## 📖 什么是pip？

`pip`是Python官方推荐的包管理器，用于安装和管理Python包。

## 🚀 常用命令

```bash
# 安装包
pip install requests
pip install requests==2.28.0
pip install "requests>=2.0"

# 查看已安装
pip list
pip show requests

# 升级
pip install --upgrade requests

# 卸载
pip uninstall requests

# 导出依赖
pip freeze > requirements.txt

# 从文件安装
pip install -r requirements.txt
```

## 📝 运行演示

```bash
chmod +x demo.sh
./demo.sh
```

## 🎯 版本管理

### 常用版本符号

| 符号 | 含义 | 示例 |
|------|------|------|
| `==` | 精确版本 | `requests==2.28.0` |
| `>=` | 大于等于 | `requests>=2.0` |
| `~=` | 兼容版本 | `requests~=2.28` |

### 依赖文件示例

```txt
# requirements.txt
Django==4.2.0
requests==2.28.0
numpy==1.24.0
pandas==2.0.0
```

## 🌍 国内镜像

```bash
# 临时使用
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

## 📂 目录结构

```
02_pip_demo/
├── README.md      # 本文件
└── demo.sh       # 演示脚本
```

## 💡 最佳实践

1. **使用虚拟环境**：不要在全局Python安装包
2. **锁定版本**：使用`requirements.txt`锁定依赖
3. **定期更新**：使用`pip list --outdated`检查更新

## 📚 相关资源

- [pip官方文档](https://pip.pypa.io/)
- [PyPI - Python Package Index](https://pypi.org/)
- [PyPI镜像（清华）](https://pypi.tuna.tsinghua.edu.cn/simple)
