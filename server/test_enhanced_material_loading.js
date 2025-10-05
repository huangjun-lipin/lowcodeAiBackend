const MaterialSelectionService = require('./services/materialSelectionService');

async function testEnhancedMaterialLoading() {
  console.log('🧪 测试增强后的物料获取逻辑...\n');
  
  const materialService = new MaterialSelectionService();
  
  // 测试ProTable组件的源码获取
  try {
    console.log('📋 测试ProTable组件源码获取...');
    const sourceCode = await materialService.getMaterialSourceCode('pro-table', 'fusion-ui');
    
    console.log('\n✅ ProTable源码获取结果:');
    console.log('- Meta内容:', sourceCode.meta ? '存在' : '不存在');
    console.log('- Snippets内容:', sourceCode.snippets ? '存在' : '不存在');
    console.log('- Source内容:', sourceCode.source ? '存在' : '不存在');
    
    if (sourceCode.source) {
      const fileCount = Object.keys(sourceCode.source).length;
      console.log(`- 加载的文件数量: ${fileCount}`);
      console.log('- 文件列表:');
      Object.keys(sourceCode.source).forEach((fileName, index) => {
        const content = sourceCode.source[fileName];
        console.log(`  ${index + 1}. ${fileName} (${content.length} 字符)`);
      });
      
      // 显示前3个文件的部分内容
      console.log('\n📄 前3个文件的内容预览:');
      Object.entries(sourceCode.source).slice(0, 3).forEach(([fileName, content]) => {
        console.log(`\n--- ${fileName} ---`);
        console.log(content.substring(0, 200) + '...');
      });
    }
    
  } catch (error) {
    console.error('❌ ProTable测试失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试Button组件的源码获取
  try {
    console.log('📋 测试Button组件源码获取...');
    const sourceCode = await materialService.getMaterialSourceCode('Button', 'fusion-ui');
    
    console.log('\n✅ Button源码获取结果:');
    console.log('- Meta内容:', sourceCode.meta ? '存在' : '不存在');
    console.log('- Snippets内容:', sourceCode.snippets ? '存在' : '不存在');
    console.log('- Source内容:', sourceCode.source ? '存在' : '不存在');
    
    if (sourceCode.source) {
      const fileCount = Object.keys(sourceCode.source).length;
      console.log(`- 加载的文件数量: ${fileCount}`);
      console.log('- 文件列表:');
      Object.keys(sourceCode.source).forEach((fileName, index) => {
        const content = sourceCode.source[fileName];
        console.log(`  ${index + 1}. ${fileName} (${content.length} 字符)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Button测试失败:', error.message);
  }
}

testEnhancedMaterialLoading().catch(console.error);
