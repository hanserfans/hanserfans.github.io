import { useState, useEffect } from 'react'
import { FileText, Calendar, Plus, Edit } from 'lucide-react'
import MarkdownEditor from './MarkdownEditor.jsx'

export default function ArticleManagerSimple() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [editorMode, setEditorMode] = useState(null) // null, 'new', 'edit'

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      console.log('🔄 开始加载文章列表')
      const response = await fetch('/api/posts')
      const data = await response.json()
      console.log('✅ 文章列表加载成功:', data)
      setPosts(data.posts || [])
    } catch (err) {
      console.error('❌ 加载文章失败:', err)
      setError('加载文章列表失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const createNewPost = () => {
    console.log('🔘 创建新文章')
    setSelectedFile(null)
    setEditorMode('new')
  }

  const editPost = (filename) => {
    console.log('🔘 编辑文章:', filename)
    setSelectedFile(filename)
    setEditorMode('edit')
  }

  const handleEditorClose = () => {
    console.log('🔘 关闭编辑器')
    setSelectedFile(null)
    setEditorMode(null)
    // 重新加载文章列表，显示最新状态
    loadPosts()
  }

  const handleSave = async (content) => {
    console.log('💾 开始保存内容:', { filename: selectedFile, contentLength: content.length })

    try {
      let filename = selectedFile

      // 如果是新文章，生成文件名
      if (editorMode === 'new' && !filename) {
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
        const timestamp = Date.now()
        filename = `${dateStr}-new-article-${timestamp}.md`
      }

      // 保存到服务器
      const response = await fetch(`/api/posts/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      const result = await response.json()
      console.log('✅ 保存成功:', result)

      // 更新文件名
      setSelectedFile(filename)

      // 显示成功提示
      alert('保存成功！')

      // 重新加载文章列表
      setTimeout(() => {
        loadPosts()
      }, 500)

      return result

    } catch (err) {
      console.error('❌ 保存失败:', err)
      alert('保存失败: ' + err.message)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">正在加载文章...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 文章编辑器 */}
      {editorMode && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <MarkdownEditor
            filename={selectedFile || ''}
            onCancel={handleEditorClose}
            onSave={handleSave}
            initialContent={editorMode === 'new' ? '' : undefined}
          />
        </div>
      )}

      {/* 文章列表 */}
      {!editorMode && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">文章列表 ({posts.length})</h2>
            <button
              onClick={createNewPost}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新建文章
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              ⚠️ {error}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">还没有创建任何文章</p>
              <button
                onClick={createNewPost}
                className="btn btn-primary"
              >
                创建第一篇文章
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-all bg-white"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                  <button
                    onClick={() => editPost(post.filename)}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    编辑文章
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
