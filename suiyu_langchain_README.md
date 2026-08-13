# Suiyu指纹浏览器 + LangChain Agent 项目搭建指南

## 📁 项目目录结构

在 `/Users/mac/git/suiyu_langchain/` 下创建以下目录：

```
suiyu_langchain/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI主应用
│   ├── suiyu_client.py     # Suiyu API客户端
│   ├── llm_config.py       # MiniMax LLM配置
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── browser_tools.py # 浏览器操作工具
│   │   └── proxy_tools.py  # 代理管理工具
│   └── agent/
│       ├── __init__.py
│       └── browser_agent.py  # LangChain Agent
├── config/
│   └── __init__.py
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

## 🚀 快速开始

### 1. 创建虚拟环境

```bash
cd /Users/mac/git/suiyu_langchain
python -m venv venv
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑.env文件，填入你的API密钥
```

### 4. 启动服务

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📝 requirements.txt

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
langchain==0.1.0
langchain-core==0.1.10
langchain-community==0.0.10
httpx==0.26.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0
```

## 🔧 .env.example

```bash
# Suiyu API配置
SUIYU_API_URL=http://localhost:8080
SUIYU_API_KEY=

# MiniMax LLM配置
MINIMAX_API_KEY=gw-f43c25a3-d060-44ea-8f26-46d0a0033f3c
MINIMAX_BASE_URL=https://minnimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
```

## 📚 完整代码文件

详见博客文章：
[LangChain与Suiyu指纹浏览器集成实战](file:///Users/mac/git/hanserfans.github.io/_posts/2026-08-12-LangChain与Suiyu指纹浏览器集成.md)

## 🔑 核心工具列表

| 工具函数 | 功能 |
|---------|------|
| `list_browsers` | 列出所有浏览器 |
| `create_browser` | 创建新浏览器 |
| `start_browser` | 启动浏览器 |
| `stop_browser` | 停止浏览器 |
| `open_website` | 打开网页 |
| `get_website_content` | 获取网页内容 |
| `take_screenshot` | 网页截图 |
| `search_on_website` | 自动搜索 |

## 🎯 使用示例

### 命令行测试

```python
from app.agent.browser_agent import create_browser_agent

agent = create_browser_agent()

# 测试1: 列出浏览器
result = agent.run("列出所有浏览器")

# 测试2: 自动化操作
result = agent.run("帮我访问Amazon并搜索iPhone 15的价格")
```

### API调用

```bash
# 启动服务后
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "列出所有浏览器"}'
```

## 📖 学习资源

- [Suiyu官方文档](file:///Users/mac/git/Suiyu-re/README.md)
- [LangChain文档](https://python.langchain.com/docs)
- [Suiyu API接口](file:///Users/mac/git/Suiyu-re/docs/浏览器接口.md)
