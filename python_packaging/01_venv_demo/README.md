# venv虚拟环境实践

## 📖 什么是venv？

`venv`是Python 3.3+内置的虚拟环境模块，用于创建隔离的Python运行环境。

## 🚀 快速开始

```bash
# 1. 创建虚拟环境
python -m venv myenv

# 2. 激活
source myenv/bin/activate  # Linux/macOS
# myenv\Scripts\activate     # Windows

# 3. 安装包
pip install requests

# 4. 导出依赖
pip freeze > requirements.txt

# 5. 退出
deactivate
```

## 📝 运行演示

```bash
chmod +x setup.sh
./setup.sh
```

## 🎯 核心命令

| 命令 | 说明 |
|------|------|
| `python -m venv env` | 创建虚拟环境 |
| `source env/bin/activate` | 激活环境 |
| `deactivate` | 退出环境 |
| `pip freeze > requirements.txt` | 导出依赖 |

## 📂 目录结构

```
01_venv_demo/
├── README.md      # 本文件
└── setup.sh       # 演示脚本
```

## 💡 最佳实践

1. **项目级虚拟环境**：每个项目一个虚拟环境
2. **不提交venv目录**：添加到.gitignore
3. **锁定依赖版本**：确保环境可复现

## 📝 .gitignore配置

```bash
# .gitignore
venv/
env/
*.pyc
__pycache__/
```

## 🔍 常见问题

### Q: 如何指定Python版本？

```bash
# 系统有多个Python版本时
python3.11 -m venv myenv
```

### Q: 如何复制环境？

```bash
# 导出
pip freeze > requirements.txt

# 在新环境安装
pip install -r requirements.txt
```

### Q: 如何删除环境？

```bash
# 只需删除虚拟环境目录
rm -rf venv
```

## 📚 相关资源

- [Python官方文档 - venv](https://docs.python.org/3/library/venv.html)
- [PEP 405 - Python Virtual Environments](https://peps.python.org/pep-0405/)
