#!/usr/bin/env python3
"""
Python 基础示例 - Hello World
这是一个简单的入门示例
"""

# 第一个Python程序
print("Hello, World!")
print("欢迎来到Python的世界！")

# 变量示例
name = "Python Learner"
age = 25
is_learning = True

print(f"\n你好，{name}！")
print(f"你今年 {age} 岁了。")
print(f"正在学习Python：{is_learning}")

# 数据类型示例
print("\n=== 基本数据类型 ===")
print(f"整数 (int): {age}")
print(f"字符串 (str): '{name}'")
print(f"布尔值 (bool): {is_learning}")
print(f"浮点数 (float): {3.14}")

# 列表示例
print("\n=== 列表 (List) ===")
fruits = ["苹果", "香蕉", "橙子", "葡萄"]
print(f"水果列表: {fruits}")
print(f"第一个水果: {fruits[0]}")
print(f"列表长度: {len(fruits)}")

# 字典示例
print("\n=== 字典 (Dictionary) ===")
person = {
    "name": "张三",
    "age": 28,
    "city": "北京"
}
print(f"人物信息: {person}")
print(f"姓名: {person['name']}")

# 函数示例
print("\n=== 函数 (Function) ===")

def greet(name):
    """简单的问候函数"""
    return f"你好，{name}！欢迎学习Python！"

message = greet("同学")
print(message)

def add(a, b):
    """加法函数"""
    return a + b

result = add(10, 20)
print(f"10 + 20 = {result}")

# 循环示例
print("\n=== 循环 (Loop) ===")
print("使用for循环遍历水果列表:")
for fruit in fruits:
    print(f"  - {fruit}")

# 条件判断
print("\n=== 条件判断 (Condition) ===")
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"

print(f"得分: {score}")
print(f"等级: {grade}")

print("\n" + "="*50)
print("✅ 第一个Python程序完成！")
print("📚 继续学习更多内容吧！")
print("="*50)
