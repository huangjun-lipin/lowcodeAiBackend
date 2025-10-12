const fs=require('fs');
const path=require('path');
const file=path.join('server','services','siliconFlowService.js');
let s=fs.readFileSync(file,'utf8');
// 添加方法 writeShortContextLog
if (!s.includes('async writeShortContextLog(')) {
  const insert = `\n  /**\n   * 记录缩短后的上下文到日志\n   */\n  async writeShortContextLog(userPrompt, retrievedDocs, method) {\n    try {\n      const timestamp = new Date().toISOString();\n      const docsArr = Array.isArray(retrievedDocs) ? retrievedDocs : [];\n      const entry = {\n        timestamp,\n        userPrompt,\n        method,\n        docCount: docsArr.length,\n        docsPreview: docsArr.map((d, i) => ({\n          index: i,\n          title: d.title || d.file || d.id || \`doc_\${i}\`,\n          category: d.category || d.section || 'unknown',\n          score: d.score ?? d.similarity ?? undefined,\n          contentLength: (d.text || d.content || '').length,\n          contentPreview: (d.text || d.content || '').substring(0, 200) + (((d.text || d.content || '').length > 200) ? '...' : '')\n        })),\n        docs: docsArr.map(d => ({\n          title: d.title || d.file || d.id || null,\n          category: d.category || d.section || null,\n          content: d.text || d.content || ''\n        }))\n      };\n      const filePath = path.join(this.logsDir, 'short_contexts_silicon_flow.log');\n      const line = JSON.stringify(entry, null, 2) + '\\n' + '---CONTEXT_SEPARATOR---\\n';\n      await fs.promises.appendFile(filePath, line, 'utf8');\n      console.log(\`📦 已记录缩短上下文(SiliconFlow): 方法=\${method} 文档数=\${entry.docCount}\`);\n    } catch (err) {\n      console.error('❌ 写入缩短上下文日志失败:', err.message);\n    }\n  }\n`;
  const anchor = '\n  /**\n   * 获取物料源代码\n   */';
  if (s.includes(anchor)) {
    s = s.replace(anchor, '\n' + insert + anchor);
  } else {
    const pos = s.lastIndexOf('module.exports');
    s = s.slice(0, pos) + insert + s.slice(pos);
  }
}
// 在检索后插入日志调用：第一次为流式，第二次为非流式
let count = 0;
s = s.replace(/const retrievedDocs = await ragService\.search\(userPrompt, 12\);/g, (m) => {
  count++;
  if (count === 1) return m + "\n      await this.writeShortContextLog(userPrompt, retrievedDocs, 'generateSchemaStream');";
  if (count === 2) return m + "\n      await this.writeShortContextLog(userPrompt, retrievedDocs, 'generateSchema');";
  return m;
});
fs.writeFileSync(file, s, 'utf8');
console.log('Patched siliconFlowService.js for short context logging');
