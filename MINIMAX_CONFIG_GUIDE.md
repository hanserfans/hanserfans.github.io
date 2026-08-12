# MiniMax API 配置指南

## ⚠️ 当前问题

API认证失败 (401 Invalid API key)

## 🔍 可能的原因

1. **API Key 格式错误**
   - MiniMax可能需要完整的API Key，不是单独的Group ID
   - API Key通常格式：`eyJh...` (JWT token格式)

2. **需要分开Group ID和API Key**
   - MiniMax某些版本需要分别配置：
     - Group ID: 用于标识组织
     - API Key: 用于认证

3. **API权限问题**
   - API Key可能没有该模型的调用权限

## 📋 正确的配置方式

### 方式1: 标准OpenAI兼容格式

```bash
MINIMAX_API_KEY=your_full_api_key_here
MINIMAX_BASE_URL=https://minnimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
```

### 方式2: 分开Group ID和API Key (如果支持)

```bash
MINIMAX_API_KEY=your_api_key_here
MINIMAX_GROUP_ID=your_group_id_here
MINIMAX_BASE_URL=https://minnimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
```

## 🧪 诊断步骤

### 1. 登录MiniMax控制台

访问: https://minnimax.chat

### 2. 获取正确的API Key

在控制台中找到：
- **API Keys** 页面
- 创建新的API Key或复制现有Key
- 确认Key格式是完整的（不是只复制了部分）

### 3. 检查模型权限

确认你使用的模型 (MiniMax-M2.7, M2.7-highspeed, M3) 已经开通

### 4. 测试API

使用curl测试：

```bash
curl -X POST https://minnimax.chat/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "model": "MiniMax-M2.7",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

## 🔧 临时解决方案

如果MiniMax API暂时无法使用，可以切换到其他AI提供商：

### 切换到智谱AI

```bash
# 编辑 .env 文件
CURRENT_AI_PROVIDER=zhipu
ZHIPU_API_KEY=your_zhipu_api_key_here
ZHIPU_MODEL=glm-4-flash
```

然后运行：
```bash
python3 switch_model.py
```

### 切换到OpenAI

```bash
# 编辑 .env 文件
CURRENT_AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

## 📞 获取帮助

如果问题持续：
1. 检查MiniMax官方文档: https://minnimax.chat/docs
2. 联系MiniMax技术支持
3. 查看API错误日志

## ✅ 验证配置

修复配置后，运行：

```bash
python3 api_config.py      # 验证配置
python3 test_ai_api.py     # 测试API连接
```

---

**最后更新**: 2026-08-10
**状态**: 待用户确认API Key
