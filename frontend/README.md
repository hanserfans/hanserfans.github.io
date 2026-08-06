# 智能体写作系统前端UI

## 🎨 技术栈

- **React 18** - 现代化UI框架
- **Vite** - 快速的开发服务器
- **Tailwind CSS** - 实用优先的CSS框架
- **Socket.IO** - 实时双向通信
- **Lucide React** - 美观的图标库
- **React Router** - 路由管理

## 🚀 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:3000` 启动

### 3. 启动后端服务

在另一个终端：

```bash
# 激活虚拟环境
source venv/bin/activate

# 安装Flask依赖
pip install flask flask-cors flask-socketio

# 启动后端
python app.py
```

后端将在 `http://localhost:5000` 启动

## 📱 功能模块

### 1. 仪表板 (`/`)
- 系统状态监控
- 服务健康检查
- 快速开始指南
- 统计数据展示

### 2. 文章生成 (`/generate`)
- AI辅助文章创建
- 实时生成进度
- WebSocket实时通信
- 搜索+生成工作流

### 3. 文章管理 (`/posts`)
- 文章列表展示
- 文章内容预览
- 按日期排序
- 标签管理

### 4. 智能体记忆 (`/memory`)
- 学习历史记录
- 搜索历史查看
- 文章创建记录
- 实时状态更新

## 🎯 核心特性

### 实时通信
- WebSocket双向通信
- 实时进度更新
- 异步任务处理
- 错误处理机制

### 响应式设计
- 移动端友好
- 平板适配
- 桌面优化
- 现代化UI

### 用户体验
- 加载状态指示
- 错误提示
- 成功反馈
- 直观操作

## 🔧 API端点

### 系统状态
```
GET /api/status
```

### 文章管理
```
GET  /api/posts          # 获取文章列表
GET  /api/posts/:file    # 获取文章内容
```

### 文章生成
```
POST /api/generate       # 生成新文章
POST /api/search         # 搜索主题
```

### 智能体记忆
```
GET /api/memory          # 获取智能体记忆
```

## 🎨 UI设计理念

### 颜色方案
- **主色**: 天蓝色 (Primary Blue)
- **成功**: 绿色 (Success Green)
- **警告**: 黄色 (Warning Yellow)
- **错误**: 红色 (Error Red)

### 组件风格
- 圆角设计
- 柔和阴影
- 渐变背景
- 现代化布局

### 交互反馈
- 悬停效果
- 点击反馈
- 加载动画
- 状态指示

## 📱 页面布局

### 顶部导航
- Logo和标题
- 功能导航
- 连接状态指示
- 响应式菜单

### 主内容区
- 最大宽度限制
- 居中对齐
- 卡片式布局
- 网格系统

### 底部页脚
- 版权信息
- 系统版本
- 联系方式

## 🛠️ 开发指南

### 添加新组件

1. 在 `src/components/` 创建新组件
2. 在 `App.jsx` 中添加路由
3. 更新导航菜单
4. 测试功能

### 自定义样式

1. 修改 `tailwind.config.js`
2. 在 `src/index.css` 中添加自定义类
3. 使用 Tailwind 工具类
4. 保持设计一致性

### API集成

```javascript
// 示例：调用API
const response = await fetch('/api/endpoint')
const data = await response.json()

// WebSocket监听
socket.on('event_name', (data) => {
  console.log(data)
})
```

## 🚀 部署

### 构建生产版本

```bash
cd frontend
npm run build
```

### 集成到Flask

构建完成后，Flask会自动提供静态文件服务。

### 环境变量

确保 `.env` 文件包含正确的API密钥配置。

## 📊 性能优化

- 代码分割
- 懒加载
- 图片优化
- 缓存策略
- CDN部署

## 🔒 安全考虑

- API密钥保护
- CORS配置
- 输入验证
- 错误处理
- 访问控制

## 🎯 未来功能

- [ ] 用户认证
- [ ] 文章编辑器
- [ ] 批量操作
- [ ] 导出功能
- [ ] 主题切换
- [ ] 多语言支持

## 📝 使用示例

### 创建文章流程

1. 访问 `/generate` 页面
2. 填写文章标题和主题
3. (可选) 添加副标题和标签
4. 点击"开始生成"
5. 实时查看生成进度
6. 等待生成完成

### 查看智能体学习

1. 访问 `/memory` 页面
2. 切换不同标签页
3. 查看学习历史
4. 分析使用模式

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

MIT License

---

**智能体写作助手** - 让创作更智能！🤖✨