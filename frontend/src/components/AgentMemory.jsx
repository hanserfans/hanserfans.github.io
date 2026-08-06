import { useState, useEffect } from 'react'
import { Database, Search, FileText, Clock } from 'lucide-react'

export default function AgentMemory() {
  const [memory, setMemory] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadMemory()
    const interval = setInterval(loadMemory, 5000) // 每5秒刷新
    return () => clearInterval(interval)
  }, [])

  const loadMemory = async () => {
    try {
      const response = await fetch('/api/memory')
      const data = await response.json()
      setMemory(data)
    } catch (error) {
      console.error('加载记忆失败:', error)
    }
  }

  if (!memory) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">正在加载智能体记忆...</p>
      </div>
    )
  }

  const stats = [
    {
      name: '创建文章',
      value: memory.created_posts?.length || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: '搜索记录',
      value: memory.search_history?.length || 0,
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: '学习主题',
      value: memory.learning_topics?.length || 0,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 标签页 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          📊 总览
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'posts'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          📝 文章历史
        </button>
        <button
          onClick={() => setActiveTab('searches')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'searches'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          🔍 搜索历史
        </button>
      </div>

      {/* 总览标签页 */}
      {activeTab === 'overview' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 智能体状态 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🧠 智能体状态
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">最后更新</span>
                <span className="text-gray-600">
                  {memory.last_updated ? new Date(memory.last_updated).toLocaleString() : '未知'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">内容模板</span>
                <span className="text-gray-600">
                  {Object.keys(memory.content_templates || {}).length} 个
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 文章历史标签页 */}
      {activeTab === 'posts' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📝 文章创建历史
          </h2>
          <div className="space-y-3">
            {memory.created_posts?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">还没有创建文章记录</p>
            ) : (
              memory.created_posts.map((post, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.title || post.filename}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(post.timestamp).toLocaleString()}
                        </div>
                        {post.method && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {post.method}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 搜索历史标签页 */}
      {activeTab === 'searches' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 搜索历史记录
          </h2>
          <div className="space-y-3">
            {memory.search_history?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">还没有搜索记录</p>
            ) : (
              memory.search_history.map((search, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{search.topic}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(search.timestamp).toLocaleString()}
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          找到 {search.results_count} 条结果
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}