"""
API配置管理 - 支持多种AI服务提供商
"""

import os
from pathlib import Path
from typing import Dict, Optional, List


class AIProviderConfig:
    """AI服务提供商配置"""

    def __init__(self, name: str, api_key: str, base_url: str, model: str, enabled: bool = True):
        self.name = name
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.enabled = enabled

    def __repr__(self):
        return f"AIProviderConfig(name={self.name}, model={self.model}, enabled={self.enabled})"


class APIConfig:
    """API配置管理器"""

    # 支持的AI提供商
    SUPPORTED_PROVIDERS = {
        "minimax": {
            "name": "MiniMax",
            "default_base_url": "https://minnimax.chat/v1",
            "default_model": "MiniMax-M2.7",
            "available_models": ["MiniMax-M2.7", "MiniMax-M2.7-highspeed", "MiniMax-M3"]
        },
        "openai": {
            "name": "OpenAI",
            "default_base_url": "https://api.openai.com/v1",
            "default_model": "gpt-3.5-turbo",
            "available_models": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]
        }
    }

    def __init__(self, env_file: str = ".env"):
        self.env_file = env_file
        self.config = self.load_config()
        self.providers = self._load_providers()

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

        # 从环境变量加载（环境变量优先）
        config.update({
            # MiniMax（当前唯一使用的AI服务）
            "minimax_api_key": os.getenv("MINIMAX_API_KEY", config.get("MINIMAX_API_KEY", "")),
            "minimax_base_url": os.getenv("MINIMAX_BASE_URL", config.get("MINIMAX_BASE_URL", "https://minnimax.chat/v1")),
            "minimax_model": os.getenv("MINIMAX_MODEL", config.get("MINIMAX_MODEL", "MiniMax-M2.7")),

            # OpenAI（保留作为备选）
            "openai_api_key": os.getenv("OPENAI_API_KEY", config.get("OPENAI_API_KEY", "")),
            "openai_base_url": os.getenv("OPENAI_BASE_URL", config.get("OPENAI_BASE_URL", "https://api.openai.com/v1")),
            "openai_model": os.getenv("OPENAI_MODEL", config.get("OPENAI_MODEL", "gpt-3.5-turbo")),

            # Tavily搜索
            "tavily": os.getenv("TAVILY_API_KEY", config.get("TAVILY_API_KEY", "")),

            # 博客路径
            "blog_path": os.getenv("BLOG_PATH", config.get("BLOG_PATH", "/Users/mac/git/hanserfans.github.io")),

            # 当前提供商（固定为minimax）
            "current_provider": "minimax"
        })

        return config

    def _load_providers(self) -> Dict[str, AIProviderConfig]:
        """加载所有AI提供商配置"""
        providers = {}

        # MiniMax（唯一配置）
        if self.config.get("minimax_api_key"):
            providers["minimax"] = AIProviderConfig(
                name="MiniMax",
                api_key=self.config["minimax_api_key"],
                base_url=self.config.get("minimax_base_url", "https://minnimax.chat/v1"),
                model=self.config.get("minimax_model", "MiniMax-M2.7"),
                enabled=True
            )

        # OpenAI（备选）
        if self.config.get("openai_api_key"):
            providers["openai"] = AIProviderConfig(
                name="OpenAI",
                api_key=self.config["openai_api_key"],
                base_url=self.config.get("openai_base_url", "https://api.openai.com/v1"),
                model=self.config.get("openai_model", "gpt-3.5-turbo"),
                enabled=self.config.get("current_provider") == "openai"
            )

        return providers

    def get(self, key: str, default: str = "") -> str:
        """获取配置项"""
        return self.config.get(key, default)

    def get_current_provider(self) -> Optional[AIProviderConfig]:
        """获取当前AI提供商"""
        current = self.config.get("current_provider", "minimax")
        return self.providers.get(current)

    def get_api_keys(self) -> Dict[str, any]:
        """获取API密钥配置（用于智能体初始化）"""
        current_provider = self.get_current_provider()

        if current_provider:
            return {
                "ai_api_key": current_provider.api_key,
                "ai_model": current_provider.model,
                "ai_base_url": current_provider.base_url,
                "tavily": self.config.get("tavily", ""),
                "blog_path": self.config.get("blog_path", "")
            }

        # 回退：如果没有当前提供商，返回第一个可用的
        if self.providers:
            first_provider = next(iter(self.providers.values()))
            return {
                "ai_api_key": first_provider.api_key,
                "ai_model": first_provider.model,
                "ai_base_url": first_provider.base_url,
                "tavily": self.config.get("tavily", ""),
                "blog_path": self.config.get("blog_path", "")
            }

        return {
            "ai_api_key": "",
            "ai_model": "MiniMax-M2.7",
            "ai_base_url": "https://minnimax.chat/v1",
            "tavily": self.config.get("tavily", ""),
            "blog_path": self.config.get("blog_path", "")
        }

    def list_available_providers(self) -> List[str]:
        """列出所有可用的AI提供商"""
        return [name for name, config in self.providers.items() if config.enabled]

    def list_all_providers(self) -> Dict[str, AIProviderConfig]:
        """列出所有已配置的AI提供商"""
        return self.providers

    def is_valid(self) -> bool:
        """检查配置是否有效"""
        return len(self.providers) > 0 and bool(self.config.get("tavily"))

    def validate_api_keys(self) -> Dict[str, bool]:
        """验证API密钥格式"""
        validation = {}

        for name, provider in self.providers.items():
            validation[name] = bool(provider.api_key and len(provider.api_key) > 10)

        # Tavily密钥格式检查
        tavily_key = self.config.get("tavily", "")
        validation["tavily"] = bool(tavily_key and tavily_key.startswith("tvly-"))

        return validation

    def get_available_models(self, provider: str = None) -> List[str]:
        """获取可用模型列表"""
        if provider:
            info = self.SUPPORTED_PROVIDERS.get(provider, {})
            return info.get("available_models", [])

        # 返回当前提供商的可选模型
        current = self.get_current_provider()
        if current:
            for name, info in self.SUPPORTED_PROVIDERS.items():
                if name in current.name.lower() or name == current.name:
                    return info.get("available_models", [])

        return []


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
# 支持多种AI服务提供商配置

# ========================================
# MiniMax AI配置（推荐）
# ========================================
MINIMAX_API_KEY=your_minimax_api_key_here
MINIMAX_BASE_URL=https://minnimax.chat/v1
# 可用模型：MiniMax-M2.7, MiniMax-M2.7-highspeed, MiniMax-M3
MINIMAX_MODEL=MiniMax-M2.7

# ========================================
# 智谱AI配置（备选）
# ========================================
ZHIPU_API_KEY=
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4
ZHIPU_MODEL=glm-4-flash

# ========================================
# OpenAI配置（备选）
# ========================================
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo

# ========================================
# 搜索服务配置
# ========================================
TAVILY_API_KEY=your_tavily_api_key_here

# ========================================
# 应用配置
# ========================================
BLOG_PATH=/Users/mac/git/hanserfans.github.io

# 当前使用的AI提供商（minimax/zhipu/openai）
CURRENT_AI_PROVIDER=minimax
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

    # 列出所有配置的提供商
    providers = config.list_all_providers()
    if providers:
        print("\n📦 已配置的AI提供商:")
        for name, provider in providers.items():
            status = "✅ 已启用" if provider.enabled else "⚪ 已配置"
            print(f"   [{status}] {provider.name}")
            print(f"      模型: {provider.model}")
            print(f"      API: {provider.base_url}")
    else:
        print("❌ 未配置任何AI提供商")

    # 验证Tavily
    tavily_key = config.get("tavily")
    if tavily_key and tavily_key.startswith("tvly-"):
        print(f"\n✅ Tavily搜索: 已配置")
    else:
        print(f"\n❌ Tavily搜索: 未配置或格式错误")

    # 验证博客路径
    blog_path = config.get("blog_path")
    if Path(blog_path).exists():
        print(f"\n✅ 博客路径: {blog_path}")
    else:
        print(f"\n❌ 博客路径: {blog_path} 不存在")

    # 显示当前提供商
    current = config.get_current_provider()
    if current:
        print(f"\n🎯 当前使用的AI: {current.name} ({current.model})")
        available_models = config.get_available_models()
        if available_models:
            print(f"   可用模型: {', '.join(available_models)}")

    print("=" * 50)

    return config.is_valid()


if __name__ == "__main__":
    # 验证配置
    if validate_environment():
        print("\n🎉 配置验证通过！")
    else:
        print("\n⚠️  配置存在问题，请检查.env文件")
