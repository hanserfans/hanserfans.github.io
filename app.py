"""
智能体写作系统 - Flask后端API
提供RESTful API和WebSocket实时通信
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from enhanced_agent import EnhancedWritingAgent
from api_config import get_config
import json
import os
from pathlib import Path
from datetime import datetime
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', 
                   logger=True, engineio_logger=True,
                   ping_timeout=60,  # 增加ping超时到60秒
                   ping_interval=25)  # 增加ping间隔到25秒

# 全局智能体实例
agent_instance = None
agent_lock = threading.Lock()

# 生成任务状态存储
generation_status = {
    'is_generating': False,
    'current_stage': '',
    'message': '',
    'progress': 0,
    'title': '',
    'error': None,
    'result': None,
    'last_updated': None
}
status_lock = threading.Lock()

def basic_markdown_optimize(content):
    """基础Markdown格式优化（AI优化失败时的fallback）"""
    import re

    # 规范化标题格式
    content = re.sub(r'^#+\s*', lambda m: m.group(0).rstrip() + ' ', content, flags=re.MULTILINE)

    # 规范化列表格式（统一使用 - ）
    content = re.sub(r'^\*\s+', '- ', content, flags=re.MULTILINE)

    # 规范化图片引用
    content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', lambda m: f'![{m.group(1).strip()}]({m.group(2).strip()})', content)

    # 规范化链接格式
    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: f'[{m.group(1).strip()}]({m.group(2).strip()})', content)

    # 确保代码块前后有空行
    content = re.sub(r'(?<!\n\n)```', '\n\n```', content)
    content = re.sub(r'```(?!\n\n)', '```\n\n', content)

    # 移除多余空行
    content = re.sub(r'\n{3,}', '\n\n', content)

    return content.strip()

def get_agent():
    """获取智能体实例（单例模式）"""
    global agent_instance
    if agent_instance is None:
        config = get_config()
        api_keys = config.get_api_keys()
        agent_instance = EnhancedWritingAgent(api_keys["blog_path"], api_keys)
    return agent_instance

# ==================== RESTful API ====================

@app.route('/api/status', methods=['GET'])
def get_status():
    """获取系统状态"""
    try:
        config = get_config()
        agent = get_agent()
        current_provider = config.get_current_provider()

        return jsonify({
            'status': 'healthy',
            'services': {
                'ai_service': agent.ai_client is not None,
                'ai_provider': current_provider.name if current_provider else '未配置',
                'ai_model': current_provider.model if current_provider else '未配置',
                'ai_base_url': current_provider.base_url if current_provider else '未配置',
                'tavily_search': agent.tavily_search is not None,
                'blog_path': config.get("blog_path")
            },
            'memory': {
                'created_posts': len(agent.memory.get('created_posts', [])),
                'search_history': len(agent.memory.get('search_history', [])),
                'last_updated': agent.memory.get('last_updated')
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/generation/status', methods=['GET'])
def get_generation_status():
    """获取当前生成任务状态（HTTP轮询方式）"""
    try:
        with status_lock:
            status_data = generation_status.copy()
            if status_data['last_updated']:
                status_data['last_updated'] = status_data['last_updated'].isoformat()
            return jsonify(status_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """获取所有文章列表"""
    try:
        blog_path = get_config().get("blog_path")
        posts_path = Path(blog_path) / "_posts"

        posts = []
        for post_file in posts_path.glob("*.md"):
            try:
                content = post_file.read_text(encoding='utf-8')
                # 提取front matter
                if content.startswith('---'):
                    front_matter_end = content.find('---', 3)
                    front_matter = content[3:front_matter_end]

                    # 解析基本元数据
                    title = "无标题"
                    date = post_file.stem[:10]  # 从文件名提取日期
                    tags = []

                    for line in front_matter.split('\n'):
                        if line.startswith('title:'):
                            title = line.split(':', 1)[1].strip().strip('"').strip("'")
                        elif line.startswith('date:'):
                            date = line.split(':', 1)[1].strip()
                        elif line.strip().startswith('- '):
                            tag = line.strip().replace('- ', '')
                            if tag and 'tags' not in front_matter.split('tags')[0]:
                                tags.append(tag)

                    posts.append({
                        'filename': post_file.name,
                        'title': title,
                        'date': date,
                        'tags': tags,
                        'path': str(post_file)
                    })
            except Exception as e:
                print(f"处理文章 {post_file.name} 时出错: {e}")

        # 按日期排序
        posts.sort(key=lambda x: x['date'], reverse=True)

        return jsonify({'posts': posts})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<filename>', methods=['GET'])
def get_post_content(filename):
    """获取文章内容"""
    try:
        blog_path = get_config().get("blog_path")
        post_path = Path(blog_path) / "_posts" / filename

        if not post_path.exists():
            return jsonify({'error': '文章不存在'}), 404

        content = post_path.read_text(encoding='utf-8')

        # 确保返回正确的内容类型和编码
        response = jsonify({'content': content})
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<filename>', methods=['PUT'])
def update_post_content(filename):
    """更新或创建文章内容"""
    try:
        data = request.json
        content = data.get('content', '')

        if not content:
            return jsonify({'error': '内容不能为空'}), 400

        blog_path = get_config().get("blog_path")
        post_path = Path(blog_path) / "_posts" / filename

        # 如果文件不存在，创建新文件
        if not post_path.exists():
            print(f"📝 创建新文章: {filename}")
        else:
            print(f"📝 更新现有文章: {filename}")

        # 保存文件，确保使用UTF-8编码
        post_path.write_text(content, encoding='utf-8')

        # 返回保存后的内容进行验证
        saved_content = post_path.read_text(encoding='utf-8')
        print(f"💾 保存验证 - 原始内容长度: {len(content)}, 保存后长度: {len(saved_content)}")
        print(f"💾 内容检查: 包含中文{'✅' if any('\u4e00' <= char <= '\u9fff' for char in saved_content) else '❌'}")

        response = jsonify({
            'success': True,
            'message': '文章保存成功',
            'filename': filename,
            'content_preview': saved_content[:100] + '...' if len(saved_content) > 100 else saved_content
        })
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_article():
    """生成新文章（异步）"""
    try:
        data = request.json
        title = data.get('title', '未命名文章')
        topic = data.get('topic', title)
        subtitle = data.get('subtitle', '')
        tags = data.get('tags', [])

        # 启动异步生成任务
        def generate_task():
            nonlocal title, topic, subtitle, tags
            try:
                print(f"🚀 开始异步生成任务，标题: {title}")

                # 更新状态：开始生成
                def update_status(stage, message, progress):
                    with status_lock:
                        generation_status.update({
                            'is_generating': True,
                            'current_stage': stage,
                            'message': message,
                            'progress': progress,
                            'title': title,
                            'error': None,
                            'result': None,
                            'last_updated': datetime.now()
                        })
                    print(f"📊 状态更新: {stage} - {message} ({progress}%)")

                update_status('starting', '开始生成任务', 5)

                agent = get_agent()

                # 搜索阶段
                update_status('searching', f'正在搜索关于"{topic}"的信息...', 20)
                print(f"🔍 开始搜索关于'{topic}'的信息...")
                research = agent.research_topic(topic)
                print(f"✅ 搜索完成，结果数量: {len(research) if research else 0}")
                update_status('searching', '搜索完成，正在整理信息...', 40)

                # 生成阶段
                update_status('generating', '正在基于研究结果生成文章...', 60)
                print(f"🤖 正在基于研究结果生成文章...")
                filepath = agent.create_ai_generated_post(
                    title=title,
                    topic=topic,
                    subtitle=subtitle,
                    tags=tags
                )
                print(f"✅ AI辅助文章已创建: {filepath}")

                # 完成状态
                update_status('completed', '文章生成完成！', 100)
                with status_lock:
                    generation_status.update({
                        'is_generating': False,
                        'result': {'filepath': filepath, 'title': title},
                        'last_updated': datetime.now()
                    })

                print("🎉 生成任务完成")

                # 仍然尝试发送Socket.IO事件（可选）
                try:
                    socketio.emit('generation_complete', {
                        'filepath': filepath,
                        'title': title,
                        'message': '文章生成完成！'
                    }, namespace='/')
                    print("📤 Socket.IO事件发送尝试完成")
                except Exception as e:
                    print(f"⚠️ Socket.IO事件发送失败（不影响结果）: {e}")

            except Exception as e:
                print(f"❌ 生成任务出错: {str(e)}")
                import traceback
                traceback.print_exc()

                # 更新错误状态
                with status_lock:
                    generation_status.update({
                        'is_generating': False,
                        'current_stage': 'error',
                        'error': str(e),
                        'last_updated': datetime.now()
                    })

                # 尝试发送错误事件
                try:
                    socketio.emit('generation_error', {
                        'error': str(e),
                        'message': '生成过程中出现错误'
                    }, namespace='/')
                except Exception as socket_error:
                    print(f"⚠️ Socket.IO错误事件发送失败: {socket_error}")

                # 重要：等待前端事件监听器准备就绪
                print("⏰ 等待2秒确保前端事件监听器准备就绪...")
                time.sleep(2)

                # 发送心跳事件保持连接活跃
                print("💓 发送心跳事件确保连接稳定")
                socketio.emit('heartbeat', {'timestamp': datetime.now().isoformat()}, namespace='/')
                time.sleep(0.5)  # 给心跳事件一些时间传播

                # 检查Socket.IO连接（简化版本）
                try:
                    # 使用Socket.IO的房间管理器来获取连接数
                    rooms = socketio.server.manager.rooms
                    main_room = rooms.get('/', {})
                    connected_clients = len(main_room) if main_room else 0
                    print(f"📡 当前Socket.IO连接数: {connected_clients}")
                except Exception as e:
                    print(f"⚠️ 获取连接信息时出错，假定有连接: {e}")
                    connected_clients = 1  # 假定有连接继续执行

                if connected_clients == 0:
                    print("⚠️ 没有客户端连接，但仍尝试发送事件")
                else:
                    print(f"✅ 继续发送事件（连接数: {connected_clients}）")

                agent = get_agent()

                if connected_clients > 0:
                    print("📤 发送generation_started事件到所有客户端")
                    # 添加短暂延迟确保客户端准备好接收事件
                    time.sleep(0.2)

                    # 获取实际的房间信息
                    try:
                        rooms = socketio.server.manager.rooms
                        main_room = rooms.get('/', {})
                        if main_room:
                            print(f"👥 主房间连接数: {len(main_room)}")
                            # 打印所有连接的详细信息
                            for key, value in main_room.items():
                                print(f"  连接键: {key}, 值: {value}")
                    except Exception as e:
                        print(f"⚠️ 获取房间信息失败: {e}")

                    # 直接emit，默认会广播到所有连接的客户端
                    print("📡 广播事件到所有客户端...")

                    # 尝试不同的发送方式
                    try:
                        # 方法1：直接emit
                        socketio.emit('generation_started', {'title': title}, namespace='/')
                        print("✅ 方法1：直接emit成功")

                        # 方法2：使用to=None广播到所有人
                        socketio.emit('generation_started', {'title': title}, to=None, namespace='/')
                        print("✅ 方法2：to=None广播成功")

                    except Exception as e:
                        print(f"⚠️ 发送事件时出错: {e}")

                    print("📤 generation_started发送完成")

                    # 验证事件发送
                    print("🔍 验证事件发送状态")
                    try:
                        print(f"📡 事件发送后的连接数: {len(socketio.server.manager.rooms.get('/', {}))}")
                    except:
                        print("📡 无法获取详细连接信息")
                else:
                    print("⚠️ 跳过generation_started事件（无连接）")

                time.sleep(0.5)  # 增加延迟确保事件发送

                # 搜索阶段
                print(f"🔍 开始搜索关于'{topic}'的信息...")
                research = agent.research_topic(topic)
                print(f"✅ 搜索完成，结果数量: {len(research) if research else 0}")

                if connected_clients > 0:
                    print("📤 发送generation_progress事件 (search阶段)")
                    progress_data = {
                        'stage': 'search',
                        'message': f'正在搜索关于"{topic}"的信息...'
                    }
                    print(f"📦 发送数据: {progress_data}")
                    # 添加延迟确保客户端准备好接收
                    time.sleep(0.1)
                    result = socketio.emit('generation_progress', progress_data, namespace='/')
                    print(f"📤 generation_progress发送结果: {result}")
                    
                    # 添加确认机制
                    if result is None:
                        print("⚠️ 事件发送返回None，这通常表示发送成功但无确认")
                else:
                    print("⚠️ 跳过generation_progress事件（无连接）")

                # 生成阶段
                print(f"🤖 正在基于研究结果生成文章...")
                filepath = agent.create_ai_generated_post(
                    title=title,
                    topic=topic,
                    subtitle=subtitle,
                    tags=tags
                )
                print(f"✅ AI辅助文章已创建: {filepath}")

                # 再次检查连接状态（可能在生成过程中变化）
                try:
                    rooms = socketio.server.manager.rooms
                    main_room = rooms.get('/', {})
                    current_clients = len(main_room) if main_room else 0
                    print(f"📡 生成完成后连接数: {current_clients}")
                except Exception as e:
                    print(f"⚠️ 获取连接信息时出错: {e}")
                    current_clients = 1  # 假设有连接

                if current_clients > 0:
                    print("📤 发送generation_complete事件")
                    # 添加延迟确保客户端准备好接收
                    time.sleep(0.1)
                    result = socketio.emit('generation_complete', {
                        'filepath': filepath,
                        'title': title,
                        'message': '文章生成完成！'
                    }, namespace='/')
                    print(f"📤 generation_complete发送结果: {result}")
                    
                    # 添加确认机制
                    if result is None:
                        print("⚠️ 事件发送返回None，这通常表示发送成功但无确认")
                else:
                    print("⚠️ 跳过generation_complete事件（无连接）")
                    print("📢 建议刷新页面查看文章生成结果")

                print("🎉 生成任务完成")

            except Exception as e:
                print(f"❌ 生成任务出错: {str(e)}")
                import traceback
                traceback.print_exc()

                print("📤 发送generation_error事件")
                socketio.emit('generation_error', {
                    'error': str(e),
                    'message': '生成过程中出现错误'
                }, namespace='/')
                print("📤 generation_error发送结果完成")

        # 在新线程中执行
        print("🧵 启动生成线程")
        thread = threading.Thread(target=generate_task)
        thread.start()

        return jsonify({
            'status': 'started',
            'message': '文章生成已开始，请查看进度'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search_topic():
    """搜索主题"""
    try:
        data = request.json
        topic = data.get('topic', '')

        if not topic:
            return jsonify({'error': '主题不能为空'}), 400

        agent = get_agent()
        results = agent.research_topic(topic)

        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/memory', methods=['GET'])
def get_memory():
    """获取智能体记忆"""
    try:
        agent = get_agent()
        return jsonify(agent.memory)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== WebSocket事件 ====================

@socketio.on('connect')
def handle_connect():
    """客户端连接"""
    print(f'🟢 客户端已连接: {request.sid}')
    print(f'🆔 连接的客户端ID: {request.sid}')
    print(f'📍 命名空间: {request.namespace}')

    # 发送连接确认消息
    emit('connected', {'message': '已连接到智能体服务', 'socket_id': request.sid})
    print(f'📤 已发送connected事件到客户端 {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    """客户端断开"""
    print(f'🔴 客户端已断开: {request.sid}')

@socketio.on('ping')
def handle_ping():
    """心跳检测"""
    print(f'💓 收到ping from {request.sid}')
    emit('pong', {'timestamp': datetime.now().isoformat()})
    print(f'📤 已发送pong到客户端 {request.sid}')

# 添加测试事件处理
@socketio.on('test_event')
def handle_test_event(data):
    """测试事件处理"""
    print(f'🧪 收到测试事件 from {request.sid}: {data}')
    # 发送响应给发送者
    emit('test_response', {'message': '测试事件已接收', 'data': data})
    # 广播测试消息给所有客户端
    socketio.emit('broadcast_test', {'message': '这是一条广播测试消息', 'original_data': data}, namespace='/')
    print(f'📤 已发送broadcast_test到所有客户端')

# 添加调试端点
@app.route('/api/debug/socket', methods=['GET'])
def debug_socket():
    """调试Socket.IO连接状态"""
    try:
        debug_info = {
            'socketio_config': {
                'async_mode': socketio.async_mode,
                'cors_allowed_origins': socketio.cors_allowed_origins
            }
        }
        
        # 尝试获取连接信息
        try:
            rooms = socketio.server.manager.rooms
            main_room = rooms.get('/', {})
            debug_info['connections'] = {
                'total_clients': len(main_room) if main_room else 0,
                'rooms': {str(k): len(v) for k, v in rooms.items()}
            }
        except Exception as e:
            debug_info['connections_error'] = str(e)
        
        # 发送测试事件
        socketio.emit('debug_test', {'message': '调试测试事件', 'timestamp': datetime.now().isoformat()}, namespace='/')
        debug_info['test_event_sent'] = True
        
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== 图片上传API ====================

@app.route('/api/upload/image', methods=['POST'])
def upload_image():
    """上传图片并返回Markdown格式的链接"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': '没有上传文件'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400

        # 检查文件类型
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not file.filename.split('.')[-1].lower() in allowed_extensions:
            return jsonify({'error': '不支持的文件格式，请上传png/jpg/jpeg/gif/webp格式'}), 400

        # 生成唯一文件名
        import uuid
        import os
        from datetime import datetime

        file_ext = file.filename.split('.')[-1].lower()
        unique_filename = f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}.{file_ext}"

        # 获取博客路径并保存到正确的目录
        blog_path = get_config().get("blog_path")
        upload_dir = Path(blog_path) / "img"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 保存文件
        file_path = upload_dir / unique_filename
        file.save(file_path)

        # 生成Markdown格式的图片链接（博客系统的路径格式）
        image_url = f"/img/{unique_filename}"

        print(f"✅ 图片上传成功到博客目录: {unique_filename}")

        return jsonify({
            'success': True,
            'url': image_url,
            'filename': unique_filename,
            'original_filename': file.filename,
            'size': os.path.getsize(file_path)
        })

    except Exception as e:
        print(f"❌ 图片上传失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/optimize-markdown', methods=['POST'])
def optimize_markdown():
    """优化Markdown格式"""
    try:
        data = request.json
        content = data.get('content', '')

        if not content:
            return jsonify({'error': '内容不能为空'}), 400

        print(f'📝 开始优化Markdown格式，内容长度: {len(content)}')

        # 构建优化提示词
        optimization_prompt = f"""请严格优化以下Markdown文章的**格式**，但**绝对不能改变或添加任何内容**。

**严格遵守的要求：**
1. ⚠️ **禁止添加任何新内容** - 只能修改格式，不能改变语义
2. ⚠️ **禁止删除任何内容** - 原文的每个字、每个标点都要保留
3. **规范化标题层级**（# ## ### 等）
4. **统一列表格式**（使用 - 或 *）
5. **规范化图片引用语法**
6. **统一代码块标记**
7. **确保链接格式正确**
8. **优化空行和缩进**
9. **保留完整的YAML front matter**（如果有）
10. **保留引用块**（> 开头的）

**关键原则：**
- 如果原文有10段文字，优化后还是10段文字
- 如果原文有2个标题，优化后还是2个标题
- 只能改变文字的**格式**，不能改变文字的**内容**
- 可以调整空行、缩进、列表符号等
- 不能添加解释、评论、新的段落

**原文（必须原封不动地保留，只改格式）：**
{content}

**输出要求：**
直接输出优化后的Markdown内容，不要添加任何说明文字。"""

        # 使用项目中已有的智能体进行优化
        try:
            from enhanced_agent import MiniMaxProvider
            config = get_config()
            api_keys = config.get_api_keys()

            ai_provider = MiniMaxProvider(
                api_key=api_keys["ai_api_key"],
                model=api_keys["ai_model"],
                base_url=api_keys["ai_base_url"]
            )

            optimized_content = ai_provider.generate_content(optimization_prompt)

            # 检查是否是错误消息
            if optimized_content.startswith("生成内容时出错") or optimized_content.startswith("API调用失败"):
                print(f"⚠️ AI优化失败，使用基础格式优化")
                optimized_content = basic_markdown_optimize(content)
            else:
                # 移除可能的代码块标记
                if optimized_content.startswith('```markdown'):
                    optimized_content = optimized_content.replace('```markdown', '').replace('```', '').strip()
                elif optimized_content.startswith('```'):
                    # 移除首尾的代码块标记
                    lines = optimized_content.split('\n')
                    if lines[0].startswith('```'):
                        lines = lines[1:]
                    if lines[-1].startswith('```'):
                        lines = lines[:-1]
                    optimized_content = '\n'.join(lines).strip()

                # 检查是否添加了内容（长度增加超过10%说明可能添加了新内容）
                if len(optimized_content) > len(content) * 1.1:
                    print(f"⚠️ AI可能添加了新内容（优化后{len(optimized_content)}字符 vs 原文{len(content)}字符），使用基础格式优化")
                    optimized_content = basic_markdown_optimize(content)

        except Exception as e:
            print(f"⚠️ 使用AI优化失败，使用基础格式优化: {str(e)}")
            # 基础格式优化（fallback）
            optimized_content = basic_markdown_optimize(content)

        print(f'✅ Markdown格式优化完成，优化后长度: {len(optimized_content)}')

        return jsonify({
            'success': True,
            'original_content': content,
            'optimized_content': optimized_content,
            'original_length': len(content),
            'optimized_length': len(optimized_content)
        })

    except Exception as e:
        print(f"❌ Markdown格式优化失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/img/<filename>')
def serve_blog_image(filename):
    """提供博客图片文件"""
    try:
        blog_path = get_config().get("blog_path")
        img_dir = Path(blog_path) / "img"
        return send_from_directory(img_dir, filename)
    except Exception as e:
        print(f"❌ 服务图片文件失败: {str(e)}")
        return jsonify({'error': '图片文件不存在'}), 404

# ==================== 静态文件服务 ====================

@app.route('/')
def serve_frontend():
    """提供前端页面"""
    try:
        frontend_path = Path(__file__).parent / "frontend" / "dist"
        if frontend_path.exists():
            return send_from_directory(frontend_path, 'index.html')
        else:
            return jsonify({
                'message': '智能体写作系统API服务',
                'version': '1.0.0',
                'endpoints': {
                    'status': '/api/status',
                    'posts': '/api/posts',
                    'generate': '/api/generate',
                    'search': '/api/search',
                    'memory': '/api/memory',
                    'upload': '/api/upload/image'
                }
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 智能体写作系统后端服务启动中...")
    print("📡 API服务: http://localhost:5001")
    print("🔌 WebSocket服务: ws://localhost:5001")

    # 初始化智能体
    try:
        agent = get_agent()
        print("✅ 智能体系统初始化完成")
    except Exception as e:
        print(f"⚠️  智能体初始化警告: {e}")

    socketio.run(app, debug=True, port=5001, host='0.0.0.0')