# Python包管理与虚拟环境快速参考

## 🆚 工具对比

| 工具 | 适用场景 | 命令复杂度 |
|------|----------|-----------|
| **venv + pip** | 通用、入门 | ⭐⭐ |
| **pipenv** | Web应用 | ⭐⭐ |
| **Poetry** | 现代项目 | ⭐⭐⭐ |
| **conda** | 数据科学 | ⭐⭐⭐ |

## 📋 命令速查表

### venv虚拟环境

```bash
# 创建
python -m venv venv

# 激活
source venv/bin/activate

# 退出
deactivate

# 删除
rm -rf venv
```

### pip包管理

```bash
# 安装
pip install package
pip install package==1.0.0
pip install -r requirements.txt

# 列出
pip list
pip show package

# 导出
pip freeze > requirements.txt

# 卸载
pip uninstall package
```

### Poetry

```bash
# 创建
poetry new project

# 安装
poetry install
poetry add package

# 运行
poetry run python app.py
poetry shell

# 发布
poetry build
poetry publish
```

### conda

```bash
# 环境
conda create --name env python=3.11
conda activate env
conda env list

# 包
conda install numpy
conda list
conda env export > env.yml
```

## 🎯 场景选择指南

```
需要选哪个？
│
├─ 简单脚本？
│  └─ → venv + pip ✅
│
├─ Django/Flask Web项目？
│  └─ → Poetry 或 pipenv ✅
│
├─ 数据科学/机器学习？
│  └─ → conda ✅
│
├─ 需要发布到PyPI？
│  └─ → Poetry ✅
│
└─ 团队协作项目？
   └─ → Poetry ✅
```

## ⚠️ 常见错误

### 1. 权限错误

```bash
# ❌ 错误
pip install package
# 提示: Permission denied

# ✅ 正确
python -m venv venv
source venv/bin/activate
pip install package
```

### 2. 版本冲突

```bash
# ❌ 全局安装导致冲突
pip install django==4.0
pip install django==2.0  # 冲突！

# ✅ 使用虚拟环境隔离
python -m venv env1
source env1/bin/activate
pip install django==4.0

python -m venv env2
source env2/bin/activate
pip install django==2.0
```

### 3. 国内下载慢

```bash
# ✅ 使用国内镜像
pip install package -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

## 💡 最佳实践

1. ✅ **始终使用虚拟环境**
2. ✅ **锁定依赖版本**（pip freeze / poetry lock）
3. ✅ **使用国内镜像**（加速下载）
4. ✅ **分离开发和生产依赖**
5. ✅ **定期更新依赖**（安全补丁）
6. ✅ **提交依赖文件到Git**

## 📁 推荐项目结构

```
myproject/
├── venv/                    # 虚拟环境（不提交）
├── src/                     # 源代码
│   └── mypackage/
├── tests/                   # 测试代码
├── docs/                    # 文档
├── requirements.txt       # 生产依赖
├── requirements-dev.txt     # 开发依赖
├── pyproject.toml          # 项目配置（Poetry）
├── setup.py                # 安装脚本
├── README.md               # 项目说明
└── .gitignore            # Git忽略
```

## 🔧 常用镜像源

| 镜像 | 地址 |
|------|------|
| 清华 | https://pypi.tuna.tsinghua.edu.cn/simple |
| 阿里 | https://mirrors.aliyun.com/pypi/simple |
| 腾讯 | https://mirrors.cloud.tencent.com/pypi/simple |
| 豆瓣 | https://pypi.doubanio.com/simple |

## 📞 获取帮助

```bash
# 查看帮助
pip --help
poetry --help
conda --help

# 查看版本
pip --version
poetry --version
conda --version
```

---

**记住**：永远不要在全局Python环境安装包！每个项目使用独立的虚拟环境！🎯
