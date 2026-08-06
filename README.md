# 🤖 智能体写作助手系统

一个基于AI的智能写作系统，集成智谱AI和Tavily搜索，帮助高效创建高质量博客文章。

## ✨ 核心特性

- 🧠 **AI智能写作**: 基于智谱AI的强大内容生成能力
- 🔍 **实时研究**: Tavily搜索API获取最新网络信息
- 💾 **记忆系统**: 智能体持续学习和优化
- 🎨 **现代UI**: React + Tailwind CSS 响应式界面
- 📡 **实时通信**: WebSocket 实时进度更新
- 📊 **可视化**: 直观的仪表板和数据分析

## 🚀 快速开始

### 一键启动
```bash
chmod +x start.sh stop.sh
./start.sh
```

### 访问界面
- 🎨 **前端界面**: http://localhost:3000
- 🔌 **后端API**: http://localhost:5000

### 停止系统
```bash
./stop.sh
```

## 📱 系统功能

### 1. 智能文章生成
- 基于主题自动生成高质量文章
- 网络搜索最新信息
- 实时生成进度展示
- 智能标签推荐

### 2. 文章管理
- 查看所有已创建文章
- 文章内容预览
- 按日期和标签排序
- 快速编辑和导出

### 3. 智能体记忆
- 学习历史追踪
- 搜索记录查看
- 使用统计分析
- 持续优化学习

### 4. 系统监控
- 服务健康状态
- API连接状态
- 性能指标监控
- 错误日志查看

## 🏗️ 系统架构

```
智能体写作系统
├── 🧠 智能体核心
│   ├── enhanced_agent.py       # 增强版智能体
│   ├── writing_agent.py         # 基础写作智能体
│   └── api_config.py            # API配置管理
├── 🔧 后端服务
│   ├── app.py                   # Flask主应用
│   ├── WebSocket通信            # 实时双向通信
│   └── RESTful API              # API端点
├── 🎨 前端界面
│   ├── React应用                 # 用户界面
│   ├── Tailwind CSS             # 现代化样式
│   └── Socket.IO客户端          # 实时通信
└── 📊 数据存储
    ├── .env                     # API密钥配置
    ├── 智能体记忆               # 学习历史
    └── 博客文章                 # 生成的内容
```

## 📚 文档指南

- **[完整使用指南](COMPLETE_GUIDE.md)** - 详细的系统使用说明
- **[增强版智能体指南](ENHANCED_AGENT_GUIDE.md)** - AI功能详细说明
- **[基础智能体指南](AGENT_GUIDE.md)** - 智能体基础概念
- **[前端UI文档](frontend/README.md)** - React界面开发文档

## 🛠️ 技术栈

### 后端技术
- Python 3.8+
- Flask + Flask-SocketIO
- 智谱AI API
- Tavily Search API

### 前端技术
- React 18 + Vite
- Tailwind CSS
- Socket.IO Client
- Lucide React Icons

### 智能体技术
- PEAS模型实现
- 记忆管理系统
- 工具调用机制
- 上下文管理

## 📝 快速示例

### 创建AI辅助文章

```python
from enhanced_agent import EnhancedWritingAgent

api_keys = {
    "zhipu": "your_api_key",
    "tavily": "your_tavily_key",
    "zhipu_model": "glm-4-flash"
}

agent = EnhancedWritingAgent("/path/to/blog", api_keys)

# 生成文章
agent.create_ai_generated_post(
    title="智能体开发的未来趋势",
    topic="智能体技术的发展方向和应用前景",
    subtitle="探索AI技术的下一个前沿",
    tags=["AI", "智能体", "技术趋势"]
)
```

### 使用Web界面

1. 访问 http://localhost:3000/generate
2. 填写文章信息
3. 点击"开始生成"
4. 实时查看进度
5. 完成后查看结果

## 🎯 使用场景

- 📝 **技术博客**: 快速生成高质量技术文章
- 📚 **学习笔记**: 自动整理学习内容
- 📊 **行业分析**: 基于最新信息生成分析报告
- 🎨 **内容创作**: 克服写作障碍，提供创意灵感

## 🔐 安全配置

### API密钥设置
编辑 `.env` 文件：
```env
ZHIPU_API_KEY=your_api_key_here
TAVILY_API_KEY=your_tavily_key_here
BLOG_PATH=/Users/mac/git/hanserfans.github.io
```

### 安全注意事项
- ✅ `.env` 文件已加入 `.gitignore`
- ✅ 永远不要提交API密钥到Git
- ✅ 定期更换API密钥
- ✅ 注意内容版权问题

## 🚨 故障排除

### 常见问题解决

**1. 服务无法启动**
```bash
# 检查端口占用
lsof -i :3000
lsof -i :5000

# 检查Python环境
python3 --version

# 重新安装依赖
pip install -r requirements.txt
```

**2. API调用失败**
```bash
# 验证配置
python3 api_config.py

# 测试网络连接
curl -I https://open.bigmodel.cn
```

**3. 前端无法连接**
```bash
# 检查后端状态
curl http://localhost:5000/api/status

# 重启服务
./stop.sh
./start.sh
```

## 📈 性能优化

- 异步任务处理
- 结果缓存机制
- API调用优化
- 前端代码分割
- 数据库查询优化

## 🎯 未来规划

- [ ] 多语言内容生成
- [ ] 自定义文章模板
- [ ] 批量文章生成
- [ ] 用户认证系统
- [ ] 移动端应用
- [ ] 云端部署

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 开源协议

MIT License

## 🙏 致谢

- 智谱AI - 提供强大的AI能力
- Tavily - 提供实时搜索功能
- React社区 - 优秀的前端框架
- 所有开源贡献者

---

**🤖 智能体写作助手** - 让创作更智能，让写作更高效！

**开始使用**: `./start.sh` | **访问界面**: http://localhost:3000