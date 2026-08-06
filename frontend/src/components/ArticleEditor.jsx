import { useState, useEffect } from 'react'
import { Save, Eye, Edit, ArrowLeft, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ArticleEditor({ filename, content, onSave, onCancel }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('📝 ArticleEditor初始化:', {
      filename,
      contentReceived: !!content,
      contentLength: content?.length || 0
    })

    if (content) {
      setEditContent(content)
      setLoading(false)
    } else {
      // 如果没有内容，设置默认内容
      setEditContent('# ' + filename.replace(/\.(md|markdown)$/, '') + '\n\n暂无内容，请开始编写...')
      setLoading(false)
    }
  }, [content, filename])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(filename, editContent)
      setIsEditing(false)
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditContent(content)
    setIsEditing(false)
    setPreviewMode(false)
    if (onCancel) onCancel()
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <span className="text-sm text-gray-600">
            {filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
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
            </>
          )}
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">正在加载文章内容...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="text-center py-12">
          <div className="text-danger-600 mb-4">❌ {error}</div>
          <button
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            返回列表
          </button>
        </div>
      )}

      {/* 编辑/预览区域 */}
      {!loading && !error && (
        <>
          {isEditing ? (
            previewMode ? (
              /* Markdown预览 */
              <div className="prose prose-slate max-w-none p-6 bg-white rounded-lg border border-gray-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="markdown-body"
                >
                  {editContent || '*暂无内容*'}
                </ReactMarkdown>
              </div>
            ) : (
              /* 编辑器 */
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-[600px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                placeholder="在此编辑Markdown内容..."
              />
            )
          ) : (
            /* 只读预览 */
            <div className="prose prose-slate max-w-none p-6 bg-white rounded-lg border border-gray-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-body"
              >
                {editContent || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  )
}
