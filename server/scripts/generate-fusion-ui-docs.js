const fs = require('fs');
const path = require('path');

// 组件分类映射
const categoryMap = {
  '表格类': 'table',
  '表单类': 'form', 
  '布局容器类': 'layout',
  '内容': 'content',
  '精选组件': 'featured'
};

// 获取所有meta文件
function getAllMetaFiles() {
  const fusionUiPath = '/Users/junhuang/fe/lowcode-materials/packages/fusion-ui/lowcode';
  const metaFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.startsWith('meta.') && (item.endsWith('.ts') || item.endsWith('.js'))) {
        metaFiles.push(fullPath);
      }
    });
  }
  
  scanDirectory(fusionUiPath);
  return metaFiles;
}

// 解析meta文件内容
function parseMetaFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(path.dirname(filePath));
    
    // 提取基本信息
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const categoryMatch = content.match(/category:\s*['"`]([^'"`]+)['"`]/);
    const groupMatch = content.match(/group:\s*['"`]([^'"`]+)['"`]/);
    const componentNameMatch = content.match(/componentName:\s*['"`]([^'"`]+)['"`]/);
    const npmPackageMatch = content.match(/package:\s*['"`]([^'"`]+)['"`]/);
    const versionMatch = content.match(/version:\s*['"`]([^'"`]+)['"`]/);
    const exportNameMatch = content.match(/exportName:\s*['"`]([^'"`]+)['"`]/);
    
    return {
      componentName: componentNameMatch ? componentNameMatch[1] : componentName,
      title: titleMatch ? titleMatch[1] : componentName,
      category: categoryMatch ? categoryMatch[1] : '其他',
      group: groupMatch ? groupMatch[1] : '',
      npmPackage: npmPackageMatch ? npmPackageMatch[1] : '@alifd/fusion-ui',
      version: versionMatch ? versionMatch[1] : '1.0.0',
      exportName: exportNameMatch ? exportNameMatch[1] : componentName,
      filePath: filePath,
      content: content
    };
  } catch (error) {
    console.error(`解析文件失败: ${filePath}`, error.message);
    return null;
  }
}

// 生成markdown文档
function generateMarkdown(componentInfo) {
  const { componentName, title, category, group, npmPackage, version, exportName, content } = componentInfo;
  
  // 提取props配置
  const propsSection = extractPropsFromContent(content);
  const snippetsSection = extractSnippetsFromContent(content);
  
  return `# ${title}

## 基本信息

- **组件名称**: ${componentName}
- **组件标题**: ${title}
- **组件分类**: ${category}
- **组件分组**: ${group}
- **NPM包**: ${npmPackage}
- **版本**: ${version}
- **导出名称**: ${exportName}

## 组件描述

${title}是一个${category}组件，属于${group}。

## 属性配置

${propsSection}

## 使用示例

${snippetsSection}

## 注意事项

1. 请确保正确引入组件依赖
2. 注意组件的属性类型和默认值
3. 根据实际业务需求配置相关属性

---
*此文档由脚本自动生成，基于组件meta配置文件*
`;
}

// 从内容中提取props配置
function extractPropsFromContent(content) {
  // 简化的props提取逻辑
  const propsMatches = content.match(/props:\s*\[([\s\S]*?)\]/);
  if (!propsMatches) return '暂无属性配置信息';
  
  // 提取常见的属性配置
  const nameMatches = content.match(/name:\s*['"`]([^'"`]+)['"`]/g) || [];
  const titleMatches = content.match(/title:\s*['"`]([^'"`]+)['"`]/g) || [];
  
  let propsDoc = '### 主要属性\n\n';
  nameMatches.slice(0, 10).forEach((match, index) => {
    const name = match.match(/['"`]([^'"`]+)['"`]/)[1];
    const title = titleMatches[index] ? titleMatches[index].match(/['"`]([^'"`]+)['"`]/)[1] : name;
    propsDoc += `#### ${name}\n- **描述**: ${title}\n- **类型**: 根据配置确定\n\n`;
  });
  
  return propsDoc;
}

// 从内容中提取snippets示例
function extractSnippetsFromContent(content) {
  const snippetsMatch = content.match(/snippets:\s*\[([\s\S]*?)\]/);
  if (!snippetsMatch) return '暂无使用示例';
  
  return `### 基础用法
\`\`\`json
{
  "componentName": "${content.match(/componentName:\s*['"`]([^'"`]+)['"`]/)?.[1] || 'Component'}",
  "props": {
    // 根据实际需求配置属性
  }
}
\`\`\``;
}

// 主函数
function main() {
  console.log('开始生成fusion-ui组件文档...');
  
  const metaFiles = getAllMetaFiles();
  console.log(`找到 ${metaFiles.length} 个meta文件`);
  
  const outputDir = '/Users/junhuang/fe/lowcode-materials/server/materials/fusion-ui';
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let successCount = 0;
  let failCount = 0;
  
  metaFiles.forEach(filePath => {
    const componentInfo = parseMetaFile(filePath);
    if (componentInfo) {
      const markdown = generateMarkdown(componentInfo);
      const outputPath = path.join(outputDir, `${componentInfo.componentName.toLowerCase()}.md`);
      
      try {
        fs.writeFileSync(outputPath, markdown, 'utf8');
        console.log(`✓ 生成文档: ${componentInfo.title} -> ${outputPath}`);
        successCount++;
      } catch (error) {
        console.error(`✗ 生成失败: ${componentInfo.title}`, error.message);
        failCount++;
      }
    } else {
      failCount++;
    }
  });
  
  console.log(`\n文档生成完成！`);
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);
  
  // 生成索引文件
  generateIndexFile(outputDir);
}

// 生成索引文件
function generateIndexFile(outputDir) {
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'index.md');
  
  let indexContent = `# Fusion UI 组件文档索引

本目录包含所有 Fusion UI 组件的详细文档。

## 组件列表

`;

  files.sort().forEach(file => {
    const componentName = path.basename(file, '.md');
    indexContent += `- [${componentName}](./${file})\n`;
  });
  
  indexContent += `\n## 使用说明

每个组件文档包含以下内容：
- 基本信息：组件名称、分类、NPM包信息等
- 组件描述：组件的主要功能和用途
- 属性配置：详细的属性说明和配置方法
- 使用示例：常见的使用场景和代码示例
- 注意事项：使用时需要注意的要点

## 更新维护

这些文档基于组件的meta配置文件自动生成，当组件配置发生变化时，请重新运行生成脚本更新文档。
`;

  fs.writeFileSync(path.join(outputDir, 'index.md'), indexContent, 'utf8');
  console.log('✓ 生成索引文件: index.md');
}

if (require.main === module) {
  main();
}

module.exports = { main, getAllMetaFiles, parseMetaFile, generateMarkdown };