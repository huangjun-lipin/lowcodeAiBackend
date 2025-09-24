const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8000', 'http://localhost:3000'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由配置
app.use('/api/ai', aiRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'Lowcode Materials Server',
    version: '1.0.0',
    description: 'Backend service for lowcode materials with DeepSeek AI integration',
    endpoints: {
      'POST /api/ai/generate-schema': '生成低代码schema',
      'GET /api/ai/materials': '获取可用物料列表',
      'GET /api/ai/health': 'AI服务健康检查',
      'GET /api/ai/status': '获取AI服务状态'
    },
    timestamp: Date.now()
  });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl,
    timestamp: Date.now()
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员',
    timestamp: Date.now()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Lowcode Materials Server 启动成功!`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Silicon Flow API: ${process.env.SILICON_FLOW_API_KEY ? '已配置' : '未配置'}`);
  console.log(`📚 可用接口:`);
  console.log(`   - POST /api/ai/generate-schema - 生成低代码schema`);
  console.log(`   - GET /api/ai/materials - 获取可用物料列表`);
  console.log(`   - GET /api/ai/health - AI服务健康检查`);
  console.log(`   - GET /api/ai/status - 获取AI服务状态`);
  console.log(`   - GET /health - 服务器健康检查`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

module.exports = app;