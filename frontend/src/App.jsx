import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Brain, FileText, Search, Activity, Settings, Sparkles, Zap, Menu, X } from 'lucide-react'
import Dashboard from './components/Dashboard'
import ArticleGenerator from './components/ArticleGeneratorNew.jsx'
import ArticleManager from './components/ArticleManager.jsx'
import ArticleEditorFixed from './components/ArticleEditorFixed.jsx'
import AgentMemory from './components/AgentMemory'
import { socket } from './socket.js'

// 内部组件，使用useLocation钩子
function AppContent({ systemStatus, setSystemStatus, isConnected, setIsConnected, mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation()

  useEffect(() => {
    // 获取系统状态
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(err => console.error('获取系统状态失败:', err))
  }, [])

  // 关闭移动菜单当路由改变
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  const navItems = [
    { path: '/', label: '仪表板', icon: Activity },
    { path: '/generate', label: '文章生成', icon: Sparkles },
    { path: '/posts', label: '文章管理', icon: FileText },
    { path: '/memory', label: '智能体记忆', icon: Brain },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* 顶部导航栏 */}
      <nav className="glass-card sticky top-0 z-50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo区域 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-primary-600 to-accent-600 p-2 rounded-full">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  智能体写作助手
                </h1>
                <p className="text-xs text-slate-500">AI-Powered Writing Assistant</p>
              </div>
            </div>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* 移动端菜单按钮和连接状态 */}
            <div className="flex items-center gap-4">
              {/* 连接状态 */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-white/30">
                <span className={`status-dot ${isConnected ? 'status-online' : 'status-offline'}`}></span>
                <span className="text-sm font-medium text-slate-700">
                  {isConnected ? '在线' : '离线'}
                </span>
              </div>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/50 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-semibold shadow-inner-glow'
                        : 'hover:bg-white/50 text-slate-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}

              {/* 移动端连接状态 */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/30 rounded-xl border border-white/20">
                <span className={`status-dot ${isConnected ? 'status-online' : 'status-offline'}`}></span>
                <span className="text-sm font-medium text-slate-700">
                  {isConnected ? '在线' : '离线'}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard systemStatus={systemStatus} />} />
          <Route path="/generate" element={<ArticleGenerator />} />
          <Route path="/posts" element={<ArticleManager />} />
          <Route path="/memory" element={<AgentMemory />} />
        </Routes>
      </main>

      {/* 页脚 */}
      <footer className="mt-12 border-t border-white/20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 关于我们 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary-600" />
                关于我们
              </h3>
              <p className="text-sm text-slate-600">
                基于AI的智能写作系统，结合MiniMax和Tavily搜索，为创作者提供强大支持。
              </p>
            </div>

            {/* 快速链接 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">快速链接</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-600" />
                  <Link to="/generate" className="hover:text-primary-600 transition-colors">
                    创建文章
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-600" />
                  <Link to="/posts" className="hover:text-primary-600 transition-colors">
                    文章管理
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <Link to="/memory" className="hover:text-primary-600 transition-colors">
                    智能体记忆
                  </Link>
                </div>
              </div>
            </div>

            {/* 系统信息 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">系统状态</h3>
              <div className="space-y-2 text-sm">
                {systemStatus?.services && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">MiniMax服务</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        systemStatus.services.ai_service
                          ? 'bg-accent-100 text-accent-700'
                          : 'bg-danger-100 text-danger-700'
                      }`}>
                        {systemStatus.services.ai_service ? '正常' : '异常'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">搜索服务</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        systemStatus.services.tavily_search
                          ? 'bg-accent-100 text-accent-700'
                          : 'bg-danger-100 text-danger-700'
                      }`}>
                        {systemStatus.services.tavily_search ? '正常' : '异常'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-slate-600">
              © 2026 智能体写作助手 | AI 辅助创作系统
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Powered by MiniMax & Tavily Search
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// 主组件管理状态
function App() {
  const [systemStatus, setSystemStatus] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // WebSocket连接状态管理
  useEffect(() => {
    console.log('App组件开始监听WebSocket连接状态')
    console.log('当前Socket连接状态:', socket.connected)
    console.log('Socket ID:', socket.id)

    const handleConnect = () => {
      setIsConnected(true)
      console.log('✅ App组件检测到WebSocket连接成功，Socket ID:', socket.id)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      console.log('❌ App组件检测到WebSocket断开连接')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  return (
    <Router>
      <AppContent
        systemStatus={systemStatus}
        setSystemStatus={setSystemStatus}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </Router>
  )
}

export default App