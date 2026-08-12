#!/usr/bin/env python3
"""
MiniMax API 详细测试脚本
测试不同的API格式和认证方式
"""

import requests
import json
from api_config import get_config


def test_minimax_detailed():
    """详细测试MiniMax API"""

    config = get_config()
    provider = config.get_current_provider()

    print("="*60)
    print("🔍 MiniMax API 详细诊断")
    print("="*60)

    print(f"\n📋 当前配置:")
    print(f"  API Key: {provider.api_key[:30]}...")
    print(f"  Base URL: {provider.base_url}")
    print(f"  Model: {provider.model}")

    # 分析API Key格式
    print(f"\n🔑 API Key 分析:")
    key_parts = provider.api_key.split('-')

    if len(key_parts) >= 2:
        print(f"  看起来是Group ID格式")
        print(f"  前缀部分 (可能是Group ID): {key_parts[0]}")
        if len(key_parts) > 1:
            print(f"  后缀部分 (可能是API Key): {'-'.join(key_parts[1:])[:30]}...")

    # 尝试不同的认证方式
    print(f"\n🧪 测试不同的认证方式...")

    # 方式1: 标准Bearer Token
    test_auth_methods(provider)

    print(f"\n📝 建议:")
    print(f"  1. 检查MiniMax控制台确认API Key正确")
    print(f"  2. 确认Group ID和API Key都正确配置")
    print(f"  3. 检查API调用权限")


def test_auth_methods(provider):
    """测试不同的认证方法"""

    auth_methods = [
        ("标准Bearer Token", {
            "Authorization": f"Bearer {provider.api_key}",
            "Content-Type": "application/json"
        }),
        ("Group ID前缀", {
            "Authorization": f"Bearer {provider.api_key.split('-')[0]}",
            "Content-Type": "application/json"
        }),
    ]

    # 如果有Group ID，测试它
    if '-' in provider.api_key:
        group_id = provider.api_key.split('-')[0]
        auth_methods.append((f"仅Group ID ({group_id})", {
            "Authorization": f"Bearer {group_id}",
            "Content-Type": "application/json"
        }))

    url = f"{provider.base_url}/chat/completions"
    data = {
        "model": provider.model,
        "messages": [
            {
                "role": "user",
                "content": "你好，请简单介绍一下自己"
            }
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }

    for method_name, headers in auth_methods:
        print(f"\n  测试: {method_name}")
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)

            if response.status_code == 200:
                print(f"    ✅ 成功!")
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                print(f"    回复: {content[:100]}...")
                return True
            else:
                print(f"    ❌ 失败 ({response.status_code})")
                try:
                    error = response.json()
                    print(f"       错误: {error.get('error', {}).get('message', response.text)}")
                except:
                    print(f"       响应: {response.text[:100]}")

        except Exception as e:
            print(f"    ❌ 异常: {str(e)}")

    return False


if __name__ == "__main__":
    test_minimax_detailed()
