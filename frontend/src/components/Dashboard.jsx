import { Brain, FileText, Search, Activity, Sparkles, Rocket, TrendingUp, BookOpen, Clock, Zap, Database } from 'lucide-react'

export default function Dashboard({ systemStatus }) {
  if (!systemStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-slate-600 font-medium">正在加载系统状态...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: '已创建文章',
      value: systemStatus.memory?.created_posts || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/30'
    },
    {
      name: '搜索历史',
      value: systemStatus.memory?.search_history || 0,
      icon: Search,
      color: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/30'
    },
    {
      name: '智能体状态',
      value: systemStatus.services?.zhipu_ai ? '在线' : '离线',
      icon: Brain,
      color: systemStatus.services?.zhipu_ai ? 'from-purple-500 to-purple-600' : 'from-gray-500 to-gray-600',
      shadowColor: systemStatus.services?.zhipu_ai ? 'shadow-purple-500/30' : 'shadow-gray-500/30'
    }
  ]

  const features = [
    {
      name: 'AI智能写作',
      description: '基于智谱AI的强大内容生成能力',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-primary-600 to-primary-700',
      stats: '10倍'
    },
    {
      name: '实时研究',
      description: 'Tavily搜索API获取最新信息',
      icon: Search,
      color: 'bg-gradient-to-br from-accent-600 to-accent-700',
      stats: '实时'
    },
    {
      name: '记忆系统',
      description: '智能体持续学习和优化',
      icon: Database,
      color: 'bg-gradient-to-br from-purple-600 to-purple-700',
      stats: '智能'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <div className="glass-card p-8 bg-gradient-to-br from-primary-600 via-purple-600 to-accent-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Rocket className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🎉 欢迎使用智能体写作助手
              </h1>
              <p className="text-white/90 text-lg">
                基于AI的智能写作系统，帮助你高效创建高质量博客文章
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-card p-6 hover-card bg-white/80 border border-white/40"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadowColor} float-animation`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 系统状态 */}
      <div className="glass-card p-6 bg-white/80 border border-white/40">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary-600" />
          系统状态监控
        </h2>

        <div className="space-y-4">
          {[
            {
              name: '智谱AI服务',
              icon: Brain,
              color: 'purple',
              status: systemStatus.services?.zhipu_ai,
              description: 'AI内容生成服务'
            },
            {
              name: 'Tavily搜索服务',
              icon: Search,
              color: 'green',
              status: systemStatus.services?.tavily_search,
              description: '实时网络搜索服务'
            },
            {
              name: '博客路径',
              icon: Database,
              color: 'blue',
              status: true,
              description: systemStatus.services?.blog_path
            }
          ].map((service, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all ${
                service.status
                  ? `bg-gradient-to-r from-${service.color}-50 to-white border-${service.color}-200 hover:border-${service.color}-400 hover:shadow-lg`
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${
                    service.status
                      ? `from-${service.color}-500 to-${service.color}-600`
                      : 'from-red-500 to-red-600'
                  }`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-600">{service.description}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  service.status
                    ? `bg-gradient-to-r from-${service.color}-100 to-${service.color}-50 text-${service.color}-700`
                    : 'bg-red-100 text-red-700'
                }`}>
                  {service.status ? '✅ 正常运行' : '❌ 服务异常'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 功能特色 */}
      <div className="glass-card p-6 bg-white/80 border border-white/40">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent-600" />
          核心功能特色
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="gradient-card p-6 hover-card group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${feature.color} shadow-lg float-animation`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gradient">
                  {feature.stats}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">
                {feature.name}
              </h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 快速开始 */}
      <div className="glass-card p-6 bg-white/80 border border-white/40">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-warning-600" />
          快速开始
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: '创建新文章',
              description: '输入主题，让智能体自动生成高质量博客文章',
              icon: Rocket,
              color: 'from-primary-600 to-primary-700'
            },
            {
              title: '查看历史记录',
              description: '浏览已创建的文章和智能体的学习历程',
              icon: BookOpen,
              color: 'from-accent-600 to-accent-700'
            }
          ].map((action, index) => (
            <div
              key={index}
              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-primary-500 hover:bg-gradient-to-br hover:from-primary-50 hover:to-white transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                  <button className="btn btn-primary text-sm">
                    开始使用
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}