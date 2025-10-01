const express = require('express');
const fs = require('fs');
const path = require('path');
const SiliconFlowService = require('../services/siliconFlowService');
const MaterialSelectionService = require('../services/materialSelectionService');

const router = express.Router();
const siliconFlowService = new SiliconFlowService();
const materialSelectionService = new MaterialSelectionService();

// 日志目录配置
const logsDir = path.join(__dirname, '../logs');

/**
 * 写入详细日志到统一日志文件
 */
async function writeDetailedLog(logType, data) {
  try {
    const now = new Date();
    const logFileName = `material_selection.log`; // 统一日志文件名，不按日期分割
    const logFilePath = path.join(logsDir, logFileName);
    
    const logData = {
      timestamp: now.toISOString(),
      type: logType,
      data: data
    };
    
    const logLine = JSON.stringify(logData) + '\n';
    await fs.promises.appendFile(logFilePath, logLine, 'utf8');
    console.log(`📝 日志已记录: [${logType}] ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ 写入统一日志文件失败:', error.message);
  }
}

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

/**
 * 智能物料选择和schema生成接口
 * POST /api/ai/generate-schema-with-materials
 */
router.post('/generate-schema-with-materials', async (req, res) => {
  try {
    const { prompt } = req.body;
    const requestStartTime = Date.now();

    // 记录完整的API请求参数
    await writeDetailedLog('request_generate_schema_with_materials', {
      method: 'POST',
      endpoint: '/generate-schema-with-materials',
      headers: req.headers,
      body: req.body,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestStartTime
    });

    // 验证请求参数
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      const errorResponse = {
        success: false,
        message: '请求参数错误：prompt不能为空',
        error: 'INVALID_PROMPT'
      };
      
      // 记录参数验证失败
      await writeDetailedLog('validation_error_generate_schema_with_materials', {
        prompt,
        errorResponse,
        requestDuration: Date.now() - requestStartTime
      });
      
      return res.status(400).json(errorResponse);
    }

    // 记录请求日志
    console.log(`[AI Material Selection] 收到请求: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

    // 调用物料选择服务生成schema
    const serviceStartTime = Date.now();
    const result = await materialSelectionService.generateSchemaWithMaterialSelection(prompt);
    const serviceDuration = Date.now() - serviceStartTime;

    // 构建响应数据
    const responseData = {
      success: true,
      message: `已根据您的需求"${prompt}"智能选择物料并生成页面结构`,
      result: result,
      timestamp: Date.now()
    };

    // 记录完整的API响应数据
    await writeDetailedLog('response_generate_schema_with_materials', {
      prompt,
      result,
      responseData,
      serviceDuration,
      totalRequestDuration: Date.now() - requestStartTime,
      selectedMaterialsCount: result.selectedMaterials?.length || 0,
      iterations: result.iterations,
      schemaSize: result.schema ? JSON.stringify(result.schema).length : 0
    });

    // 返回成功响应
    res.json(responseData);

    // 记录成功日志
    console.log(`[AI Material Selection] 成功生成schema，迭代次数: ${result.iterations}, 选择物料: ${result.selectedMaterials.map(m => m.name).join(', ')}`);

  } catch (error) {
    console.error('[AI Material Selection] 生成失败:', error);

    const errorResponse = {
      success: false,
      message: error.message || '智能物料选择和schema生成失败，请稍后重试',
      error: error.name || 'MATERIAL_SELECTION_ERROR',
      timestamp: Date.now()
    };

    // 记录错误详情
    await writeDetailedLog('error_generate_schema_with_materials', {
      prompt: req.body.prompt,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorResponse,
      requestDuration: Date.now() - (req.requestStartTime || Date.now())
    });

    // 返回错误响应
    res.status(500).json(errorResponse);
  }
});

/**
 * 获取可用物料详细信息接口
 * GET /api/ai/materials-detailed
 */
router.get('/materials-detailed', (req, res) => {
  try {
    const materials = materialSelectionService.getAvailableMaterials();
    
    res.json({
      success: true,
      materials: materials,
      count: materials.length,
      libraries: {
        'fusion-ui': materials.filter(m => m.library === 'fusion-ui').length,
        'fusion-lowcode-materials': materials.filter(m => m.library === 'fusion-lowcode-materials').length
      },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Materials Detailed] 获取详细物料列表失败:', error);
    
    res.status(500).json({
      success: false,
      message: '获取详细物料列表失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

/**
 * 获取特定物料源代码接口
 * GET /api/ai/material-source/:library/:name
 */
router.get('/material-source/:library/:name', async (req, res) => {
  try {
    const { library, name } = req.params;

    // 验证参数
    if (!library || !name) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：library和name不能为空',
        error: 'INVALID_PARAMS'
      });
    }

    // 获取物料源代码
    const sourceCode = await materialSelectionService.getMaterialSourceCode(name, library);

    res.json({
      success: true,
      material: {
        name,
        library,
        sourceCode
      },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error(`[AI Material Source] 获取物料源代码失败 ${req.params.library}:${req.params.name}:`, error);
    
    res.status(500).json({
      success: false,
      message: error.message || '获取物料源代码失败',
      error: error.name || 'SOURCE_CODE_ERROR',
      timestamp: Date.now()
    });
  }
});

/**
 * 物料选择服务健康检查接口
 * GET /api/ai/material-service-health
 */
router.get('/material-service-health', async (req, res) => {
  try {
    const healthStatus = await materialSelectionService.healthCheck();
    
    res.json({
      success: true,
      health: healthStatus,
      service: 'Material Selection Service',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Material Service Health] 健康检查失败:', error);
    
    res.status(500).json({
      success: false,
      healthy: false,
      service: 'Material Selection Service',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

module.exports = router;