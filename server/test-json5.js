const SiliconFlowService = require('./services/siliconFlowService');

// 测试JSON5解析功能
const service = new SiliconFlowService();

// 测试不同格式的JSON内容
const testCases = [
  // 标准JSON
  '{"componentName": "Button", "props": {"text": "Click me"}}',
  
  // JSON5格式（带注释和尾随逗号）
  `{
    // 这是一个按钮组件
    componentName: "Button",
    props: {
      text: "Click me", // 按钮文本
      type: "primary",
    }, // 尾随逗号
  }`,
  
  // Markdown代码块格式
  `\`\`\`json
  {
    "componentName": "Form",
    "props": {
      "title": "用户表单"
    }
  }
  \`\`\``,
  
  // JSON5代码块格式
  `\`\`\`json5
  {
    // 表单组件
    componentName: "Form",
    props: {
      title: "用户表单",
      fields: [
        { name: "username", type: "input" },
        { name: "email", type: "email" },
      ],
    },
  }
  \`\`\``
];

console.log('🧪 开始测试JSON5解析功能...\n');

testCases.forEach((testCase, index) => {
  console.log(`📝 测试用例 ${index + 1}:`);
  console.log('输入:', testCase.substring(0, 100) + (testCase.length > 100 ? '...' : ''));
  
  try {
    const result = service.parseComplexSchema(testCase);
    console.log('✅ 解析成功:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ 解析失败:', error.message);
  }
  
  console.log('---\n');
});

console.log('🎯 测试完成!');