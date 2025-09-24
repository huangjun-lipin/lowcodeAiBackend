#!/usr/bin/env node

/**
 * 集成源码分析功能的文档生成脚本
 * 自动生成组件文档并集成源码分析结果
 */

const fs = require('fs');
const path = require('path');
const { ComponentAnalyzer, DocumentationGenerator } = require('./analyze-component-source.js');

// 配置
const CONFIG = {
  // 源码根目录
  sourceRoot: '/Users/junhuang/fe/lowcode-materials/packages',
  // 文档输出目录
  docsRoot: '/Users/junhuang/fe/lowcode-materials/server/materials',
  // 组件配置
  componentConfigs: {
    'fusion-ui': {
      sourcePath: 'fusion-ui/src/components',
      docsPath: 'fusion-ui',
      components: [
        { name: 'pro-table', docName: 'pro-table' },
        { name: 'pro-form', docName: 'proform' },
        { name: 'pro-dialog', docName: 'prodialog' },
        { name: 'anchor', docName: 'anchor' },
        { name: 'page-header', docName: 'pageheader' }
      ]
    },
    'fusion-lowcode-materials': {
      sourcePath: 'fusion-lowcode-materials/src/components',
      docsPath: 'fusion-lowcode-materials',
      components: [
        { name: 'balloon', docName: 'balloon' },
        { name: 'div', docName: 'div' },
        { name: 'link', docName: 'link' },
        { name: 'next-table', docName: 'next-table' },
        { name: 'next-text', docName: 'next-text' },
        { name: 'note-wrapper', docName: 'note-wrapper' },
        { name: 'rich-text', docName: 'rich-text' },
        { name: 'video', docName: 'video' }
      ]
    }
  }
};

/**
 * 生成基础文档模板
 */
function generateDocTemplate(componentName, category) {
  const template = `# ${componentName}

## 基本信息

- **组件名称**: ${componentName}
- **组件标题**: ${componentName}
- **组件分组**: ${category === 'fusion-ui' ? '高级组件' : '原子组件'}
- **组件分类**: 通用
- **NPM包**: ${category === 'fusion-ui' ? '@alilc/lowcode-materials' : '@alilc/lowcode-materials'}
- **导出名**: ${componentName}

## 组件描述

${componentName} 组件

## 使用示例

\`\`\`jsx
import { ${componentName} } from '@alilc/lowcode-materials';

function App() {
  return (
    <${componentName}>
      示例内容
    </${componentName}>
  );
}
\`\`\`

## API 文档

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| children | ReactNode | - | 子元素 |

### 方法

暂无

### 事件

暂无
`;

  return template;
}

/**
 * 增强单个组件文档
 */
async function enhanceComponentDoc(category, component) {
  const config = CONFIG.componentConfigs[category];
  const componentPath = path.join(CONFIG.sourceRoot, config.sourcePath, component.name);
  const docPath = path.join(CONFIG.docsRoot, config.docsPath, `${component.docName}.md`);

  console.log(`处理组件: ${component.name} (${category})`);

  try {
    // 如果文档不存在，创建基础模板
    if (!fs.existsSync(docPath)) {
      console.log(`  创建基础文档: ${docPath}`);
      const template = generateDocTemplate(component.name, category);
      fs.writeFileSync(docPath, template, 'utf-8');
    }

    // 分析组件源码
    const analyzer = new ComponentAnalyzer(componentPath, component.name);
    const analysis = analyzer.analyze();

    if (!analysis) {
      console.log(`  源码分析失败，跳过: ${component.name}`);
      return;
    }

    // 生成源码分析内容
    const generator = new DocumentationGenerator(analysis, component.name);
    const enhancedContent = generator.generateMarkdown();

    if (!enhancedContent.trim()) {
      console.log(`  没有可分析的内容: ${component.name}`);
      return;
    }

    // 读取现有文档
    let content = fs.readFileSync(docPath, 'utf-8');

    // 检查是否已经包含源码分析内容
    if (content.includes('## 核心接口定义')) {
      console.log(`  文档已包含源码分析内容，跳过: ${component.name}`);
      return;
    }

    // 插入源码分析内容
    const insertPosition = content.indexOf('## 使用示例');
    if (insertPosition !== -1) {
      content = content.substring(0, insertPosition) + enhancedContent + content.substring(insertPosition);
    } else {
      content += enhancedContent;
    }

    // 写入增强后的文档
    fs.writeFileSync(docPath, content, 'utf-8');
    console.log(`  文档增强完成: ${component.name}`);

  } catch (error) {
    console.error(`  增强文档失败 ${component.name}:`, error.message);
  }
}

/**
 * 生成所有组件文档
 */
async function generateAllDocs() {
  console.log('开始生成集成源码分析的组件文档...\n');

  const results = [];

  for (const [category, config] of Object.entries(CONFIG.componentConfigs)) {
    console.log(`处理 ${category} 组件:`);

    for (const component of config.components) {
      await enhanceComponentDoc(category, component);
      results.push({ category, component: component.name });
    }

    console.log('');
  }

  // 生成统计报告
  console.log('文档生成统计:');
  console.log(`- 总组件数: ${results.length}`);
  console.log(`- Fusion UI 组件: ${results.filter(r => r.category === 'fusion-ui').length}`);
  console.log(`- Fusion Lowcode Materials 组件: ${results.filter(r => r.category === 'fusion-lowcode-materials').length}`);

  console.log('\n文档生成完成！');
}

/**
 * 更新现有文档
 */
async function updateExistingDocs() {
  console.log('开始更新现有组件文档的源码分析...\n');

  for (const [category, config] of Object.entries(CONFIG.componentConfigs)) {
    console.log(`更新 ${category} 组件:`);

    for (const component of config.components) {
      const docPath = path.join(CONFIG.docsRoot, config.docsPath, `${component.docName}.md`);
      
      if (fs.existsSync(docPath)) {
        await enhanceComponentDoc(category, component);
      } else {
        console.log(`  文档不存在，跳过: ${component.name}`);
      }
    }

    console.log('');
  }

  console.log('文档更新完成！');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';

  switch (command) {
    case 'generate':
      await generateAllDocs();
      break;
    case 'update':
      await updateExistingDocs();
      break;
    case 'help':
      console.log(`
使用方法:
  node generate-docs-with-analysis.js [command]

命令:
  generate  生成所有组件文档（默认）
  update    更新现有组件文档
  help      显示帮助信息
      `);
      break;
    default:
      console.error(`未知命令: ${command}`);
      console.log('使用 "help" 查看可用命令');
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateAllDocs,
  updateExistingDocs,
  enhanceComponentDoc,
  CONFIG
};