import { useState, useEffect } from 'react'
import { FileText, Calendar, Tag, Eye, Edit, Save } from 'lucide-react'
import ArticleEditorTest from './ArticleEditorTest.jsx'

export default function ArticleManager() {
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState(null)

  // 保存文章内容
  const savePostContent = async (filename, content) => {
    try {
      const response = await fetch(`/api/posts/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      const result = await response.json()
      console.log('✅ 文章保存成功:', result)

      // 更新选中的文章内容
      if (selectedPost && selectedPost.filename === filename) {
        setSelectedPost({
          ...selectedPost,
          content: content
        })
      }

      return result
    } catch (error) {
      console.error('❌ 保存文章失败:', error)
      throw error
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('加载文章失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewPost = async (filename) => {
    try {
      console.log('📄 正在加载文章:', filename)
      const response = await fetch(`/api/posts/${filename}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ 文章加载成功，内容长度:', data.content?.length || 0)

      setSelectedPost({
        filename,
        content: data.content || '暂无内容'
      })
      setEditingPost(null)
    } catch (error) {
      console.error('❌ 加载文章内容失败:', error)
      alert(`加载文章失败: ${error.message}`)
    }
  }

  const editPost = async (post) => {
    // 如果文章没有内容，先加载
    if (!post.content) {
      try {
        console.log('📄 正在加载文章内容以供编辑:', post.filename)
        const response = await fetch(`/api/posts/${post.filename}`)
        const data = await response.json()
        post.content = data.content || ''
      } catch (error) {
        console.error('❌ 加载文章内容失败:', error)
        alert(`加载文章内容失败: ${error.message}`)
        return
      }
    }

    setEditingPost(post)
    setSelectedPost(null)
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
      {/* 如果正在查看或编辑文章，隐藏文章列表 */}
      {(selectedPost || editingPost) ? (
        <div className="card">
          {editingPost && (
            <ArticleEditorTest
              filename={editingPost.filename}
              onCancel={() => {
                setEditingPost(null)
                setSelectedPost(null)
              }}
            />
          )}
          {selectedPost && !editingPost && (
            <ArticleEditorTest
              filename={selectedPost.filename}
              onCancel={() => {
                setSelectedPost(null)
                setEditingPost(null)
              }}
            />
          )}
        </div>
      ) : (
        /* 文章列表 */
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            文章列表 ({posts.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">正在加载文章...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>还没有创建任何文章</p>
              <p className="text-sm mt-1">使用文章生成功能开始创作吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex-1">
                      {post.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {post.tags.slice(0, 2).join(', ')}
                        {post.tags.length > 2 && '...'}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewPost(post.filename)}
                      className="btn btn-secondary flex items-center gap-2 text-sm flex-1"
                    >
                      <Eye className="h-4 w-4" />
                      查看
                    </button>
                    <button
                      onClick={() => editPost(post)}
                      className="btn btn-primary flex items-center gap-2 text-sm flex-1"
                    >
                      <Edit className="h-4 w-4" />
                      编辑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}