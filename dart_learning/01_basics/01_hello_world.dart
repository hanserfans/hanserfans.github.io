/// Dart 基础示例 - Hello World
/// 这是Dart语言的入门示例

// 1. 入口函数
void main() {
  // 打印欢迎信息
  print('=' * 50);
  print('🎉 欢迎来到 Dart 的世界！');
  print('=' * 50);
  print('');

  // 2. 变量声明
  variablesDemo();

  print('');

  // 3. 数据类型
  dataTypesDemo();

  print('');

  // 4. 函数示例
  functionDemo();

  print('');

  // 5. 控制流程
  controlFlowDemo();

  print('');

  // 6. 集合类型
  collectionsDemo();

  print('=' * 50);
  print('✅ Dart 基础示例完成！');
  print('=' * 50);
}

// ============================================================
// 1. 变量声明
// ============================================================
void variablesDemo() {
  print('📝 变量声明示例');
  print('-' * 50);

  // 使用 var 声明变量（类型推断）
  var name = '小明';
  var age = 25;
  var isStudent = true;

  print('姓名: $name');
  print('年龄: $age');
  print('是否是学生: $isStudent');

  // 明确类型声明
  String city = '北京';
  int score = 95;
  double height = 1.75;
  bool isWorking = false;

  print('\n明确类型声明:');
  print('城市: $city');
  print('分数: $score');
  print('身高: ${height}m');
  print('是否工作: $isWorking');

  // final 和 const
  final finalVar = '不可修改';
  // finalVar = '尝试修改'; // ❌ 错误：final变量不能重新赋值

  const constVar = '编译时常量';
  // constVar = '尝试修改'; // ❌ 错误：const变量不能重新赋值

  print('\nfinal 和 const:');
  print('final: $finalVar');
  print('const: $constVar');

  // late 延迟初始化
  late String lateInit;
  // 在使用前必须赋值
  lateInit = '延迟初始化完成';
  print('late: $lateInit');
}

// ============================================================
// 2. 数据类型
// ============================================================
void dataTypesDemo() {
  print('📦 数据类型示例');
  print('-' * 50);

  // 字符串
  String greeting = '你好';
  String name = "Dart";
  String multiline = '''
    这是
    多行
    字符串
  ''';

  print('字符串:');
  print('$greeting, $name!');
  print('多行字符串:$multiline');

  // 数字
  int integer = 42;
  double decimal = 3.14;
  num number = 100; // num 可以是 int 或 double

  print('\n数字:');
  print('整数: $integer');
  print('浮点数: $decimal');
  print('num: $number');

  // 类型转换
  String intToString = integer.toString();
  double stringToDouble = double.parse('3.14');
  int stringToInt = int.parse('42');

  print('\n类型转换:');
  print('int -> String: $intToString');
  print('String -> double: $stringToDouble');
  print('String -> int: $stringToInt');

  // 布尔值
  bool isDartFun = true;
  bool isDartHard = false;

  print('\n布尔值:');
  print('Dart 有趣吗？ $isDartFun');
  print('Dart 难吗？ $isDartHard');

  // 列表（数组）
  List<String> fruits = ['苹果', '香蕉', '橙子'];
  List<int> numbers = [1, 2, 3, 4, 5];

  print('\n列表:');
  print('水果: $fruits');
  print('数字: $numbers');
  print('第一个水果: ${fruits[0]}');
  print('列表长度: ${fruits.length}');

  // 集合
  Set<String> colors = {'红色', '绿色', '蓝色'};
  print('\n集合:');
  print('颜色: $colors');

  // 映射（字典）
  Map<String, int> scores = {
    '语文': 90,
    '数学': 95,
    '英语': 88,
  };

  print('\n映射:');
  print('成绩: $scores');
  print('数学成绩: ${scores['数学']}');

  // Runes（符文）用于处理特殊字符
  String emoji = '😀 🎉 🚀';
  print('\n特殊字符: $emoji');
}

// ============================================================
// 3. 函数
// ============================================================
void functionDemo() {
  print('🔧 函数示例');
  print('-' * 50);

  // 基本函数
  int add(int a, int b) {
    return a + b;
  }

  print('基本函数: add(10, 20) = ${add(10, 20)}');

  // 箭头函数（单表达式）
  int multiply(int a, int b) => a * b;
  print('箭头函数: multiply(3, 4) = ${multiply(3, 4)}');

  // 可选参数
  String greet(String name, [String? title]) {
    if (title != null) {
      return '你好, $title $name!';
    }
    return '你好, $name!';
  }

  print('可选参数: ${greet('小明')}, ${greet('小红', '女士')}');

  // 默认参数值
  String say(String message, [String symbol = '🎯']) {
    return '$symbol $message';
  }

  print('默认参数: ${say('消息')}');
  print('自定义符号: ${say('消息', '✨')}');

  // 命名参数
  String createUser({
    required String name,
    int age = 18,
    String city = '未知',
  }) {
    return '用户: $name, $age岁, 来自$city';
  }

  print('命名参数: ${createUser(name: '张三', age: 25, city: '北京')}');

  // 函数作为参数
  List<int> numbers = [1, 2, 3, 4, 5];
  List<int> squared = numbers.map((n) => n * n).toList();
  print('函数作为参数: ${numbers} 的平方是 $squared');

  // 闭包
  Function makeAdder(int addBy) {
    return (int n) => n + addBy;
  }

  var addBy2 = makeAdder(2);
  var addBy10 = makeAdder(10);

  print('闭包: addBy2(5) = ${addBy2(5)}, addBy10(5) = ${addBy10(5)}');
}

// ============================================================
// 4. 控制流程
// ============================================================
void controlFlowDemo() {
  print('🔀 控制流程示例');
  print('-' * 50);

  // if-else
  int score = 85;
  String grade;

  if (score >= 90) {
    grade = 'A';
  } else if (score >= 80) {
    grade = 'B';
  } else if (score >= 70) {
    grade = 'C';
  } else if (score >= 60) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  print('if-else: 分数 $score 对应等级 $grade');

  // switch
  String day = 'Monday';
  String dayType;

  switch (day) {
    case 'Monday':
    case 'Tuesday':
    case 'Wednesday':
    case 'Thursday':
    case 'Friday':
      dayType = '工作日';
      break;
    case 'Saturday':
    case 'Sunday':
      dayType = '周末';
      break;
    default:
      dayType = '未知';
  }

  print('switch: $day 是 $dayType');

  // for 循环
  print('for 循环:');
  for (int i = 1; i <= 5; i++) {
    print('  * i = $i');
  }

  // for-in 循环
  List<String> fruits = ['苹果', '香蕉', '橙子'];
  print('for-in 循环:');
  for (var fruit in fruits) {
    print('  * $fruit');
  }

  // while 循环
  print('while 循环:');
  int count = 3;
  while (count > 0) {
    print('  * 倒计时: $count');
    count--;
  }

  // do-while 循环
  print('do-while 循环:');
  int num = 1;
  do {
    print('  * $num');
    num++;
  } while (num <= 3);

  // break 和 continue
  print('break 和 continue:');
  for (int i = 1; i <= 10; i++) {
    if (i == 3) continue; // 跳过3
    if (i == 8) break; // 遇到8停止
    print('  * $i');
  }

  // 三元运算符
  int age = 20;
  String status = age >= 18 ? '成年人' : '未成年人';
  print('三元运算符: $status');
}

