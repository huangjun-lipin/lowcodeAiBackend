const fs = require('fs');
const path = require('path');
const { connect } = require('@lancedb/lancedb');
let pipelineFn = null;
try {
  // 可选：如果可用则使用本地Transformers管线
  pipelineFn = require('@xenova/transformers').pipeline;
} catch (_) {
  pipelineFn = null;
}

// 简单的文本分块器：按字符数分块，带一定重叠
function chunkText(text, chunkSize = 1200, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

// 计算向量的余弦相似度
function cosineSimilarity(a, b) {
  const lenA = (a && typeof a.length === 'number') ? a.length : 0;
  const lenB = (b && typeof b.length === 'number') ? b.length : 0;
  const len = Math.min(lenA, lenB);
  if (!len) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    const av = a[i] || 0;
    const bv = b[i] || 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

class RagService {
  constructor() {
    this.dbDir = path.join(__dirname, '..', 'data', 'lancedb');
    this.tableName = 'materials_docs';
    this.table = null;
    this.embedder = null;
    this.materialsDir = path.join(__dirname, '..', 'materials');
    this.initialized = false;
    this.hashDim = 1024; // 哈希嵌入的维度
  }

  async initialize() {
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
    this.db = await connect(this.dbDir);
    // 初始化本地Embedding模型（无需注册），失败则使用TF-IDF哈希回退
    try {
      if (pipelineFn) {
        this.embedder = await pipelineFn('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      }
    } catch (e) {
      console.warn('RAG: 外部模型初始化失败，使用TF-IDF哈希嵌入回退。原因=', e?.message || e);
      this.embedder = null;
    }
    this.initialized = true;
  }

  async getOrCreateTable() {
    try {
      const tables = await this.db.tableNames();
      if (tables.includes(this.tableName)) {
        this.table = await this.db.openTable(this.tableName);
        return this.table;
      }
      return null;
    } catch (e) {
      console.error('RAG: 表创建/打开失败', e);
      throw e;
    }
  }

  // 简单分词器
  tokenize(text) {
    return text
      .toLowerCase()
      .split(/[^a-zA-Z0-9_\u4e00-\u9fa5]+/)
      .filter(Boolean);
  }

  // 哈希嵌入（TF-IDF * hashing trick），无需外部模型
  hashEmbed(tokens, idfMap) {
    const vec = new Array(this.hashDim).fill(0);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    const maxTf = Math.max(...Array.from(tf.values()), 1);
    for (const [t, f] of tf.entries()) {
      const tfNorm = f / maxTf;
      const idf = idfMap.get(t) || 1;
      // 简单哈希到固定维度
      let h = 0;
      for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
      const idx = h % this.hashDim;
      vec[idx] += tfNorm * Math.log(1 + idf);
    }
    // 归一化
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
  }

  // 扫描 materials 下的所有 md 文件并构建索引
  async buildIndexIfNeeded() {
    if (!this.initialized) await this.initialize();
    await this.getOrCreateTable();

    // 如果已有数据则跳过重建
    const tables = await this.db.tableNames();
    if (tables.includes(this.tableName)) {
      this.table = await this.db.openTable(this.tableName);
      try {
        const any = await this.table.query().limit(1).toArray();
        if (any.length > 0) {
          console.log(`RAG: 已存在向量索引，当前文档分块数≈${any.length > 0 ? '已构建' : '未知'}`);
          return;
        }
      } catch (_) {
        // 若查询失败，则继续尝试重建
      }
    }

    const docs = [];
    const walk = (dir, categoryPath = '') => {
      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          const subCategoryPath = categoryPath ? `${categoryPath}/${item}` : item;
          walk(itemPath, subCategoryPath);
        } else if (item.endsWith('.md') && item !== 'README.md') {
          const content = fs.readFileSync(itemPath, 'utf-8');
          const chunks = chunkText(content);
          chunks.forEach((chunk, idx) => {
            docs.push({
              id: `${itemPath}::${idx}`,
              path: itemPath,
              category: categoryPath || 'General',
              title: item,
              text: chunk,
            });
          });
        }
      });
    };

    if (fs.existsSync(this.materialsDir)) {
      walk(this.materialsDir);
    }

    console.log(`RAG: 开始构建索引，待嵌入分块数=${docs.length}`);
    // 计算IDF
    const df = new Map();
    const docTokens = docs.map(d => this.tokenize(d.text));
    for (const tokens of docTokens) {
      const uniq = new Set(tokens);
      for (const t of uniq) df.set(t, (df.get(t) || 0) + 1);
    }
    const idfMap = new Map();
    const N = docs.length || 1;
    for (const [t, dfi] of df.entries()) idfMap.set(t, N / dfi);

    const rows = [];
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      let embedding;
      if (this.embedder) {
        try {
          const output = await this.embedder(doc.text, { pooling: 'mean', normalize: true });
          embedding = Array.from(output.data);
        } catch (e) {
          console.warn('RAG: 模型嵌入失败，回退哈希嵌入：', e?.message || e);
          embedding = this.hashEmbed(docTokens[i], idfMap);
        }
      } else {
        embedding = this.hashEmbed(docTokens[i], idfMap);
      }
      rows.push({ ...doc, embedding });
    }

    if (rows.length === 0) {
      console.log('RAG: 未发现可索引的MD文档，跳过表创建。');
      return;
    }

    if (tables.includes(this.tableName)) {
      // 表已存在但为空，直接添加
      await this.table.add(rows);
    } else {
      // 首次创建表，使用已有rows初始化
      this.table = await this.db.createTable(this.tableName, rows);
    }
    console.log(`RAG: 索引构建完成，已写入分块数=${rows.length}`);
  }

  // 基于查询文本进行相似检索，返回 topK 文档片段
  async search(queryText, topK = 10) {
    if (!this.initialized) await this.initialize();
    if (!this.table) {
      const t = await this.getOrCreateTable();
      if (!t) {
        // 表不存在，尝试构建索引
        await this.buildIndexIfNeeded();
      }
    }

    let qvec;
    if (this.embedder) {
      try {
        const out = await this.embedder(queryText, { pooling: 'mean', normalize: true });
        qvec = Array.from(out.data);
      } catch (e) {
        // 回退：哈希嵌入
        const tokens = this.tokenize(queryText);
        const idfMap = new Map(); // 查询向量仅归一化，无需IDF
        qvec = this.hashEmbed(tokens, idfMap);
      }
    } else {
      const tokens = this.tokenize(queryText);
      const idfMap = new Map();
      qvec = this.hashEmbed(tokens, idfMap);
    }
    // 取全部数据到内存进行粗略搜索（数据量较小）
    const all = await this.table.query().limit(100000).toArray();
    const scored = all.map((row) => {
      const emb = row.embedding;
      const vecB = Array.isArray(emb) ? emb : Array.from(emb || []);
      return { ...row, score: cosineSimilarity(qvec, vecB) };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

module.exports = new RagService();