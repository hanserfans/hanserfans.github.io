# Python包管理与虚拟环境实践

## 📁 目录结构

```
python_packaging/
├── README.md                  # 本文件
├── 01_venv_demo/            # venv虚拟环境实践
├── 02_pip_demo/             # pip包管理实践
├── 03_pipenv_demo/          # pipenv实践
├── 04_poetry_demo/          # Poetry实践
└── 05_conda_demo/          # Conda实践
```

## 🚀 快速开始

### 1. venv + pip（推荐入门）

```bash
# 创建虚拟环境
python -m venv myenv

# 激活
source myenv/bin/activate

# 安装依赖
pip install requests flask

# 导出依赖
pip freeze > requirements.txt

# 退出
deactivate
```

### 2. Poetry（现代项目）

```bash
# 安装Poetry
curl -sSL https://install.python-poetry.org | python3 -

# 创建项目
poetry new myproject
cd myproject

# 安装依赖
poetry install

# 添加包
poetry add requests

# 运行
poetry run python app.py
```

## 📚 学习路径

1. **01_venv_demo** - 先掌握基础：venv + pip
2. **02_pip_demo** - 深入了解pip命令
3. **03_pipenv_demo** - 进阶：pipenv一键管理
4. **04_poetry_demo** - 现代化：Poetry
5. **05_conda_demo** - 数据科学：conda

## 🎯 实践任务

### 任务1：创建第一个虚拟环境

```bash
cd 01_venv_demo
bash setup.sh
```

### 任务2：使用pip管理包

```bash
cd 02_pip_demo
bash demo.sh
```

### 任务3：对比pipenv vs venv

```bash
# venv方式
cd 01_venv_demo
./setup.sh

# pipenv方式
cd 03_pipenv_demo
./setup.sh
```

## 📖 相关资源

- [Python官方文档](https://docs.python.org/3/)
- [pip文档](https://pip.pypa.io/)
- [Poetry文档](https://python-poetry.org/docs/)
- [Conda文档](https://docs.conda.io/)

---

**创建时间**: 2026-08-11
**学习目标**: 掌握Python包管理和虚拟环境