// ============================================================
// 5. 集合类型
// ============================================================
void collectionsDemo() {
  print('📚 集合类型示例');
  print('-' * 50);

  // List（列表）
  List<String> fruits = ['苹果', '香蕉', '橙子'];

  print('List 操作:');
  print('添加元素: ${fruits.add('葡萄')}');
  print('插入元素: ${fruits.insert(1, '桃子')}');
  print('列表: $fruits');
  print('第一个: ${fruits.first}');
  print('最后一个: ${fruits.last}');
  print('包含香蕉吗？ ${fruits.contains('香蕉')}');

  // List 常用方法
  List<int> numbers = [5, 2, 8, 1, 9];
  numbers.sort();
  print('排序后: $numbers');
  numbers.addAll([3, 7]);
  print('添加多个: $numbers');
  numbers.remove(2);
  print('删除元素: $numbers');

  // Set（集合）
  Set<String> colors = {'红色', '绿色', '蓝色'};

  print('\nSet 操作:');
  print('集合: $colors');
  print('元素个数: ${colors.length}');
  colors.add('黄色');
  print('添加后: $colors');
  colors.remove('绿色');
  print('删除后: $colors');

  // Set 运算
  Set<int> setA = {1, 2, 3, 4, 5};
  Set<int> setB = {4, 5, 6, 7, 8};

  print('集合A: $setA');
  print('集合B: $setB');
  print('交集: ${setA.intersection(setB)}');
  print('并集: ${setA.union(setB)}');
  print('A-B: ${setA.difference(setB)}');

  // Map（映射）
  Map<String, dynamic> person = {
    'name': '张三',
    'age': 25,
    'city': '北京',
  };

  print('\nMap 操作:');
  print('人员信息: $person');
  print('姓名: ${person['name']}');

  person['job'] = '工程师';
  print('添加职业后: $person');

  person['age'] = 26;
  print('修改年龄后: $person');

  person.remove('city');
  print('删除城市后: $person');

  // Map 遍历
  print('遍历 Map:');
  person.forEach((key, value) {
    print('  * $key: $value');
  });

  // 集合推导式（类似列表推导式）
  List<int> nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 找出偶数并平方
  List<int> evenSquares = [
    for (var n in nums) if (n % 2 == 0) n * n
  ];
  print('\n集合推导式:');
  print('偶数平方: $evenSquares');

  // 映射转换
  Map<String, int> ages = {
    '张三': 25,
    '李四': 30,
    '王五': 28,
  };

  var older = Map.fromEntries(
    ages.entries.where((e) => e.value > 26)
  );
  print('年龄大于26的: $older');
}

// ============================================================
// 6. 异常处理
// ============================================================
void exceptionDemo() {
  print('⚠️ 异常处理示例');
  print('-' * 50);

  try {
    int result = 10 ~/ 0; // 整数除法
    print('结果: $result');
  } on IntegerDivisionByZeroException {
    print('❌ 除数不能为零！');
  }

  try {
    var value = int.parse('not a number');
    print('转换结果: $value');
  } on FormatException catch (e) {
    print('❌ 格式错误: $e');
  } catch (e, stackTrace) {
    print('❌ 其他错误: $e');
    print('堆栈信息: $stackTrace');
  } finally {
    print('✅ 清理工作完成');
  }
}

// ============================================================
// 7. 类和对象
// ============================================================
class Person {
  String name;
  int age;
  String city;

  // 构造方法
  Person(this.name, this.age, [this.city = '未知']);

  // 命名构造方法
  Person.guest() : this('访客', 0, '未知');

  // 工厂构造方法
  factory Person.fromMap(Map<String, dynamic> map) {
    return Person(
      map['name'] as String,
      map['age'] as int,
      map['city'] as String? ?? '未知',
    );
  }

  // 方法
  void introduce() {
    print('你好，我是 $name，$age 岁，来自 $city');
  }

  @override
  String toString() {
    return 'Person(name: $name, age: $age, city: $city)';
  }
}

void classDemo() {
  print('🏗️ 类和对象示例');
  print('-' * 50);

  // 创建对象
  var person1 = Person('张三', 25, '北京');
  print('对象: $person1');
  person1.introduce();

  // 命名构造方法
  var guest = Person.guest();
  guest.introduce();

  // 工厂构造方法
  var person2 = Person.fromMap({
    'name': '李四',
    'age': 30,
    'city': '上海',
  });
  person2.introduce();
}