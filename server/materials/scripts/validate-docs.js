#!/usr/bin/env node

/**
 * 文档质量验证脚本
 * 检查组件文档的完整性和质量
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  docsRoot: '/Users/junhuang/fe/lowcode-materials/server/materials',
  componentConfigs: {
    'fusion-ui': {
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
 * 验证单个文档
 */
function validateDoc(category, component) {
  const config = CONFIG.componentConfigs[category];
  const docPath = path.join(CONFIG.docsRoot, config.docsPath, `${component.docName}.md`);
  
  if (!fs.existsSync(docPath)) {
    return { status: 'missing', message: '文档文件不存在' };
  }
  
  const content = fs.readFileSync(docPath, 'utf-8');
  const checks = {
    hasTitle: content.includes('# '),
    hasBasicInfo: content.includes('## 基本信息'),
    hasDescription: content.includes('## 组件描述'),
    hasUsageExample: content.includes('## 使用示例'),
    hasSourceAnalysis: content.includes('## 核心接口定义'),
    hasProps: content.includes('## 属性配置') || content.includes('### 属性')
  };
  
  const score = Object.values(checks).filter(v => v === true).length;
  const maxScore = Object.keys(checks).length;
  
  return {
    status: 'exists',
    score: score,
    maxScore: maxScore,
    percentage: Math.round((score / maxScore) * 100),
    checks: checks,
    size: Math.round(content.length / 1024 * 100) / 100, // KB
    contentLength: content.length
  };
}

/**
 * 生成验证报告
 */
function generateReport() {
  console.log('📊 文档质量验证报告');
  console.log('='.repeat(50));

  let totalDocs = 0;
  let validDocs = 0;
  let totalScore = 0;
  let maxTotalScore = 0;
  let highQualityDocs = 0;

  const results = {};

  for (const [category, config] of Object.entries(CONFIG.componentConfigs)) {
    console.log(`\n📁 ${category}:`);
    results[category] = [];
    
    for (const component of config.components) {
      totalDocs++;
      const result = validateDoc(category, component);
      results[category].push({ component: component.name, result });
      
      if (result.status === 'exists') {
        validDocs++;
        totalScore += result.score;
        maxTotalScore += result.maxScore;
        
        if (result.percentage >= 80) {
          highQualityDocs++;
        }
        
        const status = result.percentage >= 80 ? '✅' : result.percentage >= 60 ? '⚠️' : '❌';
        console.log(`  ${status} ${component.name}: ${result.percentage}% (${result.score}/${result.maxScore}) - ${result.size}KB`);
        
        if (result.percentage < 80) {
          const missing = Object.entries(result.checks)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
          if (missing.length > 0) {
            console.log(`     缺少: ${missing.join(', ')}`);
          }
        }
      } else {
        console.log(`  ❌ ${component.name}: ${result.message}`);
      }
    }
  }

  console.log(`\n📈 总体统计:`);
  console.log(`- 文档总数: ${totalDocs}`);
  console.log(`- 存在文档: ${validDocs}`);
  console.log(`- 文档存在率: ${Math.round((validDocs / totalDocs) * 100)}%`);
  if (maxTotalScore > 0) {
    console.log(`- 平均质量分: ${Math.round((totalScore / maxTotalScore) * 100)}%`);
  }
  console.log(`- 高质量文档 (≥80%): ${highQualityDocs} 个`);
  console.log(`- 需要改进文档: ${validDocs - highQualityDocs} 个`);

  return results;
}

/**
 * 生成详细报告
 */
function generateDetailedReport() {
  const results = generateReport();
  
  console.log(`\n📋 详细分析:`);
  
  // 按质量分组
  const byQuality = { high: [], medium: [], low: [], missing: [] };
  
  for (const [category, components] of Object.entries(results)) {
    for (const { component, result } of components) {
      const item = { category, component, result };
      
      if (result.status === 'missing') {
        byQuality.missing.push(item);
      } else if (result.percentage >= 80) {
        byQuality.high.push(item);
      } else if (result.percentage >= 60) {
        byQuality.medium.push(item);
      } else {
        byQuality.low.push(item);
      }
    }
  }
  
  if (byQuality.missing.length > 0) {
    console.log(`\n❌ 缺失文档 (${byQuality.missing.length} 个):`);
    byQuality.missing.forEach(({ category, component }) => {
      console.log(`  - ${category}/${component}`);
    });
  }
  
  if (byQuality.low.length > 0) {
    console.log(`\n🔴 低质量文档 (<60%, ${byQuality.low.length} 个):`);
    byQuality.low.forEach(({ category, component, result }) => {
      console.log(`  - ${category}/${component}: ${result.percentage}%`);
    });
  }
  
  if (byQuality.medium.length > 0) {
    console.log(`\n🟡 中等质量文档 (60-79%, ${byQuality.medium.length} 个):`);
    byQuality.medium.forEach(({ category, component, result }) => {
      console.log(`  - ${category}/${component}: ${result.percentage}%`);
    });
  }
  
  console.log(`\n🟢 高质量文档 (≥80%, ${byQuality.high.length} 个):`);
  byQuality.high.forEach(({ category, component, result }) => {
    console.log(`  - ${category}/${component}: ${result.percentage}%`);
  });
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  switch (command) {
    case 'report':
      generateReport();
      break;
    case 'detailed':
      generateDetailedReport();
      break;
    case 'help':
      console.log(`
使用方法:
  node validate-docs.js [command]

命令:
  report    生成基础验证报告（默认）
  detailed  生成详细分析报告
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
  main();
}

module.exports = {
  validateDoc,
  generateReport,
  generateDetailedReport,
  CONFIG
};