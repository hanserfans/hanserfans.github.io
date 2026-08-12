#!/usr/bin/env python3
"""
测试AI API连接
支持测试 MiniMax、智谱AI、OpenAI
"""

import requests
import json
from api_config import get_config


def test_ai_api(provider_name: str = None):
    """测试AI API连接"""
    config = get_config()

    if provider_name:
        # 测试指定提供商
        providers = {provider_name: config.providers.get(provider_name)}
    else:
        # 测试当前提供商
        providers = {config.config.get("current_provider"): config.get_current_provider()}

    for name, provider in providers.items():
        if not provider:
            continue

        print(f"\n{'='*60}")
        print(f"测试 {provider.name} API...")
        print(f"{'='*60}")
        print(f"API URL: {provider.base_url}")
        print(f"模型: {provider.model}")
        print(f"API Key: {provider.api_key[:20]}...")

        # 构建请求
        url = f"{provider.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {provider.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": provider.model,
            "messages": [
                {
                    "role": "user",
                    "content": "请简单介绍一下你自己，包括你是什么模型，有什么特点？"
                }
            ],
            "max_tokens": 500,
            "temperature": 0.7
        }

        try:
            print(f"\n📤 发送请求到: {url}")
            response = requests.post(url, headers=headers, json=data, timeout=60)

            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                print(f"\n✅ API调用成功!")
                print(f"\n📝 AI回复:")
                print("-" * 60)
                print(content)
                print("-" * 60)

                # 显示usage信息
                if "usage" in result:
                    print(f"\n📊 Token使用情况:")
                    print(f"   输入: {result['usage'].get('prompt_tokens', 'N/A')}")
                    print(f"   输出: {result['usage'].get('completion_tokens', 'N/A')}")
                    print(f"   总计: {result['usage'].get('total_tokens', 'N/A')}")

            elif response.status_code == 401:
                print(f"\n❌ 认证失败 (401): API密钥无效或已过期")
                print(f"响应内容: {response.text}")

            elif response.status_code == 403:
                print(f"\n❌ 访问被拒绝 (403): 没有权限访问此API")
                print(f"响应内容: {response.text}")

            elif response.status_code == 429:
                print(f"\n⚠️  请求过于频繁 (429): 请稍后再试")
                print(f"响应内容: {response.text}")

            else:
                print(f"\n❌ API调用失败 ({response.status_code})")
                print(f"响应内容: {response.text}")

        except requests.exceptions.Timeout:
            print(f"\n❌ 请求超时: API响应时间过长")

        except requests.exceptions.ConnectionError:
            print(f"\n❌ 连接失败: 无法连接到API服务器")
            print(f"   请检查网络连接和API地址是否正确")

        except Exception as e:
            print(f"\n❌ 发生错误: {str(e)}")

        print()


def list_models():
    """列出所有可用模型"""
    config = get_config()

    print("\n" + "="*60)
    print("📦 支持的AI模型")
    print("="*60)

    for provider_id, info in config.SUPPORTED_PROVIDERS.items():
        current_marker = "← 当前使用" if config.config.get("current_provider") == provider_id else ""
        print(f"\n{info['name']} ({provider_id}) {current_marker}")
        print(f"默认模型: {info['default_model']}")
        print(f"可用模型:")
        for model in info['available_models']:
            print(f"  • {model}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "--list":
            list_models()
        else:
            test_ai_api(sys.argv[1])
    else:
        print("🤖 AI API 测试工具")
        print("="*60)
        print("用法:")
        print("  python3 test_ai_api.py              # 测试当前配置的AI")
        print("  python3 test_ai_api.py minimax      # 测试MiniMax")
        print("  python3 test_ai_api.py --list       # 列出所有可用模型")
        print()

        test_ai_api()
