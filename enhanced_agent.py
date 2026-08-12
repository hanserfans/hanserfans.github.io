"""
智能体API集成模块
支持MiniMax、Tavily搜索等API调用
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime


class AIProvider:
    """AI服务提供商基类"""

    def __init__(self, api_key: str, base_url: str = "", model: str = ""):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model

    def generate_content(self, prompt: str, **kwargs) -> str:
        """生成内容的抽象方法"""
        raise NotImplementedError


class MiniMaxProvider(AIProvider):
    """MiniMax AI服务提供商（兼容OpenAI格式）"""

    def __init__(self, api_key: str, model: str = "MiniMax-M2.7", base_url: str = ""):
        # 默认使用MiniMax API地址
        if not base_url:
            base_url = "https://minnimax.chat/v1"
        super().__init__(api_key, base_url, model)

    def generate_content(self, prompt: str, max_tokens: int = 2000,
                        temperature: float = 0.7) -> str:
        """使用MiniMax生成内容"""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        try:
            # 添加重试机制和增加超时时间
            import time
            max_retries = 3
            retry_delay = 2  # 秒

            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=data,
                        timeout=120  # 增加超时到120秒
                    )

                    if response.status_code == 200:
                        result = response.json()
                        return result["choices"][0]["message"]["content"]
                    elif response.status_code == 429:  # 速率限制
                        if attempt < max_retries - 1:
                            print(f"⚠️ API速率限制，等待{retry_delay}秒后重试...")
                            time.sleep(retry_delay)
                            continue
                        else:
                            return f"API调用失败: 速率限制 (429)，请稍后再试"
                    else:
                        return f"API调用失败: {response.status_code} - {response.text}"

                except requests.exceptions.Timeout as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ 请求超时，第{attempt + 1}次重试...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        return f"生成内容时出错: 请求超时，请检查网络连接或稍后再试"

                except requests.exceptions.ConnectionError as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ 网络连接错误，第{attempt + 1}次重试...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        return f"生成内容时出错: 网络连接失败，请检查网络设置"

            return f"生成内容时出错: 达到最大重试次数"

        except Exception as e:
            return f"生成内容时出错: {str(e)}"


class TavilySearchProvider:
    """Tavily搜索服务提供商"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.tavily.com/search"

    def search(self, query: str, max_results: int = 5) -> Dict:
        """执行网络搜索"""

        headers = {
            "Content-Type": "application/json"
        }

        data = {
            "api_key": self.api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": "basic",
            "include_answer": True,
            "include_raw_content": False
        }

        try:
            # 添加重试机制和增加超时时间
            import time
            max_retries = 3
            retry_delay = 1  # 秒

            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        self.base_url,
                        headers=headers,
                        json=data,
                        timeout=60  # 增加超时到60秒
                    )

                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:  # 速率限制
                        if attempt < max_retries - 1:
                            print(f"⚠️ 搜索API速率限制，等待{retry_delay}秒后重试...")
                            time.sleep(retry_delay)
                            continue
                        else:
                            return {"error": "搜索API速率限制，请稍后再试"}
                    else:
                        return {"error": f"搜索失败: {response.status_code}"}

                except requests.exceptions.Timeout as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ 搜索请求超时，第{attempt + 1}次重试...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        return {"error": "搜索请求超时，请检查网络连接"}

                except requests.exceptions.ConnectionError as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ 搜索网络连接错误，第{attempt + 1}次重试...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        return {"error": "搜索网络连接失败，请检查网络设置"}

            return {"error": "搜索请求失败: 达到最大重试次数"}

        except Exception as e:
            return {"error": f"搜索时出错: {str(e)}"}


