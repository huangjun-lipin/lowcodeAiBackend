require('dotenv').config();
const SiliconFlowService = require('./services/siliconFlowService');

async function testAPI() {
  console.log('🧪 开始测试Silicon Flow API集成...\n');
  
  const service = new SiliconFlowService();
  
  // 测试健康检查
  console.log('📡 测试健康检查...');
  try {
    const health = await service.healthCheck();
    console.log('✅ 健康检查成功:', health);
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
  }
  
  console.log('\n---\n');
  
  // 测试schema生成
  console.log('🎯 测试schema生成...');
  try {
    const schema = await service.generateSchema('创建一个简单的按钮组件，支持点击事件');
    console.log('✅ Schema生成成功:');
    console.log(JSON.stringify(schema, null, 2));
  } catch (error) {
    console.log('❌ Schema生成失败:', error.message);
    console.log('错误详情:', error);
  }
  
  console.log('\n🎯 测试完成!');
}

testAPI().catch(console.error);