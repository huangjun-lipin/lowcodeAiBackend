#!/usr/bin/env node

/**
 * 组件源码分析脚本
 * 自动提取组件的 props、methods、events 等信息
 * 用于完善组件文档
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 源码根目录
  sourceRoot: '/Users/junhuang/fe/lowcode-materials/packages',
  // 文档输出目录
  docsRoot: '/Users/junhuang/fe/lowcode-materials/server/materials',
  // 支持的文件扩展名
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  // 需要分析的组件目录
  componentDirs: [
    'fusion-ui/src/components',
    'fusion-lowcode-materials/lowcode'
  ]
};

/**
 * 分析单个组件源码
 */
class ComponentAnalyzer {
  constructor(componentPath, componentName) {
    this.componentPath = componentPath;
    this.componentName = componentName;
    this.analysis = {
      interfaces: [],
      props: [],
      methods: [],
      events: [],
      hooks: [],
      subComponents: [],
      imports: [],
      exports: []
    };
  }

  /**
   * 分析组件源码
   */
  analyze() {
    try {
      const files = this.getSourceFiles();
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        this.analyzeFile(content, file);
      }

      return this.analysis;
    } catch (error) {
      console.error(`分析组件 ${this.componentName} 失败:`, error.message);
      return null;
    }
  }

  /**
   * 获取组件源码文件
   */
  getSourceFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (CONFIG.extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    scanDir(this.componentPath);
    return files;
  }

  /**
   * 分析单个文件
   */
  analyzeFile(content, filePath) {
    const fileName = path.basename(filePath);
    
    // 分析导入
    this.analyzeImports(content);
    
    // 分析接口定义
    this.analyzeInterfaces(content);
    
    // 分析 Props 接口
    this.analyzeProps(content);
    
    // 分析方法和函数
    this.analyzeMethods(content);
    
    // 分析事件处理
    this.analyzeEvents(content);
    
    // 分析 Hooks
    this.analyzeHooks(content);
    
    // 分析子组件
    this.analyzeSubComponents(content);
    
    // 分析导出
    this.analyzeExports(content);
  }

  /**
   * 分析导入语句
   */
  analyzeImports(content) {
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!this.analysis.imports.some(imp => imp.path === importPath)) {
        this.analysis.imports.push({
          path: importPath,
          type: this.getImportType(importPath)
        });
      }
    }
  }

  /**
   * 分析接口定义
   */
  analyzeInterfaces(content) {
    const interfaceRegex = /interface\s+(\w+)(?:\s+extends\s+([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1];
      const extendsClause = match[2];
      const body = match[3];
      
      this.analysis.interfaces.push({
        name: interfaceName,
        extends: extendsClause ? extendsClause.trim().split(',').map(s => s.trim()) : [],
        properties: this.parseInterfaceProperties(body)
      });
    }
  }

  /**
   * 分析 Props 接口
   */
  analyzeProps(content) {
    // 查找 Props 相关的接口
    const propsInterfaces = this.analysis.interfaces.filter(iface => 
      iface.name.toLowerCase().includes('props') || 
      iface.name.toLowerCase().includes('config')
    );

    for (const iface of propsInterfaces) {
      for (const prop of iface.properties) {
        if (!this.analysis.props.some(p => p.name === prop.name)) {
          this.analysis.props.push({
            name: prop.name,
            type: prop.type,
            required: prop.required,
            defaultValue: prop.defaultValue,
            description: prop.description,
            interface: iface.name
          });
        }
      }
    }
  }

  /**
   * 分析方法和函数
   */
  analyzeMethods(content) {
    // 分析函数声明
    const functionRegex = /(?:export\s+)?(?:const\s+|function\s+)(\w+)\s*(?:=\s*)?(?:\([^)]*\)|\([^)]*\)\s*=>\s*\{|\([^)]*\)\s*:\s*[^=]*=>\s*\{)/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1];
      
      // 跳过一些常见的非方法函数
      if (['React', 'useState', 'useEffect', 'useMemo', 'useCallback'].includes(functionName)) {
        continue;
      }
      
      this.analysis.methods.push({
        name: functionName,
        type: 'function',
        description: this.extractFunctionDescription(content, match.index)
      });
    }

    // 分析 Hook 函数
    const hookRegex = /(?:export\s+)?(?:const\s+|function\s+)(use\w+)\s*(?:=\s*)?(?:\([^)]*\)|\([^)]*\)\s*=>\s*\{)/g;
    
    while ((match = hookRegex.exec(content)) !== null) {
      const hookName = match[1];
      
      this.analysis.hooks.push({
        name: hookName,
        description: this.extractFunctionDescription(content, match.index)
      });
    }
  }

  /**
   * 分析事件处理
   */
  analyzeEvents(content) {
    // 查找事件处理函数
    const eventRegex = /on(\w+)\s*[:=]\s*(?:\([^)]*\)\s*=>\s*\{|function\s*\([^)]*\)\s*\{)/g;
    let match;
    
    while ((match = eventRegex.exec(content)) !== null) {
      const eventName = 'on' + match[1];
      
      if (!this.analysis.events.some(e => e.name === eventName)) {
        this.analysis.events.push({
          name: eventName,
          type: 'event',
          description: `${match[1]} 事件处理函数`
        });
      }
    }

    // 从 Props 接口中提取事件
    for (const prop of this.analysis.props) {
      if (prop.name.startsWith('on') && prop.type.includes('=>')) {
        if (!this.analysis.events.some(e => e.name === prop.name)) {
          this.analysis.events.push({
            name: prop.name,
            type: 'callback',
            parameters: this.extractCallbackParameters(prop.type),
            description: prop.description || `${prop.name} 回调函数`
          });
        }
      }
    }
  }

  /**
   * 分析 Hooks
   */
  analyzeHooks(content) {
    // 查找自定义 Hook 的使用
    const hookUsageRegex = /const\s+(?:\{[^}]*\}|\w+)\s*=\s*(use\w+)\s*\(/g;
    let match;
    
    while ((match = hookUsageRegex.exec(content)) !== null) {
      const hookName = match[1];
      
      if (!this.analysis.hooks.some(h => h.name === hookName)) {
        this.analysis.hooks.push({
          name: hookName,
          type: 'usage',
          description: `使用 ${hookName} Hook`
        });
      }
    }
  }

  /**
   * 分析子组件
   */
  analyzeSubComponents(content) {
    // 查找组件定义
    const componentRegex = /(?:export\s+)?(?:const\s+|function\s+)([A-Z]\w+)(?:\s*=\s*(?:React\.)?(?:forwardRef\s*\()?(?:\([^)]*\)\s*=>\s*\{|function\s*\([^)]*\)\s*\{))/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1];
      
      if (!this.analysis.subComponents.some(c => c.name === componentName)) {
        this.analysis.subComponents.push({
          name: componentName,
          description: this.extractComponentDescription(content, match.index)
        });
      }
    }
  }

  /**
   * 分析导出
   */
  analyzeExports(content) {
    // 分析 export 语句
    const exportRegex = /export\s+(?:\{([^}]+)\}|(?:default\s+)?(\w+)|(?:const\s+|function\s+|class\s+)(\w+))/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1]) {
        // export { ... }
        const exports = match[1].split(',').map(s => s.trim());
        for (const exp of exports) {
          const name = exp.split(' as ')[0].trim();
          this.analysis.exports.push({ name, type: 'named' });
        }
      } else if (match[2]) {
        // export default
        this.analysis.exports.push({ name: match[2], type: 'default' });
      } else if (match[3]) {
        // export const/function/class
        this.analysis.exports.push({ name: match[3], type: 'named' });
      }
    }
  }

  /**
   * 解析接口属性
   */
  parseInterfaceProperties(body) {
    const properties = [];
    const lines = body.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      
      const propMatch = trimmed.match(/(\w+)(\?)?:\s*([^;]+);?/);
      if (propMatch) {
        const [, name, optional, type] = propMatch;
        properties.push({
          name,
          type: type.trim(),
          required: !optional,
          description: this.extractPropertyDescription(line)
        });
      }
    }
    
    return properties;
  }

  /**
   * 提取函数描述
   */
  extractFunctionDescription(content, index) {
    const lines = content.substring(0, index).split('\n');
    const currentLine = lines.length - 1;
    
    // 查找前面的注释
    for (let i = currentLine - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('*') || line.startsWith('//')) {
        return line.replace(/^[\s*\/]+/, '').trim();
      }
      if (line && !line.startsWith('*') && !line.startsWith('//')) {
        break;
      }
    }
    
    return '';
  }

  /**
   * 提取组件描述
   */
  extractComponentDescription(content, index) {
    return this.extractFunctionDescription(content, index);
  }

  /**
   * 提取属性描述
   */
  extractPropertyDescription(line) {
    const commentMatch = line.match(/\/\/\s*(.+)$/);
    return commentMatch ? commentMatch[1].trim() : '';
  }

  /**
   * 提取回调参数
   */
  extractCallbackParameters(type) {
    const match = type.match(/\(([^)]*)\)\s*=>/);
    if (match) {
      return match[1].split(',').map(param => param.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * 获取导入类型
   */
  getImportType(importPath) {
    if (importPath.startsWith('.')) return 'relative';
    if (importPath.startsWith('@')) return 'alias';
    if (importPath.includes('react')) return 'react';
    if (importPath.includes('antd') || importPath.includes('fusion')) return 'ui';
    return 'external';
  }
}

/**
 * 文档生成器
 */
class DocumentationGenerator {
  constructor(analysis, componentName) {
    this.analysis = analysis;
    this.componentName = componentName;
  }

  /**
   * 生成 Markdown 文档
   */
  generateMarkdown() {
    let markdown = '';

    // 生成接口定义部分
    if (this.analysis.interfaces.length > 0) {
      markdown += '\n## 核心接口定义\n\n';
      for (const iface of this.analysis.interfaces) {
        markdown += this.generateInterfaceSection(iface);
      }
    }

    // 生成属性部分
    if (this.analysis.props.length > 0) {
      markdown += '\n## 属性配置\n\n';
      markdown += this.generatePropsTable();
    }

    // 生成方法部分
    if (this.analysis.methods.length > 0) {
      markdown += '\n## 核心方法\n\n';
      markdown += this.generateMethodsTable();
    }

    // 生成事件部分
    if (this.analysis.events.length > 0) {
      markdown += '\n## 事件回调\n\n';
      markdown += this.generateEventsTable();
    }

    // 生成 Hooks 部分
    if (this.analysis.hooks.length > 0) {
      markdown += '\n## 自定义 Hooks\n\n';
      markdown += this.generateHooksTable();
    }

    // 生成子组件部分
    if (this.analysis.subComponents.length > 0) {
      markdown += '\n## 子组件\n\n';
      markdown += this.generateSubComponentsTable();
    }

    return markdown;
  }

  /**
   * 生成接口部分
   */
  generateInterfaceSection(iface) {
    let section = `### ${iface.name}\n\n`;
    
    if (iface.extends.length > 0) {
      section += `继承自: ${iface.extends.join(', ')}\n\n`;
    }

    section += '```typescript\n';
    section += `interface ${iface.name}`;
    if (iface.extends.length > 0) {
      section += ` extends ${iface.extends.join(', ')}`;
    }
    section += ' {\n';

    for (const prop of iface.properties) {
      section += `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`;
      if (prop.description) {
        section += ` // ${prop.description}`;
      }
      section += '\n';
    }

    section += '}\n```\n\n';
    return section;
  }

  /**
   * 生成属性表格
   */
  generatePropsTable() {
    let table = '| 属性名 | 类型 | 必填 | 默认值 | 说明 |\n';
    table += '|--------|------|------|--------|------|\n';

    for (const prop of this.analysis.props) {
      table += `| ${prop.name} | ${this.escapeMarkdown(prop.type)} | ${prop.required ? '是' : '否'} | ${prop.defaultValue || '-'} | ${prop.description || '-'} |\n`;
    }

    return table + '\n';
  }

  /**
   * 生成方法表格
   */
  generateMethodsTable() {
    let table = '| 方法名 | 类型 | 说明 |\n';
    table += '|--------|------|------|\n';

    for (const method of this.analysis.methods) {
      table += `| ${method.name} | ${method.type} | ${method.description || '-'} |\n`;
    }

    return table + '\n';
  }

  /**
   * 生成事件表格
   */
  generateEventsTable() {
    let table = '| 事件名 | 类型 | 参数 | 说明 |\n';
    table += '|--------|------|------|------|\n';

    for (const event of this.analysis.events) {
      const params = event.parameters ? event.parameters.join(', ') : '-';
      table += `| ${event.name} | ${event.type} | ${params} | ${event.description || '-'} |\n`;
    }

    return table + '\n';
  }

  /**
   * 生成 Hooks 表格
   */
  generateHooksTable() {
    let table = '| Hook 名称 | 类型 | 说明 |\n';
    table += '|-----------|------|------|\n';

    for (const hook of this.analysis.hooks) {
      table += `| ${hook.name} | ${hook.type || 'hook'} | ${hook.description || '-'} |\n`;
    }

    return table + '\n';
  }

  /**
   * 生成子组件表格
   */
  generateSubComponentsTable() {
    let table = '| 组件名 | 说明 |\n';
    table += '|--------|------|\n';

    for (const component of this.analysis.subComponents) {
      table += `| ${component.name} | ${component.description || '-'} |\n`;
    }

    return table + '\n';
  }

  /**
   * 转义 Markdown 特殊字符
   */
  escapeMarkdown(text) {
    return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始分析组件源码...\n');

  const results = [];

  // 分析 fusion-ui 组件
  const fusionUiPath = path.join(CONFIG.sourceRoot, 'fusion-ui/src/components');
  if (fs.existsSync(fusionUiPath)) {
    const components = fs.readdirSync(fusionUiPath).filter(item => {
      const fullPath = path.join(fusionUiPath, item);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const component of components) {
      console.log(`分析 fusion-ui 组件: ${component}`);
      const componentPath = path.join(fusionUiPath, component);
      const analyzer = new ComponentAnalyzer(componentPath, component);
      const analysis = analyzer.analyze();
      
      if (analysis) {
        results.push({
          name: component,
          category: 'fusion-ui',
          analysis,
          path: componentPath
        });
      }
    }
  }

  // 分析 fusion-lowcode-materials 组件
  const fusionLowcodePath = path.join(CONFIG.sourceRoot, 'fusion-lowcode-materials/lowcode');
  if (fs.existsSync(fusionLowcodePath)) {
    const components = fs.readdirSync(fusionLowcodePath).filter(item => {
      const fullPath = path.join(fusionLowcodePath, item);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const component of components) {
      console.log(`分析 fusion-lowcode-materials 组件: ${component}`);
      const componentPath = path.join(fusionLowcodePath, component);
      const analyzer = new ComponentAnalyzer(componentPath, component);
      const analysis = analyzer.analyze();
      
      if (analysis) {
        results.push({
          name: component,
          category: 'fusion-lowcode-materials',
          analysis,
          path: componentPath
        });
      }
    }
  }

  // 生成分析报告
  const reportPath = path.join(CONFIG.docsRoot, 'COMPONENT_ANALYSIS_REPORT.md');
  generateAnalysisReport(results, reportPath);

  // 为每个组件生成增强文档
  for (const result of results) {
    await enhanceComponentDocumentation(result);
  }

  console.log(`\n分析完成！共分析了 ${results.length} 个组件`);
  console.log(`分析报告已生成: ${reportPath}`);
}

/**
 * 生成分析报告
 */
function generateAnalysisReport(results, reportPath) {
  let report = '# 组件源码分析报告\n\n';
  report += `生成时间: ${new Date().toLocaleString()}\n\n`;
  report += `## 分析统计\n\n`;
  report += `- 总组件数: ${results.length}\n`;
  report += `- Fusion UI 组件: ${results.filter(r => r.category === 'fusion-ui').length}\n`;
  report += `- Fusion Lowcode Materials 组件: ${results.filter(r => r.category === 'fusion-lowcode-materials').length}\n\n`;

  // 按类别分组
  const categories = {};
  for (const result of results) {
    if (!categories[result.category]) {
      categories[result.category] = [];
    }
    categories[result.category].push(result);
  }

  for (const [category, components] of Object.entries(categories)) {
    report += `## ${category}\n\n`;
    
    for (const component of components) {
      const { analysis } = component;
      report += `### ${component.name}\n\n`;
      report += `- 接口定义: ${analysis.interfaces.length}\n`;
      report += `- 属性: ${analysis.props.length}\n`;
      report += `- 方法: ${analysis.methods.length}\n`;
      report += `- 事件: ${analysis.events.length}\n`;
      report += `- Hooks: ${analysis.hooks.length}\n`;
      report += `- 子组件: ${analysis.subComponents.length}\n`;
      report += `- 导入: ${analysis.imports.length}\n`;
      report += `- 导出: ${analysis.exports.length}\n\n`;
    }
  }

  fs.writeFileSync(reportPath, report, 'utf-8');
}

/**
 * 增强组件文档
 */
async function enhanceComponentDocumentation(result) {
  const { name, category, analysis } = result;
  const docPath = path.join(CONFIG.docsRoot, category, `${name}.md`);
  
  if (!fs.existsSync(docPath)) {
    console.log(`文档文件不存在，跳过: ${docPath}`);
    return;
  }

  try {
    let content = fs.readFileSync(docPath, 'utf-8');
    const generator = new DocumentationGenerator(analysis, name);
    const enhancedContent = generator.generateMarkdown();

    // 查找插入位置（在使用示例之前）
    const insertPosition = content.indexOf('## 使用示例');
    if (insertPosition !== -1) {
      content = content.substring(0, insertPosition) + enhancedContent + content.substring(insertPosition);
    } else {
      // 如果没有找到使用示例部分，就追加到末尾
      content += enhancedContent;
    }

    fs.writeFileSync(docPath, content, 'utf-8');
    console.log(`已增强文档: ${docPath}`);
  } catch (error) {
    console.error(`增强文档失败 ${docPath}:`, error.message);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  ComponentAnalyzer,
  DocumentationGenerator,
  CONFIG
};