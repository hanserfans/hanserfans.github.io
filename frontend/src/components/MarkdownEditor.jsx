import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, Bold, Italic, List, Image as ImageIcon,
  Code, Link as LinkIcon, Eye, Edit3, Save, Loader2,
  Upload, Maximize2, Minimize2, Type, Heading1, Wand2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownEditor({ filename, onCancel, onSave, initialContent = '' }) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(!!filename && !initialContent)
  const [previewMode, setPreviewMode] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [imageUrls, setImageUrls] = useState([])
  const textareaRef = useRef(null)

  // 加载现有文章内容
  useEffect(() => {
    if (filename && !initialContent) {
      loadContent()
    }
  }, [filename])

  const loadContent = async () => {
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

      setContent(data.content || '')
    } catch (err) {
      console.error('❌ 加载失败:', err)
      alert('加载文章失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 插入Markdown语法
  const insertMarkdown = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = content
    const selection = text.substring(start, end)

    const newText = text.substring(0, start) + before + (selection || placeholder) + after + text.substring(end)
    setContent(newText)

    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + (selection || placeholder).length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  // 图片上传
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }

    // 检查文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 PNG、JPG、GIF、WEBP 格式的图片')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // 插入图片Markdown语法
        const imageMarkdown = `![${file.name}](${result.url})\n`
        insertMarkdown(imageMarkdown)

        // 添加到图片列表
        setImageUrls([...imageUrls, result.url])

        console.log('✅ 图片上传成功:', result)
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('❌ 图片上传失败:', error)
      alert('图片上传失败: ' + error.message)
    } finally {
      setUploading(false)
      // 重置文件输入
      event.target.value = ''
    }
  }

  // Markdown格式优化
  const handleOptimizeMarkdown = async () => {
    if (!content.trim()) {
      alert('请先输入一些内容再优化')
      return
    }

    setOptimizing(true)
    try {
      console.log('🪄 开始优化Markdown格式')

      const response = await fetch('/api/optimize-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Markdown格式优化成功:', {
          originalLength: result.original_length,
          optimizedLength: result.optimized_length
        })

        setContent(result.optimized_content)
        alert('✨ 格式优化完成！')
      } else {
        throw new Error(result.error || '优化失败')
      }
    } catch (error) {
      console.error('❌ Markdown格式优化失败:', error)
      alert('格式优化失败: ' + error.message)
    } finally {
      setOptimizing(false)
    }
  }

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Ctrl/Cmd + B 加粗
      else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        insertMarkdown('**', '**', '粗体文本')
      }
      // Ctrl/Cmd + I 斜体
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        insertMarkdown('*', '*', '斜体文本')
      }
      // Ctrl/Cmd + K 代码块
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        insertMarkdown('```\n', '\n```', '代码')
      }
      // Escape 退出全屏
      else if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false)
      }
    }

    if (textareaRef.current) {
      textareaRef.current.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [content, fullscreen])

  const handleSave = async () => {
    setSaving(true)
    try {
      // 如果有onSave回调，使用它
      if (onSave) {
        await onSave(content)
      } else {
        // 否则直接保存到服务器
        const response = await fetch(`/api/posts/${filename}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })

        if (!response.ok) {
          throw new Error('保存失败')
        }

        console.log('✅ 保存成功')
        alert('保存成功！')
      }
    } catch (error) {
      console.error('❌ 保存失败:', error)
      alert('保存失败: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const EditorToolbar = () => (
    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
      {/* 文本格式化 */}
      <button
        onClick={() => insertMarkdown('# ', '', '标题')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="大标题"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        onClick={() => insertMarkdown('**', '**', '粗体文本')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="粗体 (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => insertMarkdown('*', '*', '斜体文本')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="斜体 (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => insertMarkdown('- ', '', '列表项')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="列表"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => insertMarkdown('```\n', '\n```', '代码')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="代码块 (Ctrl+K)"
      >
        <Code className="h-4 w-4" />
      </button>
      <button
        onClick={() => insertMarkdown('[', '](', '链接描述')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="链接"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      <div className="border-l border-gray-300 mx-2 h-6"></div>

      {/* 图片上传 */}
      <div className="relative inline-block">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          onChange={handleImageUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ zIndex: 10 }}
          title="上传图片"
        />
        <button
          disabled={uploading}
          className="p-2 hover:bg-gray-100 rounded transition-colors pointer-events-none"
          title="插入图片"
          type="button"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 格式优化 */}
      <button
        onClick={handleOptimizeMarkdown}
        disabled={optimizing}
        className="p-2 hover:bg-gray-100 rounded transition-colors relative"
        title="AI格式优化"
      >
        {optimizing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
      </button>

      <div className="border-l border-gray-300 mx-2 h-6"></div>

      {/* 视图控制 */}
      <button
        onClick={() => setPreviewMode(!previewMode)}
        className={`p-2 rounded transition-colors ${previewMode ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
        title={previewMode ? '编辑模式' : '预览模式'}
      >
        {previewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button
        onClick={() => setFullscreen(!fullscreen)}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title={fullscreen ? '退出全屏' : '全屏模式'}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>

      <div className="border-l border-gray-300 mx-2 h-6"></div>

      {/* 保存 */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        title="保存 (Ctrl+S)"
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

      {/* 快捷键提示 */}
      <div className="ml-auto text-xs text-gray-500">
        <span className="hidden md:inline">Ctrl+S 保存</span>
      </div>
    </div>
  )

  // 主内容区域样式
  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 bg-white flex flex-col'
    : 'flex-1 flex flex-col'

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <span className="text-sm text-gray-600 font-medium">{filename || '未知文件'}</span>
          </div>
        </div>

        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">正在加载文章内容...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* 顶部工具栏（始终显示） */}
      {!fullscreen && (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <Type className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{filename || '新文章.md'}</span>
          </div>
        </div>
      )}

      {/* 全屏模式下的标题栏 */}
      {fullscreen && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">{filename || '新文章.md'}</span>
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* 编辑器主体 */}
      <div className="flex-1 flex flex-col bg-white">
        <EditorToolbar />

        <div className="flex-1 flex border border-gray-200 rounded-b-lg overflow-hidden">
          {previewMode ? (
            /* Markdown预览 */
            <div className="flex-1 p-6 prose prose-slate max-w-none overflow-y-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 自定义图片渲染
                  img: ({ src, alt, ...props }) => {
                    // 处理相对路径，适配博客系统的图片路径
                    let imgSrc = src
                    if (!src?.startsWith('http')) {
                      // 如果是相对路径，确保使用 /img/ 路径
                      if (src?.includes('/uploads/')) {
                        imgSrc = src.replace('/uploads/', '/img/')
                      } else if (src?.includes('/img/')) {
                        imgSrc = src
                      } else {
                        // 纯文件名，添加 /img/ 前缀
                        imgSrc = `/img/${src.split('/').pop()}`
                      }
                    }
                    return <img src={imgSrc} alt={alt || ''} className="rounded-lg shadow-md my-4" {...props} />
                  }
                }}
              >
                {content || '*开始编写你的内容...*'}
              </ReactMarkdown>
            </div>
          ) : (
            /* 编辑模式 */
            <div className="flex-1 flex">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full h-full p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                placeholder={`开始编写你的文章...

使用 Markdown 语法：

# 一级标题
## 二级标题
**粗体** *斜体*
- 列表项
\`代码\`

支持快捷键：
Ctrl+S 保存
Ctrl+B 粗体
Ctrl+I 斜体
Ctrl+K 代码块
`}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between">
        <span>
          字符: {content.length} | 行数: {content.split('\n').length}
          {content.length > 0 && ` | 段落: ${content.split('\n\n').length}`}
        </span>
        <span>
          {previewMode ? '👁️ 预览模式' : '✏️ 编辑模式'}
          {fullscreen ? ' | 📺 全屏' : ''}
        </span>
      </div>
    </div>
  )
}
