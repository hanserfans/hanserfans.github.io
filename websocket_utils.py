# 全局WebSocket连接管理
import socket as websocket_client
import threading
import time

# 全局WebSocket客户端（用于测试连接）
test_socket = None
last_connection_check = 0
CONNECTION_CHECK_INTERVAL = 5  # 每5秒检查一次连接状态

def check_websocket_connection():
    """检查WebSocket连接是否活跃"""
    global test_socket, last_connection_check
    
    try:
        if test_socket and hasattr(test_socket, 'connected') and test_socket.connected:
            return True
            
        # 尝试简单的WebSocket ping
        import websockets
        async def ping():
            try:
                async with websockets.connect("ws://localhost:5001/socket.io/?EIO=4&transport=websocket") as ws:
                    return True
            except Exception as e:
                print(f"WebSocket连接检查失败: {e}")
                return False
        
        import asyncio
        result = asyncio.run(ping())
        return result
    except Exception as e:
        print(f"WebSocket连接检查异常: {e}")
        return False

def monitor_websocket_connection():
    """监控WebSocket连接状态"""
    global last_connection_check
    
    while True:
        try:
            is_connected = check_websocket_connection()
            print(f"🔍 WebSocket连接检查: {'✅ 连接正常' if is_connected else '❌ 连接断开'}")
            last_connection_check = time.time()
            time.sleep(CONNECTION_CHECK_INTERVAL)
        except Exception as e:
            print(f"❌ WebSocket监控异常: {e}")
            time.sleep(CONNECTION_CHECK_INTERVAL)

# 启动WebSocket监控线程
def start_websocket_monitor():
    monitor_thread = threading.Thread(target=monitor_websocket_connection, daemon=True)
    monitor_thread.start()
    print("🔧 WebSocket连接监控已启动")

# 手动测试WebSocket连接
def test_websocket_connection():
    """测试WebSocket连接"""
    try:
        print("🔍 开始测试WebSocket连接...")
        
        # 测试HTTP连接
        import requests
        response = requests.get("http://localhost:5001/socket.io/?EIO=4&transport=polling", timeout=5)
        print(f"📡 HTTP Socket.IO响应: {response.status_code}")
        
        # 测试WebSocket连接
        import websockets
        async def test_ws():
            try:
                uri = "ws://localhost:5001/socket.io/?EIO=4&transport=websocket"
                async with websockets.connect(uri, timeout=10) as ws:
                    print("✅ WebSocket连接成功!")
                    
                    # 发送ping消息
                    ping_msg = "2probe"  # Socket.IO ping message
                    await ws.send(ping_msg)
                    print("📤 WebSocket ping已发送")
                    
                    # 等待响应
                    response = await asyncio.wait_for(ws.recv(), timeout=5)
                    print(f"📥 WebSocket响应: {response}")
                    
                    return True
            except Exception as e:
                print(f"❌ WebSocket连接失败: {e}")
                return False
        
        import asyncio
        result = asyncio.run(test_ws())
        return result
        
    except Exception as e:
        print(f"❌ WebSocket测试异常: {e}")
        return False