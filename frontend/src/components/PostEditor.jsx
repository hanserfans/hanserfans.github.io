import { useState, useEffect, useRef } from 'react'
import { Save, ArrowLeft, Eye, Edit3, AlertCircle, CheckCircle, Wand2, Loader2, Columns, Bold, Italic, Underline, Code, Link as LinkIcon, List, Heading1, Heading2, Quote } from 'lucide-react'

export default function PostEditor({ filename, onBack, onSaved }) {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [viewMode, setViewMode] = useState('split')  // 'split' | 'edit' | 'preview'
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [optimizeStatus, setOptimizeStatus] = useState(null)
  const [syncScroll, setSyncScroll] = useState(true)
  const [selectionPopup, setSelectionPopup] = useState({ show: false, x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const textareaRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    if (filename) {
      loadPost()
    } else {
      // 新建文章
      setContent(getDefaultContent())
      setOriginalContent(getDefaultContent())
      setLoading(false)
    }
  }, [filename])

  useEffect(() => {
    setHasChanges(content !== originalContent)
  }, [content, originalContent])

  const getDefaultContent = () => {
    const today = new Date().toISOString().split('T')[0]
    return `---
title: "新文章"
date: ${today}
tags: []
---

# 文章标题

在这里开始写作...
`
  }

  const loadPost = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${filename}`)
      const data = await response.json()
      setContent(data.content)
      setOriginalContent(data.content)
    } catch (error) {
      console.error('加载文章失败:', error)
      alert('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!hasChanges) {
      return
    }

    setSaving(true)
    setSaveStatus(null)

    try {
      const response = await fetch(`/api/posts/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      const data = await response.json()

      if (response.ok) {
        setOriginalContent(content)
        setSaveStatus({ type: 'success', message: '保存成功！' })
        if (onSaved) {
          onSaved(filename)
        }
        // 3秒后清除状态
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus({ type: 'error', message: data.error || '保存失败' })
      }
    } catch (error) {
      console.error('保存失败:', error)
      setSaveStatus({ type: 'error', message: '网络错误，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handleOptimize = async () => {
    if (!content || optimizing) {
      return
    }

    setOptimizing(true)
    setOptimizeStatus(null)

    try {
      const response = await fetch('/api/optimize-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      const data = await response.json()

      if (response.ok) {
        setContent(data.optimized_content)
        setOptimizeStatus({ 
          type: 'success', 
          message: `优化完成！从${data.original_length}字符优化到${data.optimized_length}字符` 
        })
        // 3秒后清除状态
        setTimeout(() => setOptimizeStatus(null), 3000)
      } else {
        setOptimizeStatus({ type: 'error', message: data.error || '优化失败' })
      }
    } catch (error) {
      console.error('优化失败:', error)
      setOptimizeStatus({ type: 'error', message: '网络错误，请重试' })
    } finally {
      setOptimizing(false)
    }
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  // 处理文本选择，显示快捷工具栏
  const handleTextSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const selection = window.getSelection()
    const text = selection.toString().trim()

    if (text && textarea.value.includes(text)) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      // 计算弹窗位置
      const rect = textarea.getBoundingClientRect()
      const scrollTop = textarea.scrollTop
      const lineHeight = 20

      // 简单估算行号
      const textBefore = textarea.value.substring(0, start)
      const lines = textBefore.split('\n')
      const currentLine = lines.length

      const y = Math.min(
        rect.top + (currentLine * lineHeight) - scrollTop - 45,
        window.innerHeight - 100
      )

      // 基于字符位置估算水平位置
      const lastNewline = textBefore.lastIndexOf('\n')
      const charInLine = start - lastNewline - 1
      const x = Math.min(
        rect.left + (charInLine * 8),
        window.innerWidth - 300
      )

      setSelectedText(text)
      setSelectionPopup({ show: true, x, y })
    } else {
      setSelectionPopup({ show: false, x: 0, y: 0 })
    }
  }

  // 格式化选中文本
  const formatSelection = (formatType) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (!selectedText) {
      setSelectionPopup({ show: false, x: 0, y: 0 })
      return
    }

    let newText = ''
    let cursorOffset = 0

    switch (formatType) {
      case 'bold':
        newText = `**${selectedText}**`
        cursorOffset = 2
        break
      case 'italic':
        newText = `*${selectedText}*`
        cursorOffset = 1
        break
      case 'underline':
        newText = `<u>${selectedText}</u>`
        cursorOffset = 3
        break
      case 'code':
        newText = `\`${selectedText}\``
        cursorOffset = 1
        break
      case 'codeblock':
        newText = `\`\`\`\n${selectedText}\n\`\`\``
        cursorOffset = 4
        break
      case 'link':
        newText = `[${selectedText}](url)`
        cursorOffset = selectedText.length + 3
        break
      case 'h1':
        newText = `# ${selectedText}`
        cursorOffset = 2
        break
      case 'h2':
        newText = `## ${selectedText}`
        cursorOffset = 3
        break
      case 'quote':
        newText = selectedText.split('\n').map(line => `> ${line}`).join('\n')
        cursorOffset = 2
        break
      case 'list':
        newText = selectedText.split('\n').map(line => `- ${line}`).join('\n')
        cursorOffset = 2
        break
      case 'numberlist':
        newText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
        cursorOffset = 3
        break
      default:
        setSelectionPopup({ show: false, x: 0, y: 0 })
        return
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)

    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + cursorOffset
      textarea.selectionStart = textarea.selectionEnd = newCursorPos
    }, 0)

    setSelectionPopup({ show: false, x: 0, y: 0 })
  }

  // 关闭弹窗
  const closePopup = () => {
    setSelectionPopup({ show: false, x: 0, y: 0 })
  }

  // 处理Tab键
  const handleKeyDown = (e) => {
    // 关闭弹窗
    if (selectionPopup.show) {
      closePopup()
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      setContent(newContent)
      // 设置光标位置
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2
      }, 0)
    }
    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  // 同步滚动处理
  const handleEditorScroll = () => {
    if (!syncScroll || !textareaRef.current || !previewRef.current) return

    const textarea = textareaRef.current
    const preview = previewRef.current

    // 计算滚动比例
    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)

    // 同步预览区的滚动位置
    if (preview.scrollHeight > preview.clientHeight) {
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
    }
  }

  const handlePreviewScroll = () => {
    if (!syncScroll || !textareaRef.current || !previewRef.current) return

    const textarea = textareaRef.current
    const preview = previewRef.current

    // 计算滚动比例
    const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)

    // 同步编辑区的滚动位置
    if (textarea.scrollHeight > textarea.clientHeight) {
      textarea.scrollTop = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight)
    }
  }

  const renderMarkdownPreview = (markdown) => {
    // 简单的Markdown预览渲染
    let html = markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-100 p-3 rounded mb-3 overflow-x-auto"><code>$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded">$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:underline">$1</a>')
      // 列表
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      // 换行
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>')

    return `<p class="mb-3">${html}</p>`
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部工具栏 */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            <h2 className="text-lg font-semibold text-slate-900">
              {filename ? '编辑文章' : '新建文章'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* 视图模式切换 */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('edit')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'edit' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="仅编辑"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'split' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="左右分栏"
              >
                <Columns className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'preview' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="仅预览"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            {/* 同步滚动开关 */}
            {viewMode === 'split' && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={syncScroll}
                  onChange={(e) => setSyncScroll(e.target.checked)}
                  className="rounded text-primary-600"
                />
                同步滚动
              </label>
            )}

            {/* 保存状态 */}
            {saveStatus && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                saveStatus.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {saveStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {saveStatus.message}
              </div>
            )}

            {/* 优化状态 */}
            {optimizeStatus && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                optimizeStatus.type === 'success'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {optimizeStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {optimizeStatus.message}
              </div>
            )}

            {/* 优化按钮 */}
            <button
              onClick={handleOptimize}
              disabled={!content || optimizing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                content && !optimizing
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {optimizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  优化中...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  优化格式
                </>
              )}
            </button>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasChanges && !saving
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-600">加载中...</p>
            </div>
          </div>
        ) : viewMode === 'split' ? (
          // 左右分栏模式
          <div className="flex h-full relative">
            {/* 左侧：编辑器 */}
            <div className="w-1/2 border-r border-slate-200">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onScroll={handleEditorScroll}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                className="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none bg-white"
                placeholder="在这里编写Markdown内容..."
                spellCheck="false"
              />
            </div>
            {/* 右侧：预览 */}
            <div
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="w-1/2 h-full overflow-auto p-6 bg-slate-50"
            >
              <div 
                className="max-w-none prose prose-slate prose-headings:font-bold prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
              />
            </div>
          </div>
        ) : viewMode === 'edit' ? (
          // 仅编辑模式
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              className="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none bg-white"
              placeholder="在这里编写Markdown内容..."
              spellCheck="false"
            />
            </div>
        ) : (
          // 仅预览模式
          <div className="h-full overflow-auto p-6 bg-white">
            <div 
              className="max-w-3xl mx-auto prose prose-slate prose-headings:font-bold prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
            />
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="bg-white border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            {filename && <span>文件名: {filename}</span>}
          </div>
          <div>
            {hasChanges && (
              <span className="text-amber-600">⚠️ 有未保存的更改</span>
            )}
            {!hasChanges && (
              <span className="text-green-600">✓ 已保存</span>
            )}
            <span className="ml-4">字数: {content.length}</span>
          </div>
        </div>
      </div>

      {/* 选中文本快捷工具栏 */}
      {selectionPopup.show && (
        <div
          className="fixed z-50 bg-white shadow-lg rounded-lg border border-slate-200 p-2 flex gap-1"
          style={{ left: `${selectionPopup.x}px`, top: `${selectionPopup.y}px` }}
        >
          <button
            onClick={() => formatSelection('bold')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="粗体 (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatSelection('italic')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatSelection('underline')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="下划线"
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => formatSelection('code')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="行内代码"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatSelection('codeblock')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="代码块"
          >
            <span className="text-xs font-mono">```</span>
          </button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => formatSelection('h1')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="一级标题"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatSelection('h2')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="二级标题"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => formatSelection('quote')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="引用"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatSelection('list')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="无序列表"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatSelection('numberlist')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="有序列表"
          >
            <span className="text-xs font-bold">1.</span>
          </button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => formatSelection('link')}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="链接"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 点击其他地方关闭弹窗 */}
      {selectionPopup.show && (
        <div
          className="fixed inset-0 z-40"
          onClick={closePopup}
        />
      )}
    </div>
  )
}
