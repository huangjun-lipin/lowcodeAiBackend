const SiliconFlowService = require('./services/siliconFlowService');

// 测试用例
const testCases = [
  {
    name: '标准JSON格式',
    content: `{
  "componentName": "Button",
  "id": "btn-1",
  "props": {
    "type": "primary",
    "size": "medium"
  },
  "children": "Click me"
}`
  },
  {
    name: 'JSON5格式（带注释和尾随逗号）',
    content: `{
  // 这是一个按钮组件
  componentName: "Button",
  id: "btn-2",
  props: {
    type: "primary", // 主要按钮
    size: "large",   // 大尺寸
  },
  children: "Submit", // 按钮文本
}`
  },
  {
    name: 'Markdown代码块包装的JSON',
    content: `\`\`\`json
{
  "componentName": "Input",
  "id": "input-1",
  "props": {
    "placeholder": "请输入内容",
    "required": true
  }
}
\`\`\``
  },
  {
    name: 'Markdown代码块包装的JSON5',
    content: `\`\`\`json5
{
  // 输入框组件
  componentName: "Input",
  id: "input-2",
  props: {
    placeholder: "Enter text here",
    required: true,
    maxLength: 100, // 最大长度限制
  },
  children: null,
}
\`\`\``
  },
  {
    name: '复杂嵌套结构',
    content: `{
  componentName: "Form",
  id: "form-1",
  props: {
    layout: "vertical",
    validateOnChange: true,
  },
  children: [
    {
      componentName: "Input",
      props: { name: "username", label: "用户名" }
    },
    {
      componentName: "Button",
      props: { type: "submit" },
      children: "提交"
    }
  ]
}`
  }
];

async function runTests() {
  console.log('🧪 开始JSON5集成测试...\n');
  
  const service = new SiliconFlowService();
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`📋 测试: ${testCase.name}`);
    console.log(`📄 输入内容:\n${testCase.content}\n`);
    
    try {
      const result = service.parseComplexSchema(testCase.content);
      
      // 验证结果
      if (result && typeof result === 'object' && result.componentName) {
        console.log(`✅ 解析成功!`);
        console.log(`📊 结果:`, JSON.stringify(result, null, 2));
        passedTests++;
      } else {
        console.log(`❌ 解析结果无效:`, result);
      }
    } catch (error) {
      console.log(`❌ 解析失败:`, error.message);
    }
    
    console.log('─'.repeat(60));
  }

  console.log(`\n📈 测试总结:`);
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  console.log(`�� 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！JSON5集成功能正常工作。');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步检查。');
  }
}

runTests().catch(console.error);
