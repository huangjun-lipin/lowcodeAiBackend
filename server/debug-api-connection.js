require('dotenv').config();
const axios = require('axios');

console.log('🔍 API连接诊断开始...\n');

// 1. 检查环境变量
console.log('📋 环境变量检查:');
console.log('- SILICON_FLOW_API_KEY:', process.env.SILICON_FLOW_API_KEY ? `存在 (长度: ${process.env.SILICON_FLOW_API_KEY.length})` : '❌ 未设置');
console.log('- SILICON_FLOW_BASE_URL:', process.env.SILICON_FLOW_BASE_URL || '❌ 未设置');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log();

// 2. 测试基础网络连接
async function testNetworkConnection() {
  console.log('🌐 网络连接测试:');
  
  try {
    // 测试基础网络
    const response = await axios.get('https://httpbin.org/get', { timeout: 5000 });
    console.log('✅ 基础网络连接正常');
  } catch (error) {
    console.log('❌ 基础网络连接失败:', error.message);
    return false;
  }
  
  try {
    // 测试Silicon Flow域名解析
    const response = await axios.get('https://api.siliconflow.cn', { 
      timeout: 10000,
      validateStatus: () => true // 接受所有状态码
    });
    console.log('✅ Silicon Flow域名可访问，状态码:', response.status);
  } catch (error) {
    console.log('❌ Silicon Flow域名访问失败:', error.message);
    return false;
  }
  
  return true;
}

// 3. 测试API认证
async function testAPIAuth() {
  console.log('\n🔐 API认证测试:');
  
  const apiKey = process.env.SILICON_FLOW_API_KEY;
  const baseURL = process.env.SILICON_FLOW_BASE_URL;
  
  if (!apiKey) {
    console.log('❌ API密钥未设置');
    return false;
  }
  
  try {
    const response = await axios.post(`${baseURL}/v1/chat/completions`, {
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ API认证成功，状态码:', response.status);
    console.log('📊 响应数据:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ API认证失败');
    console.log('📄 错误详情:');
    
    if (error.response) {
      console.log('- 状态码:', error.response.status);
      console.log('- 响应头:', JSON.stringify(error.response.headers, null, 2));
      console.log('- 响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('- 请求配置:', JSON.stringify({
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        timeout: error.config?.timeout
      }, null, 2));
      console.log('- 错误类型: 网络请求失败');
      console.log('- 错误消息:', error.message);
    } else {
      console.log('- 其他错误:', error.message);
    }
    return false;
  }
}

// 4. 测试当前服务配置
async function testCurrentServiceConfig() {
  console.log('\n⚙️ 当前服务配置测试:');
  
  try {
    const SiliconFlowService = require('./services/siliconFlowService');
    const service = new SiliconFlowService();
    
    console.log('✅ 服务实例创建成功');
    console.log('- API Key 长度:', service.apiKey ? service.apiKey.length : 0);
    console.log('- Base URL:', service.baseURL);
    console.log('- 默认配置:', JSON.stringify(service.defaultConfig, null, 2));
    
    return true;
  } catch (error) {
    console.log('❌ 服务配置错误:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  const networkOk = await testNetworkConnection();
  if (!networkOk) {
    console.log('\n🚨 网络连接问题，请检查网络设置');
    return;
  }
  
  const authOk = await testAPIAuth();
  if (!authOk) {
    console.log('\n🚨 API认证问题，请检查API密钥和配置');
  }
  
  const configOk = await testCurrentServiceConfig();
  if (!configOk) {
    console.log('\n🚨 服务配置问题，请检查代码实现');
  }
  
  if (networkOk && authOk && configOk) {
    console.log('\n🎉 所有测试通过，API连接应该正常工作');
  } else {
    console.log('\n⚠️ 发现问题，需要进一步排查');
  }
}

runDiagnostics().catch(console.error);
