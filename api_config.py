"""
API配置管理
"""

import os
from pathlib import Path
from typing import Dict, Optional


class APIConfig:
    """API配置管理器"""

    def __init__(self, env_file: str = ".env"):
        self.env_file = env_file
        self.config = self.load_config()

    def load_config(self) -> Dict[str, str]:
        """加载配置文件"""
        config = {}

        # 尝试从.env文件加载
        env_path = Path(self.env_file)
        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        config[key.strip()] = value.strip()

        # 尝试从环境变量加载
        config.update({
            "zhipu": os.getenv("ZHIPU_API_KEY", config.get("ZHIPU_API_KEY", "")),
            "zhipu_model": os.getenv("OPENAI_MODEL", config.get("OPENAI_MODEL", "glm-4-flash")),
            "zhipu_base_url": os.getenv("OPENAI_BASE_URL", config.get("OPENAI_BASE_URL", "https://open.bigmodel.cn/api/paas/v4")),
            "tavily": os.getenv("TAVILY_API_KEY", config.get("TAVILY_API_KEY", "")),
            "blog_path": os.getenv("BLOG_PATH", config.get("BLOG_PATH", "/Users/mac/git/hanserfans.github.io"))
        })

        return config

    def get(self, key: str, default: str = "") -> str:
        """获取配置项"""
        return self.config.get(key, default)

    def is_valid(self) -> bool:
        """检查配置是否有效"""
        required_keys = ["zhipu", "tavily", "blog_path"]
        return all(self.config.get(key) for key in required_keys)

    def validate_api_keys(self) -> Dict[str, bool]:
        """验证API密钥格式"""
        validation = {}

        # 智谱AI密钥格式检查
        zhipu_key = self.config.get("zhipu", "")
        if zhipu_key and "." in zhipu_key:
            validation["zhipu"] = True
        else:
            validation["zhipu"] = False

        # Tavily密钥格式检查
        tavily_key = self.config.get("tavily", "")
        if tavily_key and tavily_key.startswith("tvly-"):
            validation["tavily"] = True
        else:
            validation["tavily"] = False

        return validation


# 单例模式
_config_instance = None

def get_config() -> APIConfig:
    """获取配置实例"""
    global _config_instance
    if _config_instance is None:
        _config_instance = APIConfig()
    return _config_instance


def setup_env_file():
    """设置环境变量文件"""
    env_content = """# API配置文件
# 智谱AI配置
ZHIPU_API_KEY=your_zhipu_api_key_here
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4-flash

# Tavily搜索配置
TAVILY_API_KEY=your_tavily_api_key_here

# 博客路径
BLOG_PATH=/Users/mac/git/hanserfans.github.io
"""

    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ 已创建.env配置文件")
        print("📝 请编辑.env文件，填入你的API密钥")
    else:
        print("✅ .env配置文件已存在")


def validate_environment():
    """验证环境配置"""
    config = get_config()

    print("🔍 验证API配置...")
    print("=" * 50)

    # 验证智谱AI
    zhipu_key = config.get("zhipu")
    if zhipu_key and "." in zhipu_key:
        print(f"✅ 智谱AI: 已配置")
        print(f"   模型: {config.get('zhipu_model')}")
        print(f"   API地址: {config.get('zhipu_base_url')}")
    else:
        print(f"❌ 智谱AI: 未配置或格式错误")

    # 验证Tavily
    tavily_key = config.get("tavily")
    if tavily_key and tavily_key.startswith("tvly-"):
        print(f"✅ Tavily搜索: 已配置")
    else:
        print(f"❌ Tavily搜索: 未配置或格式错误")

    # 验证博客路径
    blog_path = config.get("blog_path")
    if Path(blog_path).exists():
        print(f"✅ 博客路径: {blog_path}")
    else:
        print(f"❌ 博客路径: {blog_path} 不存在")

    print("=" * 50)

    return config.is_valid()


if __name__ == "__main__":
    # 验证配置
    if validate_environment():
        print("🎉 配置验证通过！")
    else:
        print("⚠️  配置存在问题，请检查.env文件")