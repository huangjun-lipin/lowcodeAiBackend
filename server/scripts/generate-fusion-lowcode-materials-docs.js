const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = '/Users/junhuang/fe/lowcode-materials/packages/fusion-lowcode-materials/lowcode';
const targetDir = '/Users/junhuang/fe/lowcode-materials/server/materials/fusion-lowcode-materials';

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 扫描所有meta.ts文件
function findMetaFiles(dir) {
  const metaFiles = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const metaPath = path.join(fullPath, 'meta.ts');
      if (fs.existsSync(metaPath)) {
        metaFiles.push({
          componentDir: item,
          metaPath: metaPath
        });
      }
    }
  }
  
  return metaFiles;
}

// 解析meta文件内容
function parseMetaFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 使用eval来解析meta配置（简单处理）
    // 注意：这里为了简化处理，使用eval，实际项目中应该使用更安全的方法
    const moduleExports = {};
    const module = { exports: moduleExports };
    
    // 替换require调用为空对象（简化处理）
    const processedContent = content
      .replace(/require\([^)]+\)/g, '{}')
      .replace(/import .+ from .+;/g, '')
      .replace(/export default/, 'module.exports =');
    
    eval(processedContent);
    
    return module.exports || moduleExports;
  } catch (error) {
    console.error(`解析文件失败: ${filePath}`, error.message);
    return null;
  }
}

// 生成属性表格
function generatePropsTable(props) {
  if (!props || props.length === 0) {
    return '暂无属性配置';
  }
  
  let table = '| 属性名 | 类型 | 默认值 | 描述 |\n';
  table += '|--------|------|--------|------|\n';
  
  props.forEach(prop => {
    const name = prop.name || '';
    const type = getTypeString(prop.propType);
    const defaultValue = prop.defaultValue !== undefined ? String(prop.defaultValue) : '-';
    const description = prop.description || prop.title || '';
    
    table += `| ${name} | ${type} | ${defaultValue} | ${description} |\n`;
  });
  
  return table;
}

// 获取类型字符串
function getTypeString(propType) {
  if (typeof propType === 'string') {
    return propType;
  }
  
  if (typeof propType === 'object' && propType !== null) {
    if (propType.type === 'oneOf' && propType.value) {
      return `oneOf: ${propType.value.join(' | ')}`;
    }
    if (propType.type === 'oneOfType' && propType.value) {
      return `oneOfType: ${propType.value.join(' | ')}`;
    }
    if (propType.type) {
      return propType.type;
    }
  }
  
  return 'any';
}

// 生成配置属性表格
function generateConfigPropsTable(configProps) {
  if (!configProps) {
    return '暂无配置属性';
  }
  
  // 处理configure.props可能是对象的情况
  let propsArray = [];
  if (Array.isArray(configProps)) {
    propsArray = configProps;
  } else if (configProps.override && Array.isArray(configProps.override)) {
    propsArray = configProps.override;
  } else if (typeof configProps === 'object') {
    // 如果是对象，尝试提取有用信息
    if (configProps.isExtends) {
      return '继承基础属性配置';
    }
    return '配置对象格式';
  }
  
  if (propsArray.length === 0) {
    return '暂无配置属性';
  }
  
  let table = '| 属性名 | 标题 | 设置器 | 描述 |\n';
  table += '|--------|------|--------|------|\n';
  
  propsArray.forEach(prop => {
    if (prop.type === 'group') {
      // 处理分组
      table += `| **${prop.title}** | 分组 | - | 属性分组 |\n`;
      if (prop.items) {
        prop.items.forEach(item => {
          const name = item.name || '';
          const title = getTitle(item.title) || '';
          const setter = getSetterString(item.setter);
          const description = item.description || '';
          
          table += `| ${name} | ${title} | ${setter} | ${description} |\n`;
        });
      }
    } else {
      const name = prop.name || '';
      const title = getTitle(prop.title) || '';
      const setter = getSetterString(prop.setter);
      const description = prop.description || '';
      
      table += `| ${name} | ${title} | ${setter} | ${description} |\n`;
    }
  });
  
  return table;
}

// 获取标题字符串
function getTitle(title) {
  if (typeof title === 'string') {
    return title;
  }
  
  if (typeof title === 'object' && title !== null) {
    if (title.label) {
      if (typeof title.label === 'string') {
        return title.label;
      }
      if (title.label.zh_CN) {
        return title.label.zh_CN;
      }
    }
  }
  
  return '';
}

// 获取设置器字符串
function getSetterString(setter) {
  if (typeof setter === 'string') {
    return setter;
  }
  
  if (typeof setter === 'object' && setter !== null) {
    if (setter.componentName) {
      return setter.componentName;
    }
  }
  
  return '-';
}

// 生成事件表格
function generateEventsTable(events) {
  if (!events || events.length === 0) {
    return '暂无事件支持';
  }
  
  let table = '| 事件名 | 描述 |\n';
  table += '|--------|------|\n';
  
  events.forEach(event => {
    table += `| ${event} | ${event} 事件 |\n`;
  });
  
  return table;
}

// 生成markdown文档
function generateMarkdown(componentName, meta) {
  const title = meta.title || componentName;
  const description = meta.description || `${title}组件`;
  const group = meta.group || '未分类';
  const category = meta.category || '未分类';
  
  let markdown = `# ${title}\n\n`;
  
  // 基本信息
  markdown += `## 基本信息\n\n`;
  markdown += `- **组件名称**: ${meta.componentName || componentName}\n`;
  markdown += `- **组件标题**: ${title}\n`;
  markdown += `- **组件分组**: ${group}\n`;
  markdown += `- **组件分类**: ${category}\n`;
  
  if (meta.npm) {
    markdown += `- **NPM包**: ${meta.npm.package}\n`;
    markdown += `- **导出名**: ${meta.npm.exportName}\n`;
  }
  
  markdown += `\n## 组件描述\n\n${description}\n\n`;
  
  // 属性配置
  markdown += `## 属性配置\n\n`;
  markdown += `### 基础属性\n\n`;
  markdown += generatePropsTable(meta.props);
  markdown += `\n\n`;
  
  // 配置属性
  if (meta.configure && meta.configure.props) {
    markdown += `### 配置属性\n\n`;
    markdown += generateConfigPropsTable(meta.configure.props);
    markdown += `\n\n`;
  }
  
  // 支持的功能
  if (meta.configure && meta.configure.supports) {
    markdown += `## 支持的功能\n\n`;
    const supports = meta.configure.supports;
    
    if (supports.style) {
      markdown += `- ✅ 样式配置\n`;
    }
    
    if (supports.events && supports.events.length > 0) {
      markdown += `- ✅ 事件配置\n\n`;
      markdown += `### 支持的事件\n\n`;
      markdown += generateEventsTable(supports.events);
      markdown += `\n`;
    }
    
    if (supports.loop) {
      markdown += `- ✅ 循环渲染\n`;
    }
    
    if (supports.condition) {
      markdown += `- ✅ 条件渲染\n`;
    }
  }
  
  // 容器配置
  if (meta.configure && meta.configure.component) {
    markdown += `\n## 容器配置\n\n`;
    const component = meta.configure.component;
    
    if (component.isContainer) {
      markdown += `- ✅ 可作为容器组件\n`;
    }
    
    if (component.isModal) {
      markdown += `- ✅ 模态框组件\n`;
    }
    
    if (component.nestingRule) {
      markdown += `- 嵌套规则: ${JSON.stringify(component.nestingRule)}\n`;
    }
  }
  
  // 使用示例
  if (meta.snippets) {
    markdown += `\n## 使用示例\n\n`;
    markdown += `该组件提供了预设的代码片段，可以快速插入到页面中使用。\n\n`;
  }
  
  // 相关链接
  if (meta.docUrl) {
    markdown += `## 相关链接\n\n`;
    markdown += `- [官方文档](${meta.docUrl})\n`;
  }
  
  return markdown;
}

// 主函数
function main() {
  console.log('开始扫描fusion-lowcode-materials组件...');
  
  const metaFiles = findMetaFiles(sourceDir);
  console.log(`找到 ${metaFiles.length} 个组件`);
  
  const components = [];
  
  // 处理每个组件
  metaFiles.forEach(({ componentDir, metaPath }) => {
    console.log(`处理组件: ${componentDir}`);
    
    const meta = parseMetaFile(metaPath);
    if (!meta) {
      console.log(`跳过组件: ${componentDir} (解析失败)`);
      return;
    }
    
    const markdown = generateMarkdown(componentDir, meta);
    const outputPath = path.join(targetDir, `${componentDir}.md`);
    
    fs.writeFileSync(outputPath, markdown, 'utf8');
    console.log(`生成文档: ${outputPath}`);
    
    components.push({
      name: componentDir,
      title: meta.title || componentDir,
      componentName: meta.componentName || componentDir,
      group: meta.group || '未分类',
      category: meta.category || '未分类'
    });
  });
  
  // 生成索引文件
  console.log('生成索引文件...');
  generateIndexFile(components);
  
  console.log(`完成！共生成 ${components.length} 个组件文档`);
}

// 生成索引文件
function generateIndexFile(components) {
  let indexContent = `# Fusion Lowcode Materials 组件文档\n\n`;
  indexContent += `本目录包含了 Fusion Lowcode Materials 包中所有组件的详细文档。\n\n`;
  indexContent += `## 组件总览\n\n`;
  indexContent += `共 ${components.length} 个组件\n\n`;
  
  // 按分组整理
  const groupedComponents = {};
  components.forEach(comp => {
    const group = comp.group || '未分类';
    if (!groupedComponents[group]) {
      groupedComponents[group] = [];
    }
    groupedComponents[group].push(comp);
  });
  
  // 生成分组列表
  Object.keys(groupedComponents).sort().forEach(group => {
    indexContent += `### ${group}\n\n`;
    
    groupedComponents[group].sort((a, b) => a.name.localeCompare(b.name)).forEach(comp => {
      indexContent += `- [${comp.title}](${comp.name}.md) - ${comp.componentName}\n`;
    });
    
    indexContent += `\n`;
  });
  
  // 按分类整理
  indexContent += `## 按分类查看\n\n`;
  const categorizedComponents = {};
  components.forEach(comp => {
    const category = comp.category || '未分类';
    if (!categorizedComponents[category]) {
      categorizedComponents[category] = [];
    }
    categorizedComponents[category].push(comp);
  });
  
  Object.keys(categorizedComponents).sort().forEach(category => {
    indexContent += `### ${category}\n\n`;
    
    categorizedComponents[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(comp => {
      indexContent += `- [${comp.title}](${comp.name}.md)\n`;
    });
    
    indexContent += `\n`;
  });
  
  // 写入索引文件
  const indexPath = path.join(targetDir, 'index.md');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`生成索引文件: ${indexPath}`);
}

// 运行主函数
main();