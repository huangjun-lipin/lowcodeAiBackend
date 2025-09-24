require('dotenv').config();
const SiliconFlowService = require('./services/siliconFlowService');

// 测试错误处理功能
const service = new SiliconFlowService();

// 测试各种错误情况
const errorTestCases = [
  // 无效的JSON
  '{ invalid json }',
  
  // 不完整的JSON
  '{"componentName": "Button", "props": {',
  
  // 带有语法错误的JSON5
  `{
    componentName: "Button",
    props: {
      text: "Click me"
      // 缺少逗号
      type: "primary"
    }
  }`,
  
  // 完全不是JSON的内容
  'This is just plain text, not JSON at all.',
  
  // 空内容
  '',
  
  // 只有代码块标记但没有内容
  '```json\n\n```'
];

console.log('🧪 开始测试错误处理功能...\n');

errorTestCases.forEach((testCase, index) => {
  console.log(`📝 错误测试用例 ${index + 1}:`);
  console.log('输入:', testCase.substring(0, 50) + (testCase.length > 50 ? '...' : ''));
  
  try {
    const result = service.parseComplexSchema(testCase);
    console.log('⚠️  意外成功:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('✅ 正确捕获错误:', error.message);
  }
  
  console.log('---\n');
});

console.log('🎯 错误处理测试完成!');