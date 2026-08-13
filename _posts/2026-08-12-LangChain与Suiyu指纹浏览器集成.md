---
title: "LangChain智能体与Suiyu指纹浏览器集成实战"
date: 2026-08-12
categories:
  - AI应用
tags:
  - LangChain
  - LangGraph
  - 大模型
  - Agent
  - Suiyu
  - 指纹浏览器
  - API集成
author: 母亚含
math: false
toc: true
comments: true
description: "详细介绍如何将LangChain Agent与Suiyu指纹浏览器REST API集成，实现智能化的浏览器自动化操作。"
---

# LangChain智能体与Suiyu指纹浏览器集成实战

> 📚 本文介绍如何将LangChain Agent与Suiyu指纹浏览器的REST API集成，创建能够自动化控制指纹浏览器的智能助手。

## 目录

1. [Suiyu指纹浏览器简介](#1-suiyu指纹浏览器简介)
2. [API接口概述](#2-api接口概述)
3. [环境配置](#3-环境配置)
4. [Suiyu API客户端封装](#4-suiyu-api客户端封装)
5. [LangChain Tools实现](#5-langchain-tools实现)
6. [完整的Agent示例](#6-完整的agent示例)
7. [FastAPI服务封装](#7-fastapi服务封装)

---

## 1. Suiyu指纹浏览器简介

### 1.1 核心功能

Suiyu是一个功能完整的指纹浏览器管理系统，提供：

| 功能模块 | 说明 |
|---------|------|
| **浏览器管理** | 创建、启动、停止、删除浏览器环境 |
| **指纹配置** | 完整指纹参数配置（UA、WebGL、Canvas等） |
| **代理管理** | 支持HTTP/SOCKS5/自定义代理 |
| **分组管理** | 按分组管理大量浏览器环境 |
| **批量操作** | 支持批量创建、启动、导入导出 |
| **REST API** | 完整的HTTP API接口 |

### 1.2 API服务架构

```
┌─────────────────────────────────────────┐
│           Suiyu Browser Manager           │
│  ┌─────────────────────────────────┐  │
│  │      HTTP API Server (8080)     │  │
│  │  /api/browsers/*                 │  │
│  │  /api/proxy/*                   │  │
│  │  /api/workbench/*               │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │      WebDriver/CDP Bridge       │  │
│  │  ws://localhost:9222            │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 2. API接口概述

### 2.1 基础信息

| 项目 | 说明 |
|------|------|
| **根路径** | `/api/browsers` |
| **端口** | 8080（默认） |
| **内容类型** | `application/json; charset=utf-8` |

### 2.2 核心接口列表

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取列表 | GET | `/api/browsers/` | 获取浏览器列表 |
| 获取详情 | GET | `/api/browsers/{id}` | 获取浏览器详情 |
| 创建 | POST | `/api/browsers/` | 创建浏览器 |
| 删除 | DELETE | `/api/browsers/{id}` | 删除浏览器 |
| 启动 | POST | `/api/browsers/{id}/start` | 启动浏览器 |
| 停止 | POST | `/api/browsers/{id}/stop` | 停止浏览器 |
| 截图 | GET | `/api/browsers/{id}/screenshot` | 获取截图 |
| 打开URL | POST | `/api/browsers/{id}/open` | 打开指定URL |
| 执行脚本 | POST | `/api/browsers/{id}/execute` | 执行JavaScript |

### 2.3 响应格式

```json
// 成功响应
{
  "success": true,
  "message": "操作成功",
  "data": {...},
  "timestamp": "2026-08-12T10:00:00Z"
}

// 失败响应
{
  "success": false,
  "message": "错误信息",
  "errors": ["详细错误1", "详细错误2"],
  "timestamp": "2026-08-12T10:00:00Z"
}
```

---

## 3. 环境配置

### 3.1 项目结构

```
suiyu_langchain/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI主应用
│   ├── suiyu_client.py      # Suiyu API客户端
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── browser_tools.py # 浏览器操作工具
│   │   └── proxy_tools.py   # 代理管理工具
│   └── agent/
│       ├── __init__.py
│       └── browser_agent.py  # LangChain Agent
├── config/
│   └── __init__.py
│   └── settings.py          # 配置管理
├── requirements.txt
├── Dockerfile
└── README.md
```

### 3.2 依赖文件

```txt
# requirements.txt
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

### 3.3 配置管理

```python
# config/settings.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置"""

    # Suiyu API配置
    suiyu_api_url: str = "http://localhost:8080"
    suiyu_api_key: Optional[str] = None  # 如果API需要认证

    # MiniMax LLM配置
    minimax_api_key: str
    minimax_base_url: str = "https://minnimax.chat/v1"
    minimax_model: str = "MiniMax-M2.7"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

```bash
# .env
# Suiyu API
SUIYU_API_URL=http://localhost:8080
SUIYU_API_KEY=your_api_key_if_needed

# MiniMax LLM
MINIMAX_API_KEY=gw-f43c25a3-d060-44ea-8f26-46d0a0033f3c
MINIMAX_BASE_URL=https://minnimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
```

---

## 4. Suiyu API客户端封装

### 4.1 API客户端基础类

```python
# app/suiyu_client.py
import httpx
import asyncio
from typing import Optional, Dict, Any, List
from config.settings import settings

class SuiyuClient:
    """Suiyu指纹浏览器API客户端"""

    def __init__(
        self,
        base_url: str = None,
        api_key: str = None,
        timeout: int = 30
    ):
        self.base_url = base_url or settings.suiyu_api_url
        self.api_key = api_key or settings.suiyu_api_key
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        """异步上下文管理器入口"""
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=self.timeout
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出"""
        if self._client:
            await self._client.aclose()

    async def _request(
        self,
        method: str,
        path: str,
        **kwargs
    ) -> Dict[str, Any]:
        """发送HTTP请求"""
        if not self._client:
            raise RuntimeError("Client not initialized. Use 'async with' context.")

        response = await self._client.request(method, path, **kwargs)
        response.raise_for_status()
        return response.json()

    # ============ 浏览器操作 ============

    async def list_browsers(
        self,
        page: int = 0,
        page_size: int = 10,
        name: str = None,
        group_id: int = None
    ) -> Dict[str, Any]:
        """获取浏览器列表"""
        params = {"page": page, "pageSize": page_size}
        if name:
            params["name"] = name
        if group_id is not None:
            params["group_id"] = group_id

        return await self._request("GET", "/api/browsers/", params=params)

    async def get_browser(self, browser_id: int) -> Dict[str, Any]:
        """获取浏览器详情"""
        return await self._request("GET", f"/api/browsers/{browser_id}")

    async def create_browser(self, browser_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建浏览器"""
        return await self._request("POST", "/api/browsers/", json=browser_data)

    async def delete_browser(self, browser_id: int) -> Dict[str, Any]:
        """删除浏览器"""
        return await self._request("DELETE", f"/api/browsers/{browser_id}")

    async def start_browser(self, browser_id: int) -> Dict[str, Any]:
        """启动浏览器"""
        return await self._request("POST", f"/api/browsers/{browser_id}/start")

    async def stop_browser(self, browser_id: int) -> Dict[str, Any]:
        """停止浏览器"""
        return await self._request("POST", f"/api/browsers/{browser_id}/stop")

    async def screenshot(self, browser_id: int) -> bytes:
        """获取浏览器截图"""
        if not self._client:
            raise RuntimeError("Client not initialized")

        response = await self._client.get(
            f"/api/browsers/{browser_id}/screenshot"
        )
        response.raise_for_status()
        return response.content

    async def open_url(self, browser_id: int, url: str) -> Dict[str, Any]:
        """在浏览器中打开URL"""
        return await self._request(
            "POST",
            f"/api/browsers/{browser_id}/open",
            json={"url": url}
        )

    async def execute_script(
        self,
        browser_id: int,
        script: str
    ) -> Dict[str, Any]:
        """在浏览器中执行JavaScript"""
        return await self._request(
            "POST",
            f"/api/browsers/{browser_id}/execute",
            json={"script": script}
        )

    async def get_cookies(self, browser_id: int) -> Dict[str, Any]:
        """获取浏览器Cookie"""
        return await self._request("GET", f"/api/browsers/{browser_id}/cookies")

    async def set_cookies(
        self,
        browser_id: int,
        cookies: List[Dict]
    ) -> Dict[str, Any]:
        """设置浏览器Cookie"""
        return await self._request(
            "POST",
            f"/api/browsers/{browser_id}/cookies",
            json={"cookies": cookies}
        )

    # ============ 代理操作 ============

    async def list_proxies(self) -> Dict[str, Any]:
        """获取代理列表"""
        return await self._request("GET", "/api/proxy/")

    async def create_proxy(self, proxy_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建代理"""
        return await self._request("POST", "/api/proxy/", json=proxy_data)

    async def delete_proxy(self, proxy_id: int) -> Dict[str, Any]:
        """删除代理"""
        return await self._request("DELETE", f"/api/proxy/{proxy_id}")


# 全局客户端实例工厂
async def get_suiyu_client() -> SuiyuClient:
    """获取Suiyu客户端实例"""
    return SuiyuClient()
```

### 4.2 浏览器配置生成器

```python
# app/suiyu_client.py (续)

class BrowserConfigBuilder:
    """浏览器配置生成器"""

    def __init__(self):
        self.config = {
            "name": "",
            "group_id": 0,
            "proxy_id": 0,
            "proxy_type": 2,  # SOCKS5
            "platform": "custom",
            "parameters": {}
        }

    def set_name(self, name: str) -> "BrowserConfigBuilder":
        """设置名称"""
        self.config["name"] = name
        return self

    def set_proxy(
        self,
        proxy_id: int,
        proxy_type: int = 2
    ) -> "BrowserConfigBuilder":
        """设置代理"""
        self.config["proxy_id"] = proxy_id
        self.config["proxy_type"] = proxy_type
        return self

    def set_fingerprint(
        self,
        resolution: tuple = (1920, 1080),
        timezone: str = "Asia/Shanghai",
        locale: str = "zh-CN",
        user_agent: str = None
    ) -> "BrowserConfigBuilder":
        """设置指纹参数"""
        width, height = resolution
        self.config["parameters"].update({
            "resolution_width": width,
            "resolution_height": height,
            "timezone": timezone,
            "locale": locale,
            "useragent": user_agent or self._random_ua()
        })
        return self

    def set_platform(self, platform: str) -> "BrowserConfigBuilder":
        """设置平台（amazon, aliexpress等）"""
        self.config["platform"] = platform
        return self

    def set_webgl(self, vendor: str, renderer: str) -> "BrowserConfigBuilder":
        """设置WebGL指纹"""
        self.config["parameters"].update({
            "webgl_vendor": vendor,
            "webgl_render": renderer
        })
        return self

    def set_canvas(self, noise: str = None) -> "BrowserConfigBuilder":
        """设置Canvas指纹"""
        self.config["parameters"]["canvas"] = {
            "noise": noise or "random"
        }
        return self

    def build(self) -> Dict[str, Any]:
        """构建配置"""
        return self.config.copy()

    @staticmethod
    def _random_ua() -> str:
        """生成随机User-Agent"""
        import random
        ua_templates = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
        ]
        return random.choice(ua_templates)
```

---

## 5. LangChain Tools实现

### 5.1 浏览器操作工具

```python
# app/tools/browser_tools.py
from langchain.tools import tool
from typing import Optional
from app.suiyu_client import get_suiyu_client, SuiyuClient

# 全局客户端（可以复用）
_suiyu_client: Optional[SuiyuClient] = None

async def get_client() -> SuiyuClient:
    """获取Suiyu客户端"""
    global _suiyu_client
    if _suiyu_client is None:
        _suiyu_client = await get_suiyu_client()
    return _suiyu_client


@tool
async def list_browsers(
    page: int = 0,
    page_size: int = 10,
    name: str = None,
    group_id: int = None
) -> str:
    """
    列出Suiyu中的浏览器环境。
    用于查看当前有多少浏览器实例可用。

    参数:
        page: 页码，从0开始
        page_size: 每页数量（1-500）
        name: 按名称筛选（可选）
        group_id: 按分组ID筛选（可选）

    返回:
        浏览器列表信息，包含ID、名称、状态等
    """
    client = await get_client()
    async with client:
        result = await client.list_browsers(
            page=page,
            page_size=page_size,
            name=name,
            group_id=group_id
        )

        if not result.get("success"):
            return f"获取浏览器列表失败: {result.get('message')}"

        browsers = result.get("data", {}).get("browsers", {}).get("environments", [])
        total = result.get("data", {}).get("browsers", {}).get("total", 0)

        if not browsers:
            return "当前没有浏览器环境，请先创建一个"

        output = [f"共找到 {total} 个浏览器环境:\n"]
        for i, browser in enumerate(browsers[:10], 1):
            output.append(
                f"{i}. ID:{browser.get('id')} | "
                f"名称:{browser.get('name')} | "
                f"平台:{browser.get('platform')} | "
                f"分组:{browser.get('group_name', '默认')}"
            )

        return "\n".join(output)


@tool
async def create_browser(
    name: str,
    platform: str = "amazon",
    proxy_id: int = 0,
    proxy_type: int = 2,
    resolution: str = "1920x1080"
) -> str:
    """
    在Suiyu中创建一个新的浏览器环境。
    用于为特定任务创建专用的浏览器实例。

    参数:
        name: 浏览器名称，用于标识这个浏览器
        platform: 目标平台（如amazon, aliexpress, ebay等）
        proxy_id: 代理ID（如果是0则不使用代理）
        proxy_type: 代理类型（0=无代理, 1=HTTP, 2=SOCKS5）
        resolution: 分辨率（如1920x1080）

    返回:
        创建结果，包含浏览器ID
    """
    client = await get_client()

    # 解析分辨率
    width, height = map(int, resolution.lower().split("x"))

    browser_data = {
        "name": name,
        "group_id": 0,
        "proxy_id": proxy_id,
        "proxy_type": proxy_type,
        "platform": platform,
        "parameters": f'{{"resolution_width":{width},"resolution_height":{height}}}'
    }

    async with client:
        result = await client.create_browser(browser_data)

        if result.get("success"):
            return f"浏览器创建成功！名称: {name}"
        else:
            return f"创建失败: {result.get('message')}"


@tool
async def start_browser(browser_id: int) -> str:
    """
    启动指定的浏览器环境。
    启动后才能进行浏览网页等操作。

    参数:
        browser_id: 浏览器的ID（在列表中可以查到）

    返回:
        启动结果
    """
    client = await get_client()
    async with client:
        result = await client.start_browser(browser_id)

        if result.get("success"):
            return f"浏览器 {browser_id} 启动成功！"
        else:
            return f"启动失败: {result.get('message')}"


@tool
async def stop_browser(browser_id: int) -> str:
    """
    停止指定的浏览器环境。
    停止后可释放系统资源。

    参数:
        browser_id: 浏览器的ID

    返回:
        停止结果
    """
    client = await get_client()
    async with client:
        result = await client.stop_browser(browser_id)

        if result.get("success"):
            return f"浏览器 {browser_id} 已停止"
        else:
            return f"停止失败: {result.get('message')}"


@tool
async def open_website(browser_id: int, url: str) -> str:
    """
    在指定的浏览器中打开网页。
    用于访问特定网站获取信息。

    参数:
        browser_id: 浏览器的ID
        url: 要访问的网址（必须以http://或https://开头）

    返回:
        操作结果
    """
    client = await get_client()
    async with client:
        result = await client.open_url(browser_id, url)

        if result.get("success"):
            return f"已在浏览器 {browser_id} 中打开: {url}"
        else:
            return f"打开网页失败: {result.get('message')}"


@tool
async def get_website_content(browser_id: int, selector: str = "body") -> str:
    """
    获取浏览器中当前网页的内容。
    使用CSS选择器获取特定元素。

    参数:
        browser_id: 浏览器的ID
        selector: CSS选择器（默认body获取全部内容）

    返回:
        网页内容
    """
    client = await get_client()
    script = f"""
        () => {{
            const element = document.querySelector("{selector}");
            return element ? element.innerText.substring(0, 5000) : "未找到元素";
        }}
    """

    async with client:
        result = await client.execute_script(browser_id, script)

        if result.get("success"):
            content = result.get("data", {}).get("result", "")
            if content:
                return f"网页内容:\n{content[:3000]}"
            else:
                return "网页内容为空或无法获取"
        else:
            return f"获取内容失败: {result.get('message')}"


@tool
async def take_screenshot(browser_id: int) -> str:
    """
    对浏览器当前页面进行截图。
    用于保存网页的视觉快照。

    参数:
        browser_id: 浏览器的ID

    返回:
        截图保存路径
    """
    client = await get_client()
    async with client:
        try:
            image_bytes = await client.screenshot(browser_id)

            # 保存截图
            from datetime import datetime
            import os
            filename = f"/tmp/browser_{browser_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            os.makedirs("/tmp", exist_ok=True)

            with open(filename, "wb") as f:
                f.write(image_bytes)

            return f"截图已保存到: {filename}"

        except Exception as e:
            return f"截图失败: {str(e)}"


@tool
async def search_on_website(
    browser_id: int,
    query: str,
    search_box_selector: str = "input[name='q'],input[type='search'],input[type='text']"
) -> str:
    """
    在网页的搜索框中输入关键词并执行搜索。
    用于自动化搜索操作。

    参数:
        browser_id: 浏览器的ID
        query: 搜索关键词
        search_box_selector: 搜索框的CSS选择器

    返回:
        操作结果
    """
    client = await get_client()

    # 构建搜索脚本
    search_script = f"""
        () => {{
            const input = document.querySelector("{search_box_selector}");
            if (!input) {{
                return "未找到搜索框";
            }}
            input.value = "{query}";
            input.dispatchEvent(new Event('input', {{ bubbles: true }}));
            input.dispatchEvent(new Event('change', {{ bubbles: true }}));

            // 尝试按回车
            const form = input.closest('form');
            if (form) {{
                form.submit();
                return "已提交搜索表单";
            }}

            return "已在搜索框输入: {query}";
        }}
    """

    async with client:
        result = await client.execute_script(browser_id, search_script)

        if result.get("success"):
            return result.get("data", {}).get("result", "搜索操作完成")
        else:
            return f"搜索失败: {result.get('message')}"


@tool
async def delete_browser(browser_id: int) -> str:
    """
    删除指定的浏览器环境。
    删除后无法恢复，请谨慎使用。

    参数:
        browser_id: 浏览器的ID

    返回:
        删除结果
    """
    client = await get_client()
    async with client:
        result = await client.delete_browser(browser_id)

        if result.get("success"):
            return f"浏览器 {browser_id} 已删除"
        else:
            return f"删除失败: {result.get('message')}"
```

### 5.2 代理管理工具

```python
# app/tools/proxy_tools.py
from langchain.tools import tool
from app.suiyu_client import get_suiyu_client

@tool
async def list_proxies() -> str:
    """
    列出所有可用的代理。
    用于查看当前配置的代理列表。

    返回:
        代理列表信息
    """
    client = await get_suiyu_client()
    async with client:
        result = await client.list_proxies()

        if not result.get("success"):
            return f"获取代理列表失败: {result.get('message')}"

        proxies = result.get("data", {}).get("proxies", [])

        if not proxies:
            return "当前没有配置代理"

        output = [f"共找到 {len(proxies)} 个代理:\n"]
        for i, proxy in enumerate(proxies[:20], 1):
            output.append(
                f"{i}. ID:{proxy.get('id')} | "
                f"名称:{proxy.get('name')} | "
                f"地址:{proxy.get('host')}:{proxy.get('port')}"
            )

        return "\n".join(output)


@tool
async def create_proxy(
    name: str,
    host: str,
    port: int,
    proxy_type: int = 2,
    username: str = None,
    password: str = None
) -> str:
    """
    创建一个新的代理配置。

    参数:
        name: 代理名称
        host: 代理服务器地址
        port: 代理端口
        proxy_type: 代理类型（1=HTTP, 2=SOCKS5）
        username: 代理用户名（如果有）
        password: 代理密码（如果有）

    返回:
        创建结果
    """
    client = await get_suiyu_client()

    proxy_data = {
        "name": name,
        "host": host,
        "port": port,
        "type": proxy_type
    }

    if username:
        proxy_data["username"] = username
    if password:
        proxy_data["password"] = password

    async with client:
        result = await client.create_proxy(proxy_data)

        if result.get("success"):
            return f"代理创建成功！名称: {name}"
        else:
            return f"创建失败: {result.get('message')}"


@tool
async def delete_proxy(proxy_id: int) -> str:
    """
    删除指定的代理配置。

    参数:
        proxy_id: 代理的ID

    返回:
        删除结果
    """
    client = await get_suiyu_client()
    async with client:
        result = await client.delete_proxy(proxy_id)

        if result.get("success"):
            return f"代理 {proxy_id} 已删除"
        else:
            return f"删除失败: {result.get('message')}"
```

---

## 6. 完整的Agent示例

### 6.1 创建Agent

```python
# app/agent/browser_agent.py
from langchain.agents import AgentType, initialize_agent
from langchain.tools import Tool
from langchain.prompts import MessagesPlaceholder
from llm_config import get_llm
from app.tools.browser_tools import (
    list_browsers,
    create_browser,
    start_browser,
    stop_browser,
    open_website,
    get_website_content,
    take_screenshot,
    search_on_website,
    delete_browser
)
from app.tools.proxy_tools import (
    list_proxies,
    create_proxy,
    delete_proxy
)

def create_browser_agent():
    """创建浏览器控制Agent"""

    llm = get_llm()

    # 注册所有工具
    tools = [
        # 浏览器操作
        list_browsers,
        create_browser,
        start_browser,
        stop_browser,
        open_website,
        get_website_content,
        take_screenshot,
        search_on_website,
        delete_browser,
        # 代理管理
        list_proxies,
        create_proxy,
        delete_proxy
    ]

    # System prompt
    system_prompt = """你是一个浏览器自动化助手，可以控制Suiyu指纹浏览器。

你有以下能力：
1. 创建和管理多个浏览器环境
2. 在浏览器中打开网页、搜索内容
3. 获取网页内容、截图
4. 管理代理配置

使用指南：
1. 用户请求浏览网页时，先检查是否有可用浏览器
2. 如果需要新浏览器，先创建并启动
3. 打开URL后，等待页面加载
4. 获取内容后，分析并回答用户问题
5. 操作完成后，记得停止浏览器释放资源

注意：
- 浏览器ID是唯一标识，操作时需要指定正确的ID
- 创建浏览器时需要指定平台（如amazon, aliexpress等）
- 截图和内容会保存到临时目录"""

    # 创建Agent
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        max_iterations=15,
        handle_parsing_errors=True,
        system_message=system_prompt
    )

    return agent

if __name__ == "__main__":
    agent = create_browser_agent()

    # 测试1: 列出浏览器
    print("=" * 50)
    print("测试1: 列出浏览器")
    print("=" * 50)
    result = agent.run("列出所有浏览器环境")
    print(result)

    # 测试2: 搜索信息
    print("\n" + "=" * 50)
    print("测试2: 自动化搜索")
    print("=" * 50)
    result = agent.run("帮我访问Amazon并搜索iPhone 15的价格")
    print(result)
```

### 6.2 LLM配置（使用你的MiniMax）

```python
# app/llm_config.py
import os
from dotenv import load_dotenv

load_dotenv()

def get_llm():
    """获取MiniMax LLM实例"""
    from langchain_minimax import ChatMiniMax

    return ChatMiniMax(
        model=os.getenv("MINIMAX_MODEL", "MiniMax-M2.7"),
        base_url=os.getenv("MINIMAX_BASE_URL", "https://minnimax.chat/v1"),
        api_key=os.getenv("MINIMAX_API_KEY")
    )
```

---

## 7. FastAPI服务封装

### 7.1 主应用

```python
# app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
from app.agent.browser_agent import create_browser_agent
from app.suiyu_client import SuiyuClient, get_suiyu_client

# 全局Agent
agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期"""
    global agent

    print("🚀 初始化Suiyu客户端...")
    suiyu_client = await get_suiyu_client()

    print("🤖 初始化LangChain Agent...")
    agent = create_browser_agent()

    print("✅ 服务就绪!")

    yield

    print("👋 服务关闭")

app = FastAPI(
    title="Suiyu浏览器Agent API",
    description="基于LangChain和Suiyu指纹浏览器的智能助手",
    version="1.0.0",
    lifespan=lifespan
)

class QueryRequest(BaseModel):
    query: str
    browser_id: Optional[int] = None

class CreateBrowserRequest(BaseModel):
    name: str
    platform: str = "amazon"
    proxy_id: int = 0
    resolution: str = "1920x1080"

@app.post("/api/query")
async def query(request: QueryRequest):
    """向Agent发送查询"""
    try:
        response = agent.run(request.query)
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/browsers/create")
async def create_browser(request: CreateBrowserRequest):
    """创建浏览器"""
    client = await get_suiyu_client()
    async with client:
        result = await client.create_browser({
            "name": request.name,
            "group_id": 0,
            "proxy_id": request.proxy_id,
            "proxy_type": 2,
            "platform": request.platform,
            "parameters": f'{{"resolution_width":1920,"resolution_height":1080}}'
        })

        if result.get("success"):
            return {"success": True, "message": "浏览器创建成功"}
        else:
            raise HTTPException(status_code=400, detail=result.get("message"))

@app.get("/api/browsers")
async def list_browsers():
    """获取浏览器列表"""
    client = await get_suiyu_client()
    async with client:
        result = await client.list_browsers()

        if result.get("success"):
            return result.get("data", {})
        else:
            raise HTTPException(status_code=400, detail=result.get("message"))

@app.post("/api/browsers/{browser_id}/start")
async def start_browser(browser_id: int):
    """启动浏览器"""
    client = await get_suiyu_client()
    async with client:
        result = await client.start_browser(browser_id)

        if result.get("success"):
            return {"success": True, "message": "浏览器启动成功"}
        else:
            raise HTTPException(status_code=400, detail=result.get("message"))

@app.post("/api/browsers/{browser_id}/stop")
async def stop_browser(browser_id: int):
    """停止浏览器"""
    client = await get_suiyu_client()
    async with client:
        result = await client.stop_browser(browser_id)

        if result.get("success"):
            return {"success": True, "message": "浏览器已停止"}
        else:
            raise HTTPException(status_code=400, detail=result.get("message"))

@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 7.2 启动服务

```bash
# 启动API服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 总结

### 技术架构

```
用户请求
    ↓
FastAPI接收
    ↓
LangChain Agent（MiniMax驱动）
    ↓
Suiyu REST API
    ↓
Suiyu Browser Manager
    ↓
指纹浏览器实例
```

### 核心工具

| 工具 | 功能 |
|------|------|
| `list_browsers` | 查看所有浏览器 |
| `create_browser` | 创建新浏览器 |
| `start_browser` | 启动浏览器 |
| `open_website` | 打开网页 |
| `get_website_content` | 获取内容 |
| `take_screenshot` | 网页截图 |
| `search_on_website` | 自动搜索 |
| `stop_browser` | 停止浏览器 |

### 应用场景

- 🤖 **自动化研究助手**：自动搜索、整理网络信息
- 🛒 **电商监控**：监控商品价格、库存
- 📊 **数据采集**：批量抓取网页数据
- 🔍 **竞品分析**：自动化分析竞争对手网站

---

**📅 文章信息**：
- 作者：母亚含
- 发表日期：2026-08-12
- 阅读量：0

**🏷️ 标签**：`LangChain` `Suiyu` `指纹浏览器` `API集成` `MiniMax`