class EnhancedWritingAgent:
    """增强版智能体写作系统 - 集成AI能力"""

    def __init__(self, blog_path: str, api_keys: Dict[str, str]):
        self.blog_path = blog_path
        self.api_keys = api_keys

        # 初始化AI服务（统一使用MiniMax）
        self.ai_client = None
        self.tavily_search = None

        # MiniMax AI服务初始化
        if api_keys.get("ai_api_key") and api_keys.get("ai_base_url"):
            self.ai_client = MiniMaxProvider(
                api_key=api_keys["ai_api_key"],
                model=api_keys.get("ai_model", "MiniMax-M2.7"),
                base_url=api_keys.get("ai_base_url")
            )
            print(f"✅ MiniMax AI服务已连接")
            print(f"   Base URL: {api_keys.get('ai_base_url')}")
            print(f"   Model: {api_keys.get('ai_model', 'MiniMax-M2.7')}")

        if "tavily" in api_keys and api_keys["tavily"]:
            self.tavily_search = TavilySearchProvider(api_key=api_keys["tavily"])
            print("✅ Tavily搜索服务已连接")

        # 加载智能体记忆
        self.memory = self.load_memory()

    def load_memory(self) -> Dict:
        """加载智能体记忆"""
        try:
            memory_file = f"{self.blog_path}/.enhanced_agent_memory.json"
            if os.path.exists(memory_file):
                with open(memory_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"⚠️  加载记忆时出错: {e}")

        return {
            "created_posts": [],
            "search_history": [],
            "content_templates": {},
            "learning_topics": [],
            "last_updated": None
        }

    def save_memory(self):
        """保存智能体记忆"""
        try:
            self.memory["last_updated"] = datetime.now().isoformat()
            memory_file = f"{self.blog_path}/.enhanced_agent_memory.json"
            with open(memory_file, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️  保存记忆时出错: {e}")

    def generate_article_content(self, topic: str, style: str = "技术博客") -> str:
        """使用AI生成文章内容"""

        if not self.ai_client:
            return "⚠️  未配置AI服务，无法自动生成内容"

        prompt = f"""
请为一篇关于"{topic}"的{style}文章撰写内容。

要求：
1. 语言简洁专业
2. 结构清晰，包含引言、正文、结论
3. 内容要有深度，避免空洞
4. 使用Markdown格式
5. 适合博客文章的语气

请直接输出文章内容，不要包含其他说明。
"""

        print(f"🤖 正在使用MiniMax AI生成关于'{topic}'的文章内容...")
        content = self.ai_client.generate_content(prompt)

        # 记录生成历史
        self.memory["created_posts"].append({
            "topic": topic,
            "style": style,
            "timestamp": datetime.now().isoformat()
        })
        self.save_memory()

        return content

    def research_topic(self, topic: str) -> Dict:
        """使用搜索API研究主题"""

        if not self.tavily_search:
            return {"error": "未配置搜索服务"}

        print(f"🔍 正在搜索关于'{topic}'的信息...")
        search_results = self.tavily_search.search(topic)

        # 记录搜索历史
        self.memory["search_history"].append({
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "results_count": len(search_results.get("results", [])) if "results" in search_results else 0
        })
        self.save_memory()

        return search_results

    def generate_article_with_research(self, topic: str, style: str = "技术博客") -> str:
        """基于搜索研究生成文章"""

        # 1. 先搜索相关信息
        search_results = self.research_topic(topic)

        research_context = ""
        if "results" in search_results and search_results["results"]:
            research_context = "\n\n参考信息：\n"
            for i, result in enumerate(search_results["results"][:3], 1):
                research_context += f"{i}. {result.get('title', '')}\n"
                research_context += f"   {result.get('content', '')[:200]}...\n\n"

        # 2. 基于研究结果生成文章
        if self.ai_client:
            prompt = f"""
请为一篇关于"{topic}"的{style}文章撰写内容。

{research_context}

要求：
1. 基于上述参考信息，结合你的知识库
2. 语言简洁专业，结构清晰
3. 包含引言、主要内容、结论
4. 使用Markdown格式
5. 适合博客文章的语气

请直接输出文章内容。
"""

            print(f"🤖 正在基于研究结果生成文章...")
            content = self.ai_client.generate_content(prompt)

            return content
        else:
            return "⚠️  未配置AI服务，无法生成内容"

    def create_ai_generated_post(self, title: str, topic: str,
                                 subtitle: str = "", tags: List[str] = None) -> str:
        """创建AI生成的文章"""

        print(f"📝 开始创建AI辅助文章: {title}")

        # 生成文章内容
        content = self.generate_article_with_research(topic)

        # 生成文章文件
        today = datetime.now().strftime("%Y-%m-%d")
        safe_title = title.replace(' ', '-')
        safe_title = ''.join(c for c in safe_title if c.isalnum() or c in ('-', '_'))

        filename = f"{today}-{safe_title}.md"
        filepath = f"{self.blog_path}/_posts/{filename}"

        # 生成完整的文章结构
        article_structure = f"""---
layout:     post
title:      {title}
subtitle:   "{subtitle}"
date:       {today}
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
"""

        # 添加标签
        if tags:
            for tag in tags:
                article_structure += f"    - {tag}\n"
        else:
            article_structure += f"    - AI\n    - 智能体\n    - 自动生成\n"

        article_structure += f"""---

> "AI辅助创作，结合人类智慧"

## 前言

本文由智能体系统辅助生成，结合了AI内容生成和网络搜索研究。

## 正文

{content}

---

## 结语

感谢智能体系统的协助，让创作过程更加高效。

—— BY & AI 协作完成于 {today.split('-')[0]}.{today.split('-')[1]}
"""

        # 保存文章
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(article_structure)

        print(f"✅ AI辅助文章已创建: {filename}")

        # 更新记忆
        self.memory["created_posts"].append({
            "filename": filename,
            "title": title,
            "method": "ai_assisted",
            "timestamp": datetime.now().isoformat()
        })
        self.save_memory()

        return filepath


def main():
    """演示增强版智能体功能"""

    # API配置（使用MiniMax）
    api_keys = {
        "ai_api_key": "gw-f43c25a3-d060-44ea-8f26-46d0a0033f3c",
        "ai_base_url": "https://minnimax.chat/v1",
        "ai_model": "MiniMax-M2.7",
        "tavily": "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"
    }

    # 初始化增强版智能体
    blog_path = "/Users/mac/git/hanserfans.github.io"
    agent = EnhancedWritingAgent(blog_path, api_keys)

    print("🤖 增强版智能体写作系统已启动")
    print("=" * 60)

    # 演示1：基于研究生成文章
    print("\n📝 示例1：创建AI辅助研究文章")

    agent.create_ai_generated_post(
        title="智能体在软件开发中的应用",
        topic="智能体在软件开发中的应用",
        subtitle="AI如何改变我们的开发方式",
        tags=["AI", "智能体", "软件开发", "实践"]
    )

    # 演示2：内容生成
    print("\n" + "=" * 60)
    print("🤖 示例2：直接生成内容")

    content = agent.generate_article_content(
        "智能体记忆管理的最佳实践",
        style="技术博客"
    )

    print("生成的内容预览：")
    print(content[:500] + "..." if len(content) > 500 else content)

    # 演示3：网络搜索
    print("\n" + "=" * 60)
    print("🔍 示例3：主题研究")

    research = agent.research_topic("智能体开发最新进展")
    if "results" in research and research["results"]:
        print(f"找到 {len(research['results'])} 条相关结果:")
        for i, result in enumerate(research["results"][:2], 1):
            print(f"{i}. {result.get('title', 'N/A')}")

    print("\n" + "=" * 60)
    print("🎉 增强版智能体演示完成！")


if __name__ == "__main__":
    main()