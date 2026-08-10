import io from 'socket.io-client'

// 创建共享的socket实例
const socket = io({
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 20,  // 增加重连次数
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 30000,  // 增加超时到30秒
  forceNew: false,
  autoConnect: true,
  debug: true,  // 启用调试
  pingTimeout: 60000,  // 匹配后端的60秒
  pingInterval: 25000   // 匹配后端的25秒
})

// 监听socket连接状态变化
socket.on('connect', () => {
  console.log('🟢 共享Socket连接成功!')
  console.log('🆔 Socket ID:', socket.id)
  console.log('🔍 Namespace:', socket.nsp)
  console.log('🔗 Socket对象:', socket)
  console.log('🔗 传输方式:', socket.io.engine?.transport?.name)
  
  // 连接成功后，重新验证并确保事件监听器已注册
  setTimeout(() => {
    console.log('🔍 连接后验证事件监听器状态:')
    console.log('  - generation_started:', socket.hasListeners('generation_started'))
    console.log('  - generation_progress:', socket.hasListeners('generation_progress'))
    console.log('  - generation_complete:', socket.hasListeners('generation_complete'))
    console.log('  - generation_error:', socket.hasListeners('generation_error'))
    
    // 如果监听器未注册，重新注册
    if (!socket.hasListeners('generation_started') || 
        !socket.hasListeners('generation_progress') ||
        !socket.hasListeners('generation_complete')) {
      console.log('⚠️ 检测到缺失的事件监听器，重新注册...')
      eventListenersRegistered = false
      registerGlobalEventListeners()
    }
  }, 100)
  
  // 注册事件监听器
  if (!eventListenersRegistered) {
    registerGlobalEventListeners()
  }
})

socket.on('disconnect', (reason) => {
  console.log('🔴 共享Socket断开连接:', reason)
  console.log('🔍 Socket ID:', socket.id)
  console.log('🆔 Namespace:', socket.nsp)
})

socket.on('connect_error', (error) => {
  console.log('❌ 共享Socket连接错误:', error)
  console.log('🔍 Socket ID:', socket.id)
  console.log('🔍 Namespace:', socket.nsp)
})

// 监听所有接收到的事件（用于调试）
socket.onAny((eventName, ...args) => {
  console.log('📥 Socket接收到事件:', eventName, args)
})

// 全局状态变量
let globalUpdateFunctions = {
  setCurrentStatus: null,
  setProgress: null,
  setGenerationProgress: null,
  setIsGenerating: null
}

// 全局事件监听器状态
let eventListenersRegistered = false

function registerGlobalEventListeners() {
  if (eventListenersRegistered) {
    console.log('⚠️ 全局事件监听器已注册，跳过')
    return
  }

  console.log('🔧 开始注册全局WebSocket事件监听器')
  console.log('🔍 Socket连接状态:', socket.connected)
  console.log('🆔 Socket ID:', socket.id)
  console.log('🔍 Socket nsp:', socket.nsp)

  // 即使socket未连接也要注册事件监听器，这样连接建立后就能立即接收事件
  if (!socket.connected) {
    console.log('⚠️ Socket未连接，但仍然注册事件监听器（连接建立后自动生效）')
  }

  const handleGenerationStarted = (data) => {
    console.log('🚀 ====== 收到generation_started事件 ======')
    console.log('📝 文章标题:', data.title)
    console.log('⏰ 时间:', new Date().toLocaleTimeString())
    console.log('📥 全局状态函数可用:', {
      setCurrentStatus: !!globalUpdateFunctions.setCurrentStatus,
      setProgress: !!globalUpdateFunctions.setProgress
    })

    if (globalUpdateFunctions.setCurrentStatus && globalUpdateFunctions.setProgress) {
      try {
        globalUpdateFunctions.setCurrentStatus(`开始生成: ${data.title}`)
        globalUpdateFunctions.setProgress(prev => [...prev, {
          type: 'info',
          message: `开始生成文章: ${data.title}`,
          timestamp: new Date().toLocaleTimeString()
        }])
      } catch (error) {
        console.error('❌ 状态更新失败:', error)
      }
    } else {
      console.warn('⚠️ 全局状态函数不可用，无法更新状态')
    }
  }

  const handleGenerationProgress = (data) => {
    console.log('📊 ====== 收到generation_progress事件 ======')
    console.log('🎯 阶段:', data.stage)
    console.log('📄 消息:', data.message)
    console.log('⏰ 时间:', new Date().toLocaleTimeString())

    if (globalUpdateFunctions.setCurrentStatus && globalUpdateFunctions.setGenerationProgress && globalUpdateFunctions.setProgress) {
      try {
        globalUpdateFunctions.setCurrentStatus(data.message)
        globalUpdateFunctions.setGenerationProgress(prev => {
          if (data.stage === 'search') return 30
          if (data.stage === 'generate') return 60
          return prev
        })
        globalUpdateFunctions.setProgress(prev => [...prev, {
          type: 'progress',
          stage: data.stage,
          message: data.message,
          timestamp: new Date().toLocaleTimeString()
        }])
      } catch (error) {
        console.error('❌ 状态更新失败:', error)
      }
    } else {
      console.warn('⚠️ 全局状态函数不可用，无法更新状态')
    }
  }

  const handleGenerationComplete = (data) => {
    console.log('🎉 ====== 收到generation_complete事件 ======')
    console.log('📁 文件路径:', data.filepath)
    console.log('📝 文章标题:', data.title)
    console.log('📄 消息:', data.message)
    console.log('⏰ 时间:', new Date().toLocaleTimeString())

    if (globalUpdateFunctions.setCurrentStatus && globalUpdateFunctions.setGenerationProgress && 
        globalUpdateFunctions.setProgress && globalUpdateFunctions.setIsGenerating) {
      try {
        globalUpdateFunctions.setCurrentStatus('生成完成！')
        globalUpdateFunctions.setGenerationProgress(100)
        globalUpdateFunctions.setProgress(prev => [...prev, {
          type: 'success',
          message: `文章已保存: ${data.title}`,
          timestamp: new Date().toLocaleTimeString()
        }])
        globalUpdateFunctions.setIsGenerating(false)
        alert(`文章生成成功！文件: ${data.filepath}`)
      } catch (error) {
        console.error('❌ 状态更新失败:', error)
        // 即使状态更新失败，也显示成功提示
        alert(`文章生成成功！文件: ${data.filepath}`)
      }
    } else {
      console.warn('⚠️ 全局状态函数不可用，但显示成功提示')
      alert(`文章生成成功！文件: ${data.filepath}`)
    }
  }

  const handleGenerationError = (data) => {
    console.log('❌ ====== 收到generation_error事件 ======')
    console.log('🚨 错误:', data.error)
    console.log('📄 消息:', data.message)
    console.log('⏰ 时间:', new Date().toLocaleTimeString())

    if (globalUpdateFunctions.setCurrentStatus && globalUpdateFunctions.setProgress && globalUpdateFunctions.setIsGenerating) {
      try {
        globalUpdateFunctions.setCurrentStatus('生成失败')
        globalUpdateFunctions.setProgress(prev => [...prev, {
          type: 'error',
          message: data.message,
          timestamp: new Date().toLocaleTimeString()
        }])
        globalUpdateFunctions.setIsGenerating(false)
        alert(`生成失败: ${data.error}`)
      } catch (error) {
        console.error('❌ 状态更新失败:', error)
        alert(`生成失败: ${data.error}`)
      }
    } else {
      console.warn('⚠️ 全局状态函数不可用，但显示错误提示')
      alert(`生成失败: ${data.error}`)
    }
  }

  // 注册事件监听器
  console.log('🔗 正在注册 generation_started 监听器...')
  socket.on('generation_started', handleGenerationStarted)
  
  console.log('🔗 正在注册 generation_progress 监听器...')
  socket.on('generation_progress', handleGenerationProgress)
  
  console.log('🔗 正在注册 generation_complete 监听器...')
  socket.on('generation_complete', handleGenerationComplete)
  
  console.log('🔗 正在注册 generation_error 监听器...')
  socket.on('generation_error', handleGenerationError)

  // 添加测试事件监听
  socket.on('test_response', (data) => {
    console.log('🧪 ====== 收到test_response事件 ======')
    console.log('📦 数据:', data)
  })

  // 添加connected事件确认
  socket.on('connected', (data) => {
    console.log('✅ ====== 收到connected事件 ======')
    console.log('📦 数据:', data)
  })

  eventListenersRegistered = true
  console.log('✅ ====== 全局WebSocket事件监听器注册完成 ======')

  // 验证注册结果
  console.log('🔍 验证事件监听器注册:')
  console.log('generation_started:', socket.hasListeners('generation_started'))
  console.log('generation_progress:', socket.hasListeners('generation_progress'))
  console.log('generation_complete:', socket.hasListeners('generation_complete'))
  console.log('generation_error:', socket.hasListeners('generation_error'))
  
  // 添加调试函数 - 可以在浏览器控制台调用
  window.debugSocket = () => {
    console.log('=== Socket.IO 调试信息 ===')
    console.log('🆔 Socket ID:', socket.id)
    console.log('🔗 连接状态:', socket.connected)
    console.log('🚀 传输方式:', socket.io.engine?.transport?.name)
    console.log('📡 监听器状态:')
    console.log('  - generation_started:', socket.hasListeners('generation_started'))
    console.log('  - generation_progress:', socket.hasListeners('generation_progress'))
    console.log('  - generation_complete:', socket.hasListeners('generation_complete'))
    console.log('  - generation_error:', socket.hasListeners('generation_error'))
    console.log('📝 全局状态函数:', {
      setCurrentStatus: !!globalUpdateFunctions.setCurrentStatus,
      setProgress: !!globalUpdateFunctions.setProgress,
      setGenerationProgress: !!globalUpdateFunctions.setGenerationProgress,
      setIsGenerating: !!globalUpdateFunctions.setIsGenerating
    })
    
    // 发送测试事件
    console.log('🧪 发送测试事件...')
    socket.emit('test_event', { 
      message: '调试测试', 
      timestamp: new Date().toISOString(),
      debug: true
    })
  }
  
  console.log('💡 调试提示: 在浏览器控制台输入 debugSocket() 可以查看Socket状态')
}

export { socket, registerGlobalEventListeners, globalUpdateFunctions }