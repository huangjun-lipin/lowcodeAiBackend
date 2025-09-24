const express = require('express');
const SiliconFlowService = require('../services/siliconFlowService');

const router = express.Router();
const siliconFlowService = new SiliconFlowService();

/**
 * 生成低代码schema接口
 * POST /api/ai/generate-schema
 */
router.post('/generate-schema', async (req, res) => {
  try {
    const { prompt, currentSchema, materials } = req.body;

    // 验证请求参数
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：prompt不能为空',
        error: 'INVALID_PROMPT'
      });
    }

    // 记录请求日志
    console.log(`[AI Schema Generation] 收到请求: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

    // 构建上下文
    const context = {
      currentSchema,
      materials: materials || siliconFlowService.getAvailableMaterials()
    };

    // 调用Silicon Flow服务生成schema
    const schema = await siliconFlowService.generateSchema(prompt, context);

    // 返回成功响应
    res.json({
      success: true,
      message: `已根据您的需求"${prompt}"生成页面结构`,
      schema: schema,
      timestamp: Date.now()
    });

    // 记录成功日志
    console.log(`[AI Schema Generation] 成功生成schema，组件: ${schema.componentName}`);

  } catch (error) {
    console.error('[AI Schema Generation] 生成失败:', error);

    // 返回错误响应
    res.status(500).json({
      success: false,
      message: error.message || '生成失败，请稍后重试',
      error: error.name || 'GENERATION_ERROR',
      timestamp: Date.now()
    });
  }
});

/**
 * 获取可用物料列表接口
 * GET /api/ai/materials
 */
router.get('/materials', (req, res) => {
  try {
    const materials = siliconFlowService.getAvailableMaterials();
    
    res.json({
      success: true,
      materials: materials,
      count: materials.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Materials] 获取物料列表失败:', error);
    
    res.status(500).json({
      success: false,
      message: '获取物料列表失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

/**
 * AI服务健康检查接口
 * GET /api/ai/health
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await siliconFlowService.healthCheck();
    
    res.json({
      success: true,
      healthy: isHealthy,
      service: 'Silicon Flow API',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Health Check] 健康检查失败:', error);
    
    res.status(500).json({
      success: false,
      healthy: false,
      service: 'Silicon Flow API',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

/**
 * 获取AI服务状态和配置信息
 * GET /api/ai/status
 */
router.get('/status', (req, res) => {
  try {
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    
    res.json({
      success: true,
      status: {
        configured: hasApiKey,
        baseURL: baseURL,
        availableMaterials: siliconFlowService.getAvailableMaterials().length,
        version: '1.0.0'
      },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Status] 获取状态失败:', error);
    
    res.status(500).json({
      success: false,
      message: '获取AI服务状态失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

module.exports = router;