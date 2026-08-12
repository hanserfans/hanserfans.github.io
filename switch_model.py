#!/usr/bin/env python3
"""
快速切换AI模型配置
"""

import sys
from pathlib import Path
from api_config import get_config


def switch_model(provider: str = None, model: str = None):
    """切换AI模型"""
    config = get_config()

    if not provider:
        # 显示当前配置
        print("\n🤖 AI模型切换工具")
        print("="*60)
        print(f"\n当前配置:")
        print(f"  AI提供商: {config.config.get('current_provider')}")

        current = config.get_current_provider()
        if current:
            print(f"  模型: {current.model}")
            print(f"  API: {current.base_url}")

        print(f"\n可用模型:")
        for provider_id, info in config.SUPPORTED_PROVIDERS.items():
            marker = "← 当前" if config.config.get("current_provider") == provider_id else ""
            print(f"\n  [{provider_id}] {info['name']} {marker}")
            print(f"    可用模型:")
            for m in info['available_models']:
                print(f"      • {m}")

        print("\n" + "="*60)
        print("使用方法:")
        print("  python3 switch_model.py minimax MiniMax-M2.7-highspeed")
        print("  python3 switch_model.py zhipu glm-4-flash")
        print("  python3 switch_model.py openai gpt-4")
        return

    # 验证提供商
    if provider not in config.SUPPORTED_PROVIDERS:
        print(f"❌ 不支持的AI提供商: {provider}")
        print(f"支持的提供商: {', '.join(config.SUPPORTED_PROVIDERS.keys())}")
        return

    provider_info = config.SUPPORTED_PROVIDERS[provider]

    # 如果没有指定模型，显示可用模型
    if not model:
        print(f"\n{provider_info['name']} 可用模型:")
        for m in provider_info['available_models']:
            print(f"  • {m}")
        return

    # 验证模型
    if model not in provider_info['available_models']:
        print(f"❌ 不支持的模型: {model}")
        print(f"{provider_info['name']} 可用模型:")
        for m in provider_info['available_models']:
            print(f"  • {m}")
        return

    # 读取.env文件
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env 文件不存在")
        return

    # 读取现有内容
    with open(env_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 更新配置
    new_lines = []
    model_key = f"{provider.upper()}_MODEL"

    for line in lines:
        stripped = line.strip()

        # 更新当前提供商
        if stripped.startswith("CURRENT_AI_PROVIDER="):
            new_lines.append(f"CURRENT_AI_PROVIDER={provider}\n")
            print(f"✅ 切换到: {provider_info['name']}")

        # 更新模型
        elif stripped.startswith(f"{model_key}="):
            new_lines.append(f"{model_key}={model}\n")
            print(f"✅ 模型切换为: {model}")

        # 更新base_url（如果需要）
        elif stripped.startswith(f"{provider.upper()}_BASE_URL=") and not stripped.endswith(provider_info['default_base_url']):
            new_lines.append(f"{provider.upper()}_BASE_URL={provider_info['default_base_url']}\n")
            print(f"✅ API地址: {provider_info['default_base_url']}")

        else:
            new_lines.append(line)

    # 写回文件
    with open(env_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"\n🎉 配置已更新!")
    print(f"   提供商: {provider_info['name']}")
    print(f"   模型: {model}")
    print(f"\n📝 重启应用使配置生效")


if __name__ == "__main__":
    if len(sys.argv) > 2:
        switch_model(sys.argv[1], sys.argv[2])
    else:
        switch_model()
