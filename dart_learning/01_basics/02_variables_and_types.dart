/// Dart 变量和数据类型示例

void main() {
  print('=' * 50);
  print('📦 Dart 变量和数据类型');
  print('=' * 50);

  // 1. 变量声明
  print('\n1️⃣ 变量声明');
  print('-' * 50);

  // var 声明
  var name = '小明';
  var age = 25;
  print('var: $name, $age');

  // 明确类型
  String city = '北京';
  int score = 95;
  double height = 1.75;
  bool isStudent = true;
  print('明确类型: $city, $score, $height, $isStudent');

  // dynamic
  dynamic anything = '可以是任何类型';
  anything = 123;
  print('dynamic: $anything');

  // 2. final 和 const
  print('\n2️⃣ final 和 const');
  print('-' * 50);

  final String finalVar = '运行时常量';
  const int constVar = 100;

  print('final: $finalVar');
  print('const: $constVar');

  // 3. 字符串
  print('\n3️⃣ 字符串');
  print('-' * 50);

  String s1 = '单引号';
  String s2 = "双引号";
  String s3 = '''
多行
字符串
''';

  String name2 = '小明';
  int age2 = 25;

  // 字符串插值
  print('你好，$name2！你$age2岁了');
  print('计算: 5+3=${5 + 3}');

  // 常用方法
  print(s1.toUpperCase());
  print(s1.length);
  print(s1.contains('单'));

  // 4. 数字
  print('\n4️⃣ 数字类型');
  print('-' * 50);

  int integer = 42;
  double decimal = 3.14;
  num number = 100;

  print('int: $integer');
  print('double: $decimal');
  print('num: $number');

  // 类型转换
  String fromInt = integer.toString();
  double fromString = double.parse('3.14');
  int fromDouble = decimal.toInt();

  print('类型转换: $fromInt, $fromString, $fromDouble');

  // 5. 布尔值
  print('\n5️⃣ 布尔值');
  print('-' * 50);

  bool isActive = true;
  bool isEmpty = false;

  print('isActive: $isActive');
  print('isEmpty: $isEmpty');

  // 6. List
  print('\n6️⃣ List（列表）');
  print('-' * 50);

  List<String> fruits = ['苹果', '香蕉', '橙子'];
  print('列表: $fruits');
  print('第一个: ${fruits[0]}');
  print('长度: ${fruits.length}');

  fruits.add('葡萄');
  print('添加后: $fruits');

  // 7. Set
  print('\n7️⃣ Set（集合）');
  print('-' * 50);

  Set<String> colors = {'红色', '绿色', '蓝色'};
  print('集合: $colors');
  colors.add('黄色');
  print('添加后: $colors');

  // 8. Map
  print('\n8️⃣ Map（映射）');
  print('-' * 50);

  Map<String, int> scores = {
    '语文': 90,
    '数学': 95,
  };
  print('映射: $scores');
  print('数学成绩: ${scores['数学']}');

  scores['英语'] = 88;
  print('添加后: $scores');

  print('\n' + '=' * 50);
  print('✅ 示例完成！');
  print('=' * 50);
}