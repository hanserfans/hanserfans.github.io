"""
智能体辅助写作系统
基于你学习的智能体概念，实现一个博客写作辅助智能体
"""

import os
import json
import re
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path


class WritingAgent:
    """博客写作辅助智能体"""

    def __init__(self, blog_path: str):
        self.blog_path = Path(blog_path)
        self.posts_path = self.blog_path / "_posts"
        self.memory = self.load_memory()
        self.tools = self.register_tools()

    def load_memory(self) -> Dict:
        """加载智能体记忆"""
        memory_file = self.blog_path / ".writing_agent_memory.json"
        if memory_file.exists():
            with open(memory_file, 'r', encoding='utf-8') as f:
                return json.load(f)

        return {
            "existing_posts": [],
            "writing_style": {},
            "common_tags": [],
            "learning_progress": {},
            "last_updated": None
        }

    def save_memory(self):
        """保存智能体记忆"""
        self.memory["last_updated"] = datetime.now().isoformat()
        memory_file = self.blog_path / ".writing_agent_memory.json"
        with open(memory_file, 'w', encoding='utf-8') as f:
            json.dump(self.memory, f, ensure_ascii=False, indent=2)

    def register_tools(self) -> Dict:
        """注册可用工具"""
        return {
            "analyze_existing_posts": self.analyze_existing_posts,
            "generate_post_structure": self.generate_post_structure,
            "suggest_tags": self.suggest_tags,
            "format_content": self.format_content,
            "create_post_file": self.create_post_file,
            "update_learning_log": self.update_learning_log
        }

    def analyze_existing_posts(self) -> Dict:
        """分析现有文章，学习写作风格"""
        print("🔍 分析现有文章...")

        posts = list(self.posts_path.glob("*.md"))
        self.memory["existing_posts"] = []

        style_analysis = {
            "avg_length": 0,
            "common_structure": [],
            "header_images": [],
            "tag_frequency": {}
        }

        for post in posts:
            try:
                content = post.read_text(encoding='utf-8')
                self.memory["existing_posts"].append(post.name)

                # 分析标题和标签
                if "---" in content:
                    front_matter = content.split("---")[1]
                    tags = re.findall(r'tags:\s*\n(?:-\s*(.+)\n)+', front_matter)

                    for tag_list in tags:
                        tags_list = [t.strip() for t in tag_list.split('\n') if t.strip().startswith('-')]
                        for tag in tags_list:
                            tag_name = tag.replace('-', '').strip()
                            self.memory["tag_frequency"][tag_name] = \
                                self.memory["tag_frequency"].get(tag_name, 0) + 1

            except Exception as e:
                print(f"⚠️  处理文章 {post.name} 时出错: {e}")

        self.save_memory()
        return {"status": "completed", "analyzed_posts": len(posts)}

    def generate_post_structure(self, title: str, subtitle: str = "",
                                tags: List[str] = None) -> str:
        """生成文章结构"""
        today = datetime.now().strftime("%Y-%m-%d")
        filename = f"{today}-{title.replace(' ', '-')}.md"

        # 推荐标签
        if not tags:
            tags = self.suggest_tags(title)

        # 生成 front matter
        front_matter = f"""---
layout:     post
title:      {title}
subtitle:   "{subtitle}"
date:       {today}
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
"""

        for tag in tags:
            front_matter += f"    - {tag}\n"

        front_matter += """---

> "这里可以写一句开篇引用"

## 前言

这里是前言部分...

## 正文

### 主要内容

在这里开始写你的文章内容...

---

## 结语

总结一下文章要点...

—— BY 记于 """ + today.split('-')[0] + "." + today.split('-')[1]

        return front_matter

    def suggest_tags(self, title: str, content: str = "") -> List[str]:
        """推荐标签"""
        # 基于现有文章的标签频率
        common_tags = ["AI", "学习日志", "智能体", "技术", "规划", "生活"]

        # 根据标题关键词推荐
        title_lower = title.lower()

        suggested = []
        if "智能" in title or "ai" in title_lower or "agent" in title_lower:
            suggested.extend(["AI", "智能体"])
        elif "学习" in title or "日志" in title:
            suggested.extend(["学习日志"])
        elif "规划" in title or "计划" in title:
            suggested.extend(["规划", "生活"])

        if not suggested:
            suggested = ["技术", "生活"]

        return list(set(suggested))

    def format_content(self, content: str) -> str:
        """格式化文章内容"""
        # 统一标题格式
        content = re.sub(r'#+\s*(.+)', lambda m: '#' * len(m.group(0).split()[0]) + ' ' + m.group(1), content)

        # 确保代码块格式正确
        content = re.sub(r'```(\w*)\n', r'```\1\n', content)

        # 优化列表格式
        content = re.sub(r'^\s*[-*]\s+', '- ', content, flags=re.MULTILINE)

        return content

    def create_post_file(self, title: str, subtitle: str = "",
                        content: str = "", tags: List[str] = None) -> str:
        """创建新文章文件"""
        structure = self.generate_post_structure(title, subtitle, tags)

        if content:
            # 将内容插入到正文部分
            parts = structure.split("## 正文")
            if len(parts) == 2:
                structure = parts[0] + "## 正文\n" + content + "\n" + parts[1]

        # 生成文件名
        today = datetime.now().strftime("%Y-%m-%d")
        safe_title = re.sub(r'[^\w\u4e00-\u9fff-]', '', title.replace(' ', '-'))
        filename = f"{today}-{safe_title}.md"
        filepath = self.posts_path / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(structure)

        print(f"✅ 文章已创建: {filename}")
        return str(filepath)

    def update_learning_log(self, topic: str, notes: str, progress: str = "进行中"):
        """更新学习日志"""
        learning_entry = {
            "topic": topic,
            "notes": notes,
            "progress": progress,
            "timestamp": datetime.now().isoformat()
        }

        if "learning_progress" not in self.memory:
            self.memory["learning_progress"] = []

        self.memory["learning_progress"].append(learning_entry)
        self.save_memory()

        return {"status": "updated", "entry": learning_entry}

    def assist_writing(self, user_input: str) -> Dict:
        """智能体主循环 - 协助写作"""

        # 感知：理解用户需求
        if "新文章" in user_input or "创建" in user_input:
            # 提取标题
            title_match = re.search(r'标题[:：]\s*(.+)', user_input)
            title = title_match.group(1).strip() if title_match else "未命名文章"

            # 提取副标题
            subtitle_match = re.search(r'副标题[:：]\s*(.+)', user_input)
            subtitle = subtitle_match.group(1).strip() if subtitle_match else ""

            # 执行：创建文章
            filepath = self.create_post_file(title, subtitle)

            return {
                "action": "create_post",
                "result": filepath,
                "message": f"已为你创建文章 '{title}'，文件位于: {filepath}"
            }

        elif "学习" in user_input or "笔记" in user_input:
            # 提取学习主题
            topic_match = re.search(r'主题[:：]\s*(.+)', user_input)
            topic = topic_match.group(1).strip() if topic_match else "新学习内容"

            # 提取笔记内容
            notes_match = re.search(r'笔记[:：](.+)', user_input, re.DOTALL)
            notes = notes_match.group(1).strip() if notes_match else user_input

            # 更新学习日志
            result = self.update_learning_log(topic, notes)

            return {
                "action": "update_learning",
                "result": result,
                "message": f"学习日志已更新: {topic}"
            }

        else:
            return {
                "action": "unknown",
                "message": "我理解你想做什么，请明确说：创建文章 或 记录学习笔记"
            }


def main():
    """主函数 - 演示智能体使用"""

    # 初始化智能体
    blog_path = "/Users/mac/git/hanserfans.github.io"
    agent = WritingAgent(blog_path)

    print("🤖 智能体辅助写作系统已启动")
    print("=" * 50)

    # 1. 分析现有文章
    print("📚 正在学习你的写作风格...")
    analysis = agent.analyze_existing_posts()
    print(f"✅ 分析完成，已处理 {analysis['analyzed_posts']} 篇文章")

    # 2. 示例：创建新文章
    print("\n" + "=" * 50)
    print("📝 示例：创建智能体开发文章")

    test_content = """
### 智能体的核心组件

- **感知模块**：获取环境信息
- **思考模块**：处理信息并做出决策
- **行动模块**：执行具体操作

这是一个示例内容...
"""

    agent.create_post_file(
        title="智能体开发实践",
        subtitle="从理论到应用的探索",
        content=test_content,
        tags=["AI", "智能体", "实践"]
    )

    # 3. 示例：记录学习笔记
    print("\n" + "=" * 50)
    print("📖 示例：记录学习笔记")

    learning_notes = """
- 理解了 PEAS 模型
- 掌握了智能体与环境交互的循环
- 学习了工具调用的实现方式
"""

    agent.update_learning_log(
        topic="智能体基础概念",
        notes=learning_notes,
        progress="已完成"
    )

    print("\n" + "=" * 50)
    print("🎉 智能体演示完成！")


if __name__ == "__main__":
    main()