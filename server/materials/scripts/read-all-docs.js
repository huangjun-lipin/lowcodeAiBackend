const fs = require('fs');
const path = require('path');

/**
 * 读取所有组件文档内容
 */
function readAllDocs() {
  const materialsDir = path.join(__dirname, '..');
  const fusionUIDir = path.join(materialsDir, 'fusion-ui');
  const fusionLowcodeDir = path.join(materialsDir, 'fusion-lowcode-materials');
  
  let allDocsContent = '';
  
  // 读取fusion-ui目录下的文档
  if (fs.existsSync(fusionUIDir)) {
    const fusionUIFiles = fs.readdirSync(fusionUIDir).filter(file => file.endsWith('.md'));
    allDocsContent += '\n## Fusion UI 组件文档\n\n';
    
    fusionUIFiles.forEach(file => {
      const filePath = path.join(fusionUIDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      allDocsContent += `### ${file}\n\n${content}\n\n---\n\n`;
    });
  }
  
  // 读取fusion-lowcode-materials目录下的文档
  if (fs.existsSync(fusionLowcodeDir)) {
    const fusionLowcodeFiles = fs.readdirSync(fusionLowcodeDir).filter(file => file.endsWith('.md'));
    allDocsContent += '\n## Fusion Lowcode Materials 组件文档\n\n';
    
    fusionLowcodeFiles.forEach(file => {
      const filePath = path.join(fusionLowcodeDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      allDocsContent += `### ${file}\n\n${content}\n\n---\n\n`;
    });
  }
  
  return allDocsContent;
}

// 如果直接运行此脚本，输出所有文档内容
if (require.main === module) {
  const allContent = readAllDocs();
  console.log(allContent);
}

module.exports = { readAllDocs };