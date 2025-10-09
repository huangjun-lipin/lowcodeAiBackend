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
 * 写入生成的schema到专门的日志文件
 */
async function writeSchemaLog(prompt, schema, metadata = {}) {
  try {
    const now = new Date();
    const schemaLogFileName = `generated_schemas.log`; // 专门的schema日志文件
    const schemaLogFilePath = path.join(logsDir, schemaLogFileName);
    
    const schemaLogData = {
      timestamp: now.toISOString(),
      prompt: prompt,
      schema: schema,
      metadata: {
        schemaSize: schema ? JSON.stringify(schema).length : 0,
        componentCount: schema && schema.children ? schema.children.length : 0,
        hasDataSource: !!(schema && schema.dataSource),
        hasState: !!(schema && schema.state && Object.keys(schema.state).length > 0),
        hasMethods: !!(schema && schema.methods && Object.keys(schema.methods).length > 0),
        hasLifeCycles: !!(schema && schema.lifeCycles && Object.keys(schema.lifeCycles).length > 0),
        hasOriginCode: !!(schema && schema.originCode),
        ...metadata
      }
    };
    
    const schemaLogLine = JSON.stringify(schemaLogData, null, 2) + '\n' + '---SCHEMA_SEPARATOR---\n';
    await fs.promises.appendFile(schemaLogFilePath, schemaLogLine, 'utf8');
    console.log(`📋 Schema日志已记录: ${prompt.substring(0, 50)}... (大小: ${schemaLogData.metadata.schemaSize} 字符)`);
  } catch (error) {
    console.error('❌ 写入Schema日志文件失败:', error.message);
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

    // 记录生成的schema到专门的日志文件
    if (schema) {
      await writeSchemaLog(prompt, schema, {
        materials: materials || [],
        generationMethod: 'silicon_flow',
        hasCurrentSchema: !!currentSchema
      });
    }

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
 * GET /api/ai/materials?fromMd=true
 */
router.get('/materials', (req, res) => {
  try {
    const fromMd = req.query.fromMd === 'true';
    const materials = siliconFlowService.getAvailableMaterials(fromMd);
    
    res.json({
      success: true,
      materials: materials,
      count: materials.length,
      source: fromMd ? 'md_files' : 'fusion_ui',
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
 * 流式生成低代码schema接口 (Server-Sent Events)
 * POST /api/ai/generate-schema-stream
 */
// 添加测试流式输出的路由
router.post('/test-stream', async (req, res) => {
  try {
    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送开始事件
    res.write(`data: ${JSON.stringify({
      type: 'start',
      message: '开始生成页面...',
      timestamp: Date.now()
    })}\n\n`);

    // 模拟逐字符输出
    const testMessage = "这是一个测试的逐字符流式输出，用来验证前端是否能正确显示逐字符效果。";
    let currentMessage = "";
    
    for (let i = 0; i < testMessage.length; i++) {
      currentMessage += testMessage[i];
      
      // 发送进度事件
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        message: currentMessage,
        timestamp: Date.now()
      })}\n\n`);
      
      // 延迟100ms模拟真实的流式输出
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 发送完成事件
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      success: true,
      message: '测试完成',
      schema: { test: true },
      timestamp: Date.now()
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('测试流式输出失败:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error.message,
      timestamp: Date.now()
    })}\n\n`);
    res.end();
  }
});

router.post('/generate-schema-stream', async (req, res) => {
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

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送开始事件
    res.write(`data: ${JSON.stringify({
      type: 'start',
      message: '开始生成页面...',
      timestamp: Date.now()
    })}\n\n`);

    // 记录请求日志
    console.log(`[AI Schema Generation Stream] 收到请求: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

    // 构建上下文
    const context = {
      currentSchema,
      materials: materials || siliconFlowService.getAvailableMaterials()
    };

    // 调用Silicon Flow服务生成schema (流式版本)
    const schema = await siliconFlowService.generateSchemaStream(prompt, context, (progressEvent) => {
      // 转发进度事件到前端
      res.write(`data: ${JSON.stringify(progressEvent)}\n\n`);
    });

    // 记录生成的schema到专门的日志文件
    if (schema) {
      await writeSchemaLog(prompt, schema, {
        materials: materials || [],
        generationMethod: 'silicon_flow_stream',
        hasCurrentSchema: !!currentSchema
      });
    }

    // 发送最终结果
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      success: true,
      message: `已根据您的需求"${prompt}"生成页面结构`,
      schema: schema,
      timestamp: Date.now()
    })}\n\n`);

    // 记录成功日志
    console.log(`[AI Schema Generation Stream] 成功生成schema，组件: ${schema.componentName}`);

    // 结束流
    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[AI Schema Generation Stream] 生成失败:', error);

    // 发送错误事件
    res.write(`data: ${JSON.stringify({
      type: 'error',
      success: false,
      message: error.message || '生成失败，请稍后重试',
      error: error.name || 'GENERATION_ERROR',
      timestamp: Date.now()
    })}\n\n`);

    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
  }
});

/**
 * 流式智能物料选择和schema生成接口 (Server-Sent Events)
 * POST /api/ai/generate-schema-with-materials-stream
 */
router.post('/generate-schema-with-materials-stream', async (req, res) => {
  try {
    const { prompt } = req.body;
    const requestStartTime = Date.now();

    // 验证请求参数
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：prompt不能为空',
        error: 'INVALID_PROMPT'
      });
    }

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送开始事件
    res.write(`data: ${JSON.stringify({
      type: 'start',
      message: '开始智能物料选择和页面生成...',
      timestamp: Date.now()
    })}\n\n`);

    // 记录请求日志
    console.log(`[AI Material Selection Stream] 收到请求: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

    // 发送进度事件
    res.write(`data: ${JSON.stringify({
      type: 'progress',
      message: '正在分析需求并选择物料...',
      timestamp: Date.now()
    })}\n\n`);

    // 调用物料选择服务生成schema，并传递流式回调
    const serviceStartTime = Date.now();
    const result = await materialSelectionService.generateSchemaWithMaterialSelectionStream(prompt, (progressData) => {
      // 发送迭代进度事件
      res.write(`data: ${JSON.stringify({
        type: 'iteration',
        ...progressData,
        timestamp: Date.now()
      })}\n\n`);
    });
    const serviceDuration = Date.now() - serviceStartTime;

    // 记录生成的schema到专门的日志文件
    if (result.schema) {
      await writeSchemaLog(prompt, result.schema, {
        selectedMaterials: result.selectedMaterials?.map(m => m.name) || [],
        iterations: result.iterations,
        serviceDuration: serviceDuration,
        generationMethod: 'material_selection_stream'
      });
    }

    // 发送最终结果
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      success: true,
      message: `已根据您的需求"${prompt}"智能选择物料并生成页面结构`,
      result: result,
      timestamp: Date.now()
    })}\n\n`);

    // 记录成功日志
    console.log(`[AI Material Selection Stream] 成功生成schema，迭代次数: ${result.iterations}, 选择物料: ${result.selectedMaterials.map(m => m.name).join(', ')}`);

    // 结束流
    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[AI Material Selection Stream] 生成失败:', error);

    // 发送错误事件
    res.write(`data: ${JSON.stringify({
      type: 'error',
      success: false,
      message: error.message || '智能物料选择和schema生成失败，请稍后重试',
      error: error.name || 'MATERIAL_SELECTION_ERROR',
      timestamp: Date.now()
    })}\n\n`);

    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
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

    // 记录生成的schema到专门的日志文件
    if (result.schema) {
      await writeSchemaLog(prompt, result.schema, {
        selectedMaterials: result.selectedMaterials?.map(m => m.name) || [],
        iterations: result.iterations,
        serviceDuration: serviceDuration,
        generationMethod: 'material_selection'
      });
    }

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

/**
 * 流式局部修改选中元素的schema接口 (Server-Sent Events)
 * POST /api/ai/update-element-stream
 */
router.post('/update-element-stream', async (req, res) => {
  try {
    const { prompt, selectedElement, fullSchema, materials } = req.body;

    // 验证请求参数
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：prompt不能为空',
        error: 'INVALID_PROMPT'
      });
    }

    if (!selectedElement || !selectedElement.id) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：selectedElement不能为空且必须包含id',
        error: 'INVALID_SELECTED_ELEMENT'
      });
    }

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送开始事件
    res.write(`data: ${JSON.stringify({
      type: 'start',
      message: '开始修改选中元素...',
      timestamp: Date.now()
    })}\n\n`);

    // 记录请求日志
    console.log(`[AI Element Update Stream] 收到局部修改请求: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
    console.log(`[AI Element Update Stream] 选中元素ID: ${selectedElement.id}, 组件: ${selectedElement.componentName}`);

    // 构建局部修改的上下文
    const context = {
      selectedElement,
      fullSchema,
      materials: materials || siliconFlowService.getAvailableMaterials()
    };

    // 调用Silicon Flow服务进行局部修改 (流式版本)
    const updatedElement = await siliconFlowService.updateElementStream(prompt, context, (progressEvent) => {
      // 转发进度事件到前端
      res.write(`data: ${JSON.stringify(progressEvent)}\n\n`);
    });

    // 记录修改结果到日志文件
    if (updatedElement) {
      await writeSchemaLog(prompt, updatedElement, {
        materials: materials || [],
        generationMethod: 'element_update_stream',
        selectedElementId: selectedElement.id,
        selectedElementComponent: selectedElement.componentName,
        hasFullSchema: !!fullSchema
      });
    }

    // 发送最终结果
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      success: true,
      message: `已根据您的需求"${prompt}"修改选中元素`,
      updatedElement: updatedElement,
      elementId: selectedElement.id,
      timestamp: Date.now()
    })}\n\n`);

    // 记录成功日志
    console.log(`[AI Element Update Stream] 成功修改元素，ID: ${selectedElement.id}, 组件: ${updatedElement.componentName}`);

    // 结束流
    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[AI Element Update Stream] 修改失败:', error);

    // 发送错误事件
    res.write(`data: ${JSON.stringify({
      type: 'error',
      success: false,
      message: error.message || '修改失败，请稍后重试',
      error: error.name || 'UPDATE_ERROR',
      timestamp: Date.now()
    })}\n\n`);

    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
  }
});

/**
 * 获取物料详细信息接口（从md文件）
 * GET /api/ai/material-info/:category/:name
 */
router.get('/material-info/:category/:name', (req, res) => {
  try {
    const { category, name } = req.params;
    
    if (!category || !name) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误：category和name不能为空',
        error: 'INVALID_PARAMS'
      });
    }
    
    const materialInfo = siliconFlowService.getMaterialInfoFromMd(name, category);
    
    if (!materialInfo) {
      return res.status(404).json({
        success: false,
        message: `物料信息不存在: ${category}/${name}`,
        error: 'MATERIAL_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      materialInfo: materialInfo,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Material Info] 获取物料详细信息失败:', error);
    
    res.status(500).json({
      success: false,
      message: '获取物料详细信息失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

module.exports = router;