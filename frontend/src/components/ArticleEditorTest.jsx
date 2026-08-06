import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, Edit, Save, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Unicode解码函数
function decodeUnicode(str) {
  return str.replace(/\\u[\dA-Fa-f]{4}/gi, (match) => {
    return String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
  })
}

export default function ArticleEditorTest({ filename, onCancel }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // 验证filename参数
  useEffect(() => {
    console.log('🔍 ArticleEditorTest接收到的参数:', { filename, onCancel: !!onCancel })
    if (!filename) {
      setError('缺少文件名参数')
      setLoading(false)
    }
  }, [filename, onCancel])

  // 加载文章内容
  useEffect(() => {
    loadContent()
  }, [filename])

  const loadContent = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 正在加载文章:', filename)
      const response = await fetch(`/api/posts/${filename}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ 文章加载成功:', {
        hasContent: !!data.content,
        contentLength: data.content?.length || 0
      })

      // 确保内容是字符串，处理可能的编码问题
      let content = data.content || ''
      if (typeof content !== 'string') {
        content = String(content)
      }

      // 解码Unicode字符
      content = decodeUnicode(content)

      console.log('📝 内容类型:', typeof content)
      console.log('📝 内容前100字符:', content.substring(0, 100))
      console.log('📝 解码后内容检查:', content.includes('2026年') ? '中文正常' : '可能仍有编码问题')

      setContent(content)
      setEditContent(content)
      setLoading(false)
    } catch (err) {
      console.error('❌ 加载失败:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/posts/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      const result = await response.json()
      console.log('✅ 保存成功:', result)
      setContent(editContent)
      setIsEditing(false)
      alert('保存成功！')
    } catch (err) {
      console.error('❌ 保存失败:', err)
      alert('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* 简化的工具栏 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <span className="text-sm text-gray-600 font-medium">{filename || '未知文件'}</span>
          </div>
        </div>

        {/* 加载状态 */}
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">正在加载文章内容...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        {/* 简化的工具栏 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <span className="text-sm text-gray-600 font-medium">{filename || '未知文件'}</span>
          </div>
        </div>

        {/* 错误状态 */}
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-danger-600 mb-4 text-lg">❌ 加载失败</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center gap-2">
            <button onClick={loadContent} className="btn btn-primary">重试</button>
            <button onClick={onCancel} className="btn btn-secondary">返回列表</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="btn btn-secondary flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <span className="text-sm text-gray-600 font-medium">{filename}</span>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true)
                setEditContent(content)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              编辑
            </button>
          ) : (
            <>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn flex items-center gap-2 ${previewMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Eye className="h-4 w-4" />
                {previewMode ? '编辑' : '预览'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    保存
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(content)
                }}
                className="btn btn-secondary flex items-center gap-2"
              >
                取消
              </button>
            </>
          )}
        </div>
      </div>

      {/* 编辑/预览区域 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isEditing ? (
          previewMode ? (
            /* Markdown预览 */
            <div className="p-6 prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {editContent || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          ) : (
            /* 编辑器 */
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[600px] p-4 font-mono text-sm border-none rounded-lg focus:ring-0"
              placeholder="在此编辑Markdown内容..."
            />
          )
        ) : (
          /* 只读预览 */
          <div className="p-6 prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
              {content || '*暂无内容*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* 调试信息 */}
      <div className="text-xs text-gray-500">
        调试: 内容长度 {content?.length || 0} 字符，编辑长度 {editContent?.length || 0} 字符
      </div>
    </div>
  )
}
