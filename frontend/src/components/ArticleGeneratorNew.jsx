import { useState } from 'react'
import { Send, Sparkles, Loader2, CheckCircle, Search, Wand2, FileText, Lightbulb, Activity, Clock } from 'lucide-react'

export default function ArticleGenerator() {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    subtitle: '',
    tags: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState([])
  const [currentStatus, setCurrentStatus] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [pollIntervalId, setPollIntervalId] = useState(null)

  // HTTP轮询获取生成状态
  const pollGenerationStatus = async () => {
    try {
      const response = await fetch('/api/generation/status')
      const data = await response.json()

      if (data.is_generating) {
        setCurrentStatus(data.message)
        setGenerationProgress(data.progress)

        // 检查是否有新的进度消息
        setProgress(prev => {
          const lastMessage = prev.length > 0 ? prev[prev.length - 1].message : ''
          if (data.message !== lastMessage) {
            return [...prev, {
              type: 'progress',
              stage: data.current_stage,
              message: data.message,
              timestamp: new Date().toLocaleTimeString()
            }]
          }
          return prev
        })
      } else if (data.result) {
        // 生成完成
        setCurrentStatus('生成完成！')
        setGenerationProgress(100)
        setProgress(prev => [...prev, {
          type: 'success',
          message: `文章已保存: ${data.result.title}`,
          timestamp: new Date().toLocaleTimeString()
        }])
        setIsGenerating(false)
        if (pollIntervalId) {
          clearInterval(pollIntervalId)
          setPollIntervalId(null)
        }
        alert(`文章生成成功！文件: ${data.result.filepath}`)
      } else if (data.error) {
        // 生成错误
        setCurrentStatus('生成失败')
        setProgress(prev => [...prev, {
          type: 'error',
          message: `错误: ${data.error}`,
          timestamp: new Date().toLocaleTimeString()
        }])
        setIsGenerating(false)
        if (pollIntervalId) {
          clearInterval(pollIntervalId)
          setPollIntervalId(null)
        }
      }
    } catch (error) {
      console.error('获取生成状态失败:', error)
    }
  }

  const handleGenerate = async () => {
    if (!formData.title || !formData.topic) {
      alert('请填写标题和主题')
      return
    }

    console.log('🚀 开始生成文章流程')
    console.log('📝 文章标题:', formData.title)
    console.log('🔍 主题:', formData.topic)

    setIsGenerating(true)
    setProgress([])
    setCurrentStatus('准备生成...')
    setGenerationProgress(0)

    try {
      // 添加初始进度
      setProgress(prev => [...prev, {
        type: 'info',
        message: '正在提交生成请求...',
        timestamp: new Date().toLocaleTimeString()
      }])

      // 发送生成请求
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          topic: formData.topic,
          subtitle: formData.subtitle,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })

      if (!response.ok) {
        throw new Error('生成请求失败')
      }

      const result = await response.json()
      console.log('✅ 生成请求已发送:', result)

      setProgress(prev => [...prev, {
        type: 'info',
        message: '生成任务已启动，正在后台执行...',
        timestamp: new Date().toLocaleTimeString()
      }])

      // 启动HTTP轮询获取状态
      console.log('🔄 启动HTTP轮询获取生成状态')
      const intervalId = setInterval(pollGenerationStatus, 1000) // 每秒轮询一次
      setPollIntervalId(intervalId)

    } catch (error) {
      console.error('❌ 生成失败:', error)
      setCurrentStatus('生成失败')
      setProgress(prev => [...prev, {
        type: 'error',
        message: `错误: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }])
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左侧：输入表单 */}
      <div className="glass-card p-6 bg-white/80 border border-white/40">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg float-animation">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-gradient">文章生成器</span>
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-primary-600" />
              文章标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="例如：智能体开发的未来趋势"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lightbulb className="h-4 w-4 text-warning-600" />
              研究主题 <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input min-h-[120px]"
              placeholder="描述你想写的主题，智能体会基于此进行搜索和内容生成..."
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Wand2 className="h-4 w-4 text-purple-600" />
              副标题
            </label>
            <input
              type="text"
              className="input"
              placeholder="例如：探索AI技术的下一个前沿"
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Search className="h-4 w-4 text-accent-600" />
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              className="input"
              placeholder="AI, 智能体, 技术"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              disabled={isGenerating}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                正在生成中...
              </>
            ) : (
              <>
                <Send className="h-6 w-6" />
                开始AI生成
              </>
            )}
          </button>
        </div>
      </div>

      {/* 右侧：生成进度 */}
      <div className="glass-card p-6 bg-white/80 border border-white/40">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl shadow-lg float-animation">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-gradient">实时进度</span>
        </h2>

        {/* 总进度条 */}
        {isGenerating && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>总体进度</span>
              <span className="font-semibold text-primary-600">{generationProgress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {isGenerating && currentStatus && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
              <span className="font-semibold text-primary-900">{currentStatus}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {progress.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="inline-block p-6 mb-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl">
                <Sparkles className="h-12 w-12 text-slate-300 mx-auto" />
              </div>
              <p className="text-lg font-medium">开始生成后，这里会显示详细进度</p>
              <p className="text-sm mt-2">智能体将实时汇报工作状态</p>
            </div>
          ) : (
            progress.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  item.type === 'success' ? 'bg-gradient-to-r from-accent-50 to-white border-accent-200 shadow-lg' :
                  item.type === 'error' ? 'bg-gradient-to-r from-danger-50 to-white border-danger-200 shadow-lg' :
                  item.type === 'progress' ? 'bg-gradient-to-r from-primary-50 to-white border-primary-200 shadow-md' :
                  'bg-gradient-to-r from-slate-50 to-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.type === 'success' && <CheckCircle className="h-5 w-5 text-accent-600 mt-0.5" />}
                  {item.type === 'error' && <span className="text-danger-600 font-bold text-lg">✗</span>}
                  {item.type === 'progress' && <Loader2 className="h-5 w-5 text-primary-600 animate-spin mt-0.5" />}
                  {item.type === 'info' && <span className="text-primary-600 font-bold">ℹ️</span>}

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-1">{item.message}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                      {item.stage && (
                        <>
                          <span>•</span>
                          <span className="tag tag-accent">{item.stage}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
