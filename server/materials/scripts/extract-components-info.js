const fs = require('fs');
const path = require('path');

// 读取组件目录
const fusionUiDir = '/Users/junhuang/fe/lowcode-materials/server/materials/fusion-ui';
const fusionLowcodeDir = '/Users/junhuang/fe/lowcode-materials/server/materials/fusion-lowcode-materials';

function extractComponentInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let componentName = '';
    let componentTitle = '';
    let componentGroup = '';
    let componentCategory = '';
    let description = '';
    
    // 提取基本信息
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('**组件名称**:')) {
        componentName = line.split(':')[1].trim();
      } else if (line.includes('**组件标题**:')) {
        componentTitle = line.split(':')[1].trim();
      } else if (line.includes('**组件分组**:')) {
        componentGroup = line.split(':')[1].trim();
      } else if (line.includes('**组件分类**:')) {
        componentCategory = line.split(':')[1].trim();
      } else if (line.startsWith('## 描述') || line.startsWith('## 组件描述')) {
        // 读取描述内容
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('##'); j++) {
          if (lines[j].trim()) {
            description = lines[j].trim();
            break;
          }
        }
      }
    }
    
    return {
      componentName,
      componentTitle,
      componentGroup,
      componentCategory,
      description
    };
  } catch (error) {
    return null;
  }
}

// 读取所有组件
const components = [];

// 读取fusion-ui组件
if (fs.existsSync(fusionUiDir)) {
  const files = fs.readdirSync(fusionUiDir).filter(f => f.endsWith('.md') && f !== 'index.md');
  files.forEach(file => {
    const info = extractComponentInfo(path.join(fusionUiDir, file));
    if (info && info.componentName) {
      components.push({
        ...info,
        library: 'fusion-ui',
        fileName: file
      });
    }
  });
}

// 读取fusion-lowcode-materials组件
if (fs.existsSync(fusionLowcodeDir)) {
  const files = fs.readdirSync(fusionLowcodeDir).filter(f => f.endsWith('.md') && f !== 'index.md');
  files.forEach(file => {
    const info = extractComponentInfo(path.join(fusionLowcodeDir, file));
    if (info && info.componentName) {
      components.push({
        ...info,
        library: 'fusion-lowcode-materials',
        fileName: file
      });
    }
  });
}

// 按分类分组
const groupedComponents = {};
components.forEach(comp => {
  const category = comp.componentCategory || '其他';
  if (!groupedComponents[category]) {
    groupedComponents[category] = [];
  }
  groupedComponents[category].push(comp);
});

console.log('=== 组件统计 ===');
console.log('总组件数:', components.length);
console.log('');

console.log('=== 按分类分组 ===');
Object.keys(groupedComponents).sort().forEach(category => {
  console.log(`${category}:`);
  groupedComponents[category].forEach(comp => {
    console.log(`  - ${comp.componentName} (${comp.componentTitle}) - ${comp.library}`);
  });
  console.log('');
});

// 输出JSON格式供其他脚本使用
if (process.argv.includes('--json')) {
  console.log('=== JSON输出 ===');
  console.log(JSON.stringify(components, null, 2));
}