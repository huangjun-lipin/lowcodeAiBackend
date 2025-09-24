const SiliconFlowService = require('./services/siliconFlowService');

// 测试系统提示词大小
const service = new SiliconFlowService();
const systemPrompt = service.getSystemPrompt();

console.log('系统提示词统计:');
console.log('- 字符数:', systemPrompt.length);
console.log('- 字节数:', Buffer.byteLength(systemPrompt, 'utf8'));
console.log('- 行数:', systemPrompt.split('\n').length);

// 显示前500个字符
console.log('\n前500个字符预览:');
console.log(systemPrompt.substring(0, 500));
console.log('...');

// 显示最后500个字符
console.log('\n最后500个字符预览:');
console.log('...');
console.log(systemPrompt.substring(systemPrompt.length - 500));