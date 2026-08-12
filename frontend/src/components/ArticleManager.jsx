import { useState } from 'react'
import PostList from './PostList'
import PostEditor from './PostEditor'

export default function ArticleManager() {
  const [view, setView] = useState('list')  // 'list' | 'edit'
  const [currentFilename, setCurrentFilename] = useState(null)

  const handleEditPost = (filename) => {
    setCurrentFilename(filename)
    setView('edit')
  }

  const handleCreateNew = () => {
    setCurrentFilename(null)
    setView('edit')
  }

  const handleBack = () => {
    setView('list')
    setCurrentFilename(null)
  }

  const handleSaved = (filename) => {
    // 保存成功后可以做一些操作，比如刷新列表
    console.log('文章已保存:', filename)
  }

  if (view === 'edit') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <PostEditor 
          filename={currentFilename} 
          onBack={handleBack} 
          onSaved={handleSaved}
        />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      <PostList 
        onEditPost={handleEditPost}
        onCreateNew={handleCreateNew}
      />
    </div>
  )
}
