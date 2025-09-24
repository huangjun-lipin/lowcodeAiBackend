#!/usr/bin/env node

const fs = require('fs');
const { ComponentAnalyzer, DocumentationGenerator } = require('./analyze-component-source.js');

const components = [
  { name: 'balloon', docName: 'balloon' },
  { name: 'div', docName: 'div' },
  { name: 'link', docName: 'link' },
  { name: 'next-table', docName: 'next-table' },
  { name: 'next-text', docName: 'next-text' },
  { name: 'note-wrapper', docName: 'note-wrapper' },
  { name: 'rich-text', docName: 'rich-text' },
  { name: 'video', docName: 'video' }
];

async function enhanceLowcodeComponents() {
  console.log('开始增强 fusion-lowcode-materials 组件文档...');
  
  for (const comp of components) {
    const componentPath = `/Users/junhuang/fe/lowcode-materials/packages/fusion-lowcode-materials/src/${comp.name}`;
    const docPath = `./fusion-lowcode-materials/${comp.docName}.md`;
    
    if (!fs.existsSync(docPath)) {
      console.log(`文档文件不存在: ${docPath}`);
      continue;
    }
    
    try {
      const analyzer = new ComponentAnalyzer(componentPath, comp.name);
      const analysis = analyzer.analyze();
      const generator = new DocumentationGenerator(analysis, comp.name);
      const enhancedContent = generator.generateMarkdown();
      
      if (enhancedContent.trim()) {
        let content = fs.readFileSync(docPath, 'utf-8');
        
        // 检查是否已经包含源码分析内容
        if (content.includes('## 核心接口定义')) {
          console.log(`${comp.name} 文档已包含源码分析内容，跳过`);
          continue;
        }
        
        const insertPosition = content.indexOf('## 使用示例');
        if (insertPosition !== -1) {
          content = content.substring(0, insertPosition) + enhancedContent + content.substring(insertPosition);
        } else {
          content += enhancedContent;
        }
        
        fs.writeFileSync(docPath, content, 'utf-8');
        console.log(`已增强文档: ${comp.name}`);
      } else {
        console.log(`${comp.name} 没有可分析的内容`);
      }
    } catch (error) {
      console.error(`增强 ${comp.name} 文档失败:`, error.message);
    }
  }
  
  console.log('fusion-lowcode-materials 组件文档增强完成！');
}

if (require.main === module) {
  enhanceLowcodeComponents().catch(console.error);
}

module.exports = { enhanceLowcodeComponents };