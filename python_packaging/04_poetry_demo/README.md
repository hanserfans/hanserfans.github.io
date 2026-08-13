# Poetry现代包管理实践

## 📖 什么是Poetry？

Poetry是现代化的Python依赖管理和打包工具，提供完整的项目配置、打包和发布功能。

## 🚀 快速开始

```bash
# 1. 安装
curl -sSL https://install.python-poetry.org | python3 -
# 或
pip install poetry

# 2. 创建项目
poetry new myproject

# 3. 添加依赖
poetry add requests

# 4. 安装依赖
poetry install

# 5. 运行脚本
poetry run python app.py
```

## 📝 运行演示

```bash
chmod +x setup.sh
./setup.sh
```

## 🎯 核心命令

| 命令 | 说明 |
|------|------|
| `poetry new project` | 创建新项目 |
| `poetry add package` | 添加依赖 |
| `poetry install` | 安装依赖 |
| `poetry lock` | 锁定依赖版本 |
| `poetry update` | 更新依赖 |
| `poetry run python` | 运行脚本 |
| `poetry shell` | 激活虚拟环境 |
| `poetry build` | 构建包 |
| `poetry publish` | 发布到PyPI |

## 📄 pyproject.toml示例

```toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "My awesome project"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.9"
django = "^4.2"
requests = "^2.28"

[tool.poetry.dev-dependencies]
pytest = "^7.0"
black = "^23.0"

[tool.poetry.scripts]
myapp = "myapp:main"
```

## 📂 目录结构

```
myproject/
├── pyproject.toml
├── src/
│   └── myproject/
│       ├── __init__.py
│       └── main.py
├── tests/
│   └── test_main.py
└── README.md
```

## 💡 Poetry vs pip+venv

| 特性 | pip + venv | Poetry |
|------|------------|--------|
| 虚拟环境 | 需要手动创建 | 自动管理 |
| 依赖文件 | requirements.txt | pyproject.toml |
| 锁定文件 | 无 | Pipfile.lock |
| 打包 | 需要额外工具 | 内置 |
| 发布PyPI | 需要twine | 内置 |

## 🎯 适用场景

✅ **推荐使用Poetry的场景**：
- 新启动的Python项目
- 需要发布到PyPI的项目
- 需要完整依赖管理的团队项目
- 现代化的CI/CD流程

## 📚 相关资源

- [Poetry官方文档](https://python-poetry.org/docs/)
- [Poetry GitHub](https://github.com/python-poetry/poetry)
