const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Ajv = require('ajv');
const JSON5 = require('json5');
const { jsonrepair } = require('jsonrepair');

class MaterialSelectionService {
  constructor() {
    this.apiKey = process.env.SILICON_FLOW_API_KEY;
    this.baseURL = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn';
    this.ajv = new Ajv({ allErrors: true });
    
    // 物料库路径配置
    this.materialPaths = {
      fusionUI: path.join(__dirname, '../../packages/fusion-ui'),
      fusionLowcodeMaterials: path.join(__dirname, '../../packages/fusion-lowcode-materials')
    };
    
    // 日志目录配置
    this.logsDir = path.join(__dirname, '../logs');
    
    // 缓存物料信息
    this.materialCache = new Map();
    // 添加源码缓存
    this.sourceCodeCache = new Map();
    this.initializeMaterialCache();
  }

  /**
   * 写入详细日志到统一文件
   */
  async writeDetailedLog(logType, data) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        type: logType,
        data: data
      };
      
      // 使用统一的日志文件名，不按日期分割
      const logFileName = `material_selection.log`;
      const logFilePath = path.join(this.logsDir, logFileName);
      
      // 将日志条目追加到文件中，每行一个JSON对象
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.promises.appendFile(logFilePath, logLine, 'utf8');
      
      console.log(`📝 日志已记录: [${logType}] ${timestamp}`);
    } catch (error) {
      console.error('❌ 写入日志文件失败:', error.message);
    }
  }

  /**
   * 初始化物料缓存
   */
  async initializeMaterialCache() {
    try {
      await this.loadMaterialsFromPath('fusion-ui', this.materialPaths.fusionUI);
      await this.loadMaterialsFromPath('fusion-lowcode-materials', this.materialPaths.fusionLowcodeMaterials);
      console.log(`物料缓存初始化完成，共加载 ${this.materialCache.size} 个物料`);
    } catch (error) {
      console.error('物料缓存初始化失败:', error);
    }
  }

  /**
   * 从指定路径加载物料信息
   */
  async loadMaterialsFromPath(libraryName, basePath) {
    const lowcodePath = path.join(basePath, 'lowcode');
    
    if (!fs.existsSync(lowcodePath)) {
      console.warn(`物料路径不存在: ${lowcodePath}`);
      return;
    }

    const materialDirs = fs.readdirSync(lowcodePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const materialDir of materialDirs) {
      try {
        const materialPath = path.join(lowcodePath, materialDir);
        const metaPath = path.join(materialPath, 'meta.ts');
        const metaJsPath = path.join(materialPath, 'meta.js');
        const snippetsPath = path.join(materialPath, 'snippets.ts');
        const snippetsJsPath = path.join(materialPath, 'snippets.js');

        // 读取meta文件
        let metaContent = null;
        if (fs.existsSync(metaPath)) {
          metaContent = fs.readFileSync(metaPath, 'utf8');
        } else if (fs.existsSync(metaJsPath)) {
          metaContent = fs.readFileSync(metaJsPath, 'utf8');
        }

        // 读取snippets文件
        let snippetsContent = null;
        if (fs.existsSync(snippetsPath)) {
          snippetsContent = fs.readFileSync(snippetsPath, 'utf8');
        } else if (fs.existsSync(snippetsJsPath)) {
          snippetsContent = fs.readFileSync(snippetsJsPath, 'utf8');
        }

        // 缓存物料信息
        const materialInfo = {
          name: materialDir,
          library: libraryName,
          path: materialPath,
          metaContent,
          snippetsContent,
          hasSource: this.checkSourceExists(basePath, materialDir)
        };

        this.materialCache.set(`${libraryName}:${materialDir}`, materialInfo);
      } catch (error) {
        console.warn(`加载物料 ${materialDir} 失败:`, error.message);
      }
    }
  }

  /**
   * 检查物料源代码是否存在
   */
  checkSourceExists(basePath, materialName) {
    const srcPath = path.join(basePath, 'src');
    if (!fs.existsSync(srcPath)) return false;

    // 检查src目录下是否有对应的组件文件
    const possiblePaths = [
      path.join(srcPath, 'components', materialName),
      path.join(srcPath, materialName),
      path.join(srcPath, 'components', `${materialName}.tsx`),
      path.join(srcPath, 'components', `${materialName}.ts`),
      path.join(srcPath, `${materialName}.tsx`),
      path.join(srcPath, `${materialName}.ts`)
    ];

    return possiblePaths.some(p => fs.existsSync(p));
  }

  /**
   * 获取所有可用物料列表
   */
  getAvailableMaterials() {
    const materials = [];
    
    for (const [key, material] of this.materialCache) {
      materials.push({
        name: material.name,
        library: material.library,
        path: material.path,
        hasSource: material.hasSource,
        key: key
      });
    }

    return materials;
  }

  /**
   * 根据用户需求智能选择物料
   */
  async selectMaterials(userPrompt, availableMaterials) {
    try {
      // 检查API密钥
      if (!this.apiKey) {
        console.warn('SILICON_FLOW_API_KEY未设置，使用默认物料选择策略');
        // 返回默认的物料选择
        return {
          selectedMaterials: availableMaterials.slice(0, 10).map(m => m.name),
          reasoning: '由于API密钥未配置，使用默认物料选择策略'
        };
      }

      const systemPrompt = this.buildMaterialSelectionPrompt(availableMaterials);
      const userPromptText = `用户需求: ${userPrompt}

请根据需求选择最合适的物料组合，并说明选择理由。`;

      const response = await this.callSiliconFlowAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPromptText }
      ]);

      return this.parseMaterialSelectionResponse(response);
    } catch (error) {
      console.error('物料选择失败:', error);
      
      // 降级处理：返回默认物料选择
      console.warn('使用降级策略：返回默认物料选择');
      return {
        selectedMaterials: availableMaterials.slice(0, 10).map(m => m.name),
        reasoning: '由于API调用失败，使用默认物料选择策略'
      };
    }
  }

  /**
   * 构建物料选择的系统提示词
   */
  buildMaterialSelectionPrompt(availableMaterials) {
    const materialList = availableMaterials.map(m => 
      `- ${m.name} (${m.library}): ${m.hasSource ? '有源码' : '仅配置'}`
    ).join('\n');

    console.log('📝 构建物料选择提示词:');
    console.log('📦 可用物料数量:', availableMaterials.length);
    console.log('📊 物料分布:', {
      'fusion-ui': availableMaterials.filter(m => m.library === 'fusion-ui').length,
      'fusion-lowcode-materials': availableMaterials.filter(m => m.library === 'fusion-lowcode-materials').length,
      '有源码': availableMaterials.filter(m => m.hasSource).length,
      '仅配置': availableMaterials.filter(m => !m.hasSource).length
    });
    console.log('📋 物料列表预览 (前10个):', availableMaterials.slice(0, 10).map(m => `${m.name}(${m.library})`).join(', '));

    const prompt = `你是一个专业的低代码物料选择助手。根据用户需求，从以下可用物料中智能选择最合适的组件：

可用物料列表：
${materialList}

选择原则：
1. 优先选择fusion-ui中的组件，它们更加现代化和功能完整
2. 只有在fusion-ui中没有合适组件时，才考虑fusion-lowcode-materials
3. **强烈建议获取源代码**：为了实现更好的定制化效果，应该积极获取物料源代码
4. 以下情况**必须**获取源代码：
   - 需要自定义样式或交互逻辑
   - 需要复杂的数据处理或状态管理
   - 需要特殊的事件处理或生命周期管理
   - 用户明确提到"定制化"、"自定义"、"复杂"等关键词
5. 只有在极其简单的静态展示需求时，才可以不获取源代码

**重要要求 - 物料选择策略：**
6. **completed字段判断标准**：
   - 如果initialSchema只包含基本组件结构，缺少数据源、状态管理、事件处理等，设置completed: false
   - 如果initialSchema已经包含完整的数据源、状态管理、交互逻辑，可以设置completed: true
7. **initialSchema完整性要求**：
   - 简单页面（如静态展示）：可以在初始阶段就生成完整schema
   - 复杂页面（如表单、列表、图表）：建议初始阶段保持简单，通过迭代优化完善

**关键格式要求 - 避免常见错误：**
8. **dataSource正确理解**：
   - dataSource是声明接口请求的配置，不是用来存储数据的
   - 正确格式：
   \`\`\`json
   "dataSource": {
     "list": [
       {
         "id": "urlParams",
         "type": "urlParams"
       },
       {
         "id": "user",
         "type": "fetch",
         "options": {
           "method": "GET",
           "uri": "mock/info.json"
         },
         "shouldFetch": {
           "type": "JSFunction",
           "value": "function() { return true; }"
         }
       }
     ]
   }
   \`\`\`

9. **数据绑定正确格式**：
   - 错误：{{state.filterParams.name}}
   - 正确：this.state.filterParams.name
   - 使用JSExpression类型：
   \`\`\`json
   {
     "type": "JSExpression",
     "value": "this.state.filterParams.name"
   }
   \`\`\`

10. **方法绑定正确格式**：
    - 错误：methods.handleFilterChange.bind(null, 'category')
    - 正确：this.onTestUtilsButtonClicked.apply(this,Array.prototype.slice.call(arguments).concat([]))
    - 使用JSFunction类型：
    \`\`\`json
    {
      "type": "JSFunction", 
      "value": "function(){this.onTestUtilsButtonClicked.apply(this,Array.prototype.slice.call(arguments).concat([])) }"
    }
    \`\`\`

12. **originCode正确格式**：
    - originCode中的state必须使用具体的值，不能使用[object Object]
    - 错误：state = { "filterParams": [object Object] }
    - 正确：state = { "filterParams": { "productName": "", "category": "", "status": "" } }
    - **重要**：originCode必须是一个字符串，包含完整的JavaScript类代码
    - **关键**：originCode中的state必须与schema中的state字段保持一致
    - **关键**：originCode中的方法必须与schema中的methods字段保持一致
    - originCode示例：
    \`\`\`javascript
    "originCode": "class LowcodeComponent extends Component {\\n  state = {\\n    \\"text\\": \\"outer\\",\\n    \\"isShowDialog\\": false,\\n    \\"filterParams\\": {\\n      \\"productName\\": \\"\\",\\n      \\"category\\": \\"\\",\\n      \\"status\\": \\"\\"\\n    },\\n    \\"dataList\\": [\\n      {\\"id\\": 1, \\"name\\": \\"产品A\\", \\"category\\": \\"电子\\", \\"status\\": \\"在售\\"},\\n      {\\"id\\": 2, \\"name\\": \\"产品B\\", \\"category\\": \\"服装\\", \\"status\\": \\"下架\\"}\\n    ]\\n  }\\n  componentDidMount() {\\n    console.log('did mount');\\n  }\\n  handleSearch(values) {\\n    this.setState({\\n      filterParams: values\\n    });\\n  }\\n}"
    \`\`\`
    - **注意**：originCode是字符串格式，需要正确转义引号和换行符
    - **一致性要求**：
      * originCode中的state对象必须与schema.state中的值完全一致
      * originCode中的方法名必须与schema.methods中的方法名完全一致
      * originCode中的生命周期方法必须与schema.lifeCycles中的方法完全一致

请返回JSON格式的结果，包含以下字段：
{
  "completed": false, // 永远设置为false，确保进入迭代优化阶段
  "selectedMaterials": [
    {
      "name": "物料名称",
      "library": "物料库名称",
      "reason": "选择原因",
      "needSourceCode": true // 默认都需要获取源代码以便优化
    }
  ],
  "initialSchema": {
    "componentName": "Page",
    "id": "page_xxx",
    "props": {},
    "dataSource": {
      "list": [
        {
          "id": "urlParams",
          "type": "urlParams"
        }
      ]
    },
    "state": {
      // 必须包含页面所需的状态管理
      // 示例：
      // "filterParams": {"name": "", "category": ""},
      // "dataList": [],
      // "loading": false
    },
    "methods": {
      // 必须包含页面交互方法
      // 示例：
      // "handleSearch": {"type": "JSFunction", "value": "function(values) { this.setState({filterParams: values}); }"}
    },
    "lifeCycles": {
      // 必须包含生命周期方法
      "componentDidMount": {
        "type": "JSFunction",
        "value": "function() { console.log('页面加载完成'); }"
      }
    },
    "originCode": "class LowcodeComponent extends Component {\\n  state = {\\n    \\"text\\": \\"outer\\",\\n    \\"isShowDialog\\": false,\\n    \\"filterParams\\": {\\n      \\"productName\\": \\"\\",\\n      \\"category\\": \\"\\",\\n      \\"status\\": \\"\\"\\n    },\\n    \\"dataList\\": [\\n      {\\"id\\": 1, \\"name\\": \\"产品A\\", \\"category\\": \\"电子\\", \\"status\\": \\"在售\\"},\\n      {\\"id\\": 2, \\"name\\": \\"产品B\\", \\"category\\": \\"服装\\", \\"status\\": \\"下架\\"}\\n    ]\\n  }\\n  componentDidMount() {\\n    console.log('did mount');\\n  }\\n  handleSearch(values) {\\n    this.setState({\\n      filterParams: values\\n    });\\n  }\\n}", // 必须是字符串，包含完整的React类代码，与state和methods保持一致
    "children": [] // 基础的子组件结构，包含具体的组件配置
  }, // 提供完整的初始schema结构，包含所有必要字段
  "reasoning": "选择和判断的详细说明"
}

**重要提醒：initialSchema必须是一个完整可用的schema，包含：**
- dataSource：数据源配置
- state：状态管理
- methods：交互方法
- lifeCycles：生命周期
- originCode：源代码
- children：完整的组件树结构

不要生成空的或不完整的schema！`;

    console.log('📏 生成的提示词长度:', prompt.length);
    return prompt;
  }

  /**
   * 解析物料选择响应
   */
  parseMaterialSelectionResponse(response) {
    console.log('🔧 开始解析物料选择响应...');
    console.log('📄 原始响应 (前200字符):', response.substring(0, 200));
    
    let lastError = null;
    
    // 策略1: 直接JSON解析
    try {
      const result = JSON.parse(response);
      console.log('✅ 物料选择解析器 1 成功: 直接JSON解析');
      return result;
    } catch (error) {
      console.log('❌ 物料选择解析器 1 失败:', error.message);
      lastError = error;
    }
    
    // 策略2: 清理后JSON解析
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      console.log('🧹 清理后内容 (前200字符):', cleanedResponse.substring(0, 200));
      const result = JSON.parse(cleanedResponse);
      console.log('✅ 物料选择解析器 2 成功: 清理后JSON解析');
      return result;
    } catch (error) {
      console.log('❌ 物料选择解析器 2 失败:', error.message);
      lastError = error;
    }
    
    // 策略3: jsonrepair修复
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const repairedJson = jsonrepair(cleanedResponse);
      console.log('🔧 jsonrepair修复后 (前200字符):', repairedJson.substring(0, 200));
      const result = JSON.parse(repairedJson);
      console.log('✅ 物料选择解析器 3 成功: jsonrepair修复');
      return result;
    } catch (error) {
      console.log('❌ 物料选择解析器 3 失败:', error.message);
      lastError = error;
    }
    
    // 策略4: jsonrepair + JSON5
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const repairedJson = jsonrepair(cleanedResponse);
      const result = JSON5.parse(repairedJson);
      console.log('✅ 物料选择解析器 4 成功: jsonrepair + JSON5');
      return result;
    } catch (error) {
      console.log('❌ 物料选择解析器 4 失败:', error.message);
      lastError = error;
    }
    
    // 策略5: JSON5直接解析
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const result = JSON5.parse(cleanedResponse);
      console.log('✅ 物料选择解析器 5 成功: JSON5直接解析');
      return result;
    } catch (error) {
      console.log('❌ 物料选择解析器 5 失败:', error.message);
      lastError = error;
    }
    
    console.log('🚨 所有物料选择解析策略都失败了');
    console.log('💥 最后一个错误:', lastError.message);
    console.error('解析物料选择响应失败:', lastError);
    throw new Error('无法解析AI响应');
  }

  /**
   * 获取物料的详细源代码
   */
  async getMaterialSourceCode(materialName, libraryName) {
    const materialKey = `${libraryName}:${materialName}`;
    
    // 检查源码缓存
    if (this.sourceCodeCache.has(materialKey)) {
      console.log(`📋 从缓存获取 ${materialName} 源代码`);
      return this.sourceCodeCache.get(materialKey);
    }
    
    const material = this.materialCache.get(materialKey);
    
    if (!material) {
      throw new Error(`物料 ${materialName} 不存在`);
    }

    const sourceCode = {
      meta: material.metaContent,
      snippets: material.snippetsContent,
      source: null
    };

    // 如果有源代码，读取源代码文件
    if (material.hasSource) {
      const basePath = libraryName === 'fusion-ui' 
        ? this.materialPaths.fusionUI 
        : this.materialPaths.fusionLowcodeMaterials;
      
      sourceCode.source = await this.readSourceFiles(basePath, materialName);
    }

    // 将结果缓存
    this.sourceCodeCache.set(materialKey, sourceCode);
    console.log(`💾 已缓存 ${materialName} 源代码`);

    return sourceCode;
  }

  /**
   * 读取物料源代码文件
   */
  async readSourceFiles(basePath, materialName) {
    const srcPath = path.join(basePath, 'src');
    const sourceFiles = {};

    // 可能的源代码路径
    const possiblePaths = [
      path.join(srcPath, 'components', materialName),
      path.join(srcPath, materialName),
    ];

    for (const dirPath of possiblePaths) {
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
            const filePath = path.join(dirPath, file);
            sourceFiles[file] = fs.readFileSync(filePath, 'utf8');
          }
        }
        break;
      }
    }

    // 检查单文件组件
    const singleFilePaths = [
      path.join(srcPath, 'components', `${materialName}.tsx`),
      path.join(srcPath, 'components', `${materialName}.ts`),
      path.join(srcPath, `${materialName}.tsx`),
      path.join(srcPath, `${materialName}.ts`)
    ];

    for (const filePath of singleFilePaths) {
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath);
        sourceFiles[fileName] = fs.readFileSync(filePath, 'utf8');
        break;
      }
    }

    return sourceFiles;
  }

  /**
   * 迭代优化schema
   */
  async optimizeSchema(userPrompt, currentSchema, materialSources, iterationCount = 0) {
    const maxIterations = 10; // 最大迭代次数
    
    console.log(`🔧 [Schema Optimization] 开始第 ${iterationCount + 1} 次优化迭代`);
    console.log('📊 优化参数:', JSON.stringify({
      iterationCount,
      maxIterations,
      hasCurrentSchema: !!currentSchema,
      availableMaterialSources: Object.keys(materialSources).filter(k => materialSources[k])
    }, null, 2));
    
    if (iterationCount >= maxIterations) {
      console.log('⏹️ 达到最大迭代次数，停止优化');
      return {
        completed: true,
        schema: currentSchema,
        reason: '达到最大迭代次数'
      };
    }

    // 检查API密钥
    if (!this.apiKey) {
      console.warn('⚠️ SILICON_FLOW_API_KEY未设置，跳过schema优化');
      return {
        completed: true,
        schema: currentSchema,
        reason: '由于API密钥未配置，跳过优化步骤'
      };
    }

    console.log('🛠️ 构建优化提示词...');
    const systemPrompt = this.buildOptimizationPrompt(materialSources, iterationCount);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `用户需求: ${userPrompt}` }
    ];

    if (currentSchema) {
      console.log('📋 添加当前schema到对话上下文');
      messages.push({
        role: 'assistant', 
        content: `当前schema: ${JSON.stringify(currentSchema, null, 2)}`
      });
      messages.push({
        role: 'user',
        content: '请基于当前schema进行渐进式优化，不要轻易推翻现有结构'
      });
    } else {
      console.log('🆕 首次生成schema，无现有结构');
    }

    console.log('📤 准备发送优化请求到AI服务...');
    console.log('📝 消息数量:', messages.length);
    console.log('📏 系统提示词长度:', systemPrompt.length);

    try {
      const response = await this.callSiliconFlowAPI(messages);
      console.log('📥 收到优化响应，开始解析...');
      
      const result = this.parseOptimizationResponse(response);
      console.log('✅ 优化响应解析完成:', JSON.stringify({
        completed: result.completed,
        hasSchema: !!result.schema,
        reason: result.reason
      }, null, 2));
      
      return result;
    } catch (error) {
      console.error('❌ Schema优化失败:', error);
      
      // 降级处理：返回当前schema
      console.log('🔄 使用降级策略，返回当前schema');
      return {
        completed: true,
        schema: currentSchema,
        reason: '优化过程中出现错误，返回当前schema'
      };
    }
  }

  /**
   * 构建优化提示词
   */
  buildOptimizationPrompt(materialSources, iterationCount) {
    let sourcesInfo = '';
    if (materialSources && Object.keys(materialSources).length > 0) {
      sourcesInfo = '可用物料源代码信息：\n';
      for (const [materialName, sourceData] of Object.entries(materialSources)) {
        // 跳过无效的物料名称和空的源代码数据
        if (!materialName || materialName === '[object Object]' || !sourceData) {
          console.warn(`⚠️ 跳过无效物料: ${materialName}, sourceData:`, sourceData);
          continue;
        }
        
        sourcesInfo += `\n=== ${materialName} ===\n`;
        if (sourceData.meta) {
          sourcesInfo += `Meta配置:\n${sourceData.meta.substring(0, 1000)}...\n`;
        }
        if (sourceData.snippets) {
          sourcesInfo += `Snippets示例:\n${sourceData.snippets.substring(0, 500)}...\n`;
        }
        if (sourceData.source) {
          sourcesInfo += `源代码:\n`;
          for (const [fileName, content] of Object.entries(sourceData.source)) {
            sourcesInfo += `${fileName}:\n${content.substring(0, 800)}...\n`;
          }
        }
      }
    }

    return `你是一个专业的低代码schema优化助手。当前是第${iterationCount + 1}次迭代优化。

${sourcesInfo}

优化原则：
1. 渐进式优化：在现有schema基础上进行小幅改进，不要轻易推翻整体结构
2. 保持一致性：确保schema中的dataSource、state、lifeCycles、methods与originCode保持一致
3. 优先使用fusion-ui组件，只有必要时才使用fusion-lowcode-materials
4. 根据物料的实际能力和配置进行合理的属性设置
5. 确保生成的代码可以正常运行

**重要要求 - 必须包含假数据和交互功能：**
6. **数据要求**：必须为所有组件提供真实的假数据，包括：
   - 用户信息：真实的姓名、邮箱、电话、头像URL等
   - 列表数据：至少3-5条完整的示例数据
   - 图表数据：包含多个数据点的完整数据集
   - 表单默认值：合理的预填充数据
7. **交互要求**：必须添加交互功能，包括：
   - 按钮点击事件处理
   - 表单提交和验证
   - 数据筛选和搜索
   - 页面跳转和状态切换
8. **完整性要求**：
   - 添加dataSource字段存储页面数据
   - 添加state字段管理页面状态
   - 添加methods字段定义交互方法
   - 添加lifeCycles字段处理生命周期

**关键格式要求 - 避免常见错误：**
9. **dataSource正确理解**：
   - dataSource是声明接口请求的配置，不是用来存储数据的
   - 正确格式：
   \`\`\`json
   "dataSource": {
     "list": [
       {
         "id": "urlParams",
         "type": "urlParams"
       },
       {
         "id": "user",
         "type": "fetch",
         "options": {
           "method": "GET",
           "uri": "mock/info.json"
         },
         "shouldFetch": {
           "type": "JSFunction",
           "value": "function() { return true; }"
         }
       }
     ]
   }
   \`\`\`

10. **数据绑定正确格式**：
    - 错误：{{state.filterParams.name}}
    - 正确：this.state.filterParams.name
    - 使用JSExpression类型：
    \`\`\`json
    {
      "type": "JSExpression",
      "value": "this.state.filterParams.name"
    }
    \`\`\`

11. **方法绑定正确格式**：
    - 错误：methods.handleFilterChange.bind(null, 'category')
    - 正确：this.onTestUtilsButtonClicked.apply(this,Array.prototype.slice.call(arguments).concat([]))
    - 使用JSFunction类型：
    \`\`\`json
    {
      "type": "JSFunction", 
      "value": "function(){this.onTestUtilsButtonClicked.apply(this,Array.prototype.slice.call(arguments).concat([])) }"
    }
     \`\`\`

12. **originCode正确格式**：
    - originCode中的state必须使用具体的值，不能使用[object Object]
    - 错误：state = { "filterParams": [object Object] }
    - 正确：state = { "filterParams": { "productName": "", "category": "", "status": "" } }
    - **重要**：originCode必须是一个字符串，包含完整的JavaScript类代码
    - originCode示例：
    \`\`\`javascript
    "originCode": "class LowcodeComponent extends Component {\\n  state = {\\n    \\"text\\": \\"outer\\",\\n    \\"isShowDialog\\": false,\\n    \\"filterParams\\": {\\n      \\"productName\\": \\"\\",\\n      \\"category\\": \\"\\",\\n      \\"status\\": \\"\\"\\n    },\\n    \\"dataList\\": [\\n      {\\"id\\": 1, \\"name\\": \\"产品A\\", \\"category\\": \\"电子\\", \\"status\\": \\"在售\\"},\\n      {\\"id\\": 2, \\"name\\": \\"产品B\\", \\"category\\": \\"服装\\", \\"status\\": \\"下架\\"}\\n    ]\\n  }\\n  componentDidMount() {\\n    console.log('did mount');\\n  }\\n  handleSearch(values) {\\n    this.setState({\\n      filterParams: values\\n    });\\n  }\\n}"
    \`\`\`
    - **注意**：originCode是字符串格式，需要正确转义引号和换行符

**数据示例格式：**
- 用户信息：{"name": "张三", "email": "zhangsan@example.com", "phone": "13800138000", "avatar": "https://example.com/avatar.jpg"}
- 列表数据：[{"id": 1, "name": "项目A", "status": "进行中", "progress": 75}, ...]
- 图表数据：[{"month": "1月", "sales": 1200, "profit": 800}, ...]

请返回JSON格式的结果：
{
  "completed": boolean, // 是否完成优化
  "schema": {}, // 优化后的完整schema，必须包含dataSource、state、methods等字段
  "changes": [], // 本次优化的具体变更说明
  "reasoning": "优化思路和判断依据"
}

如果认为已经达到最佳状态，请设置completed为true。`;
  }

  /**
   * 解析优化响应
   */
  parseOptimizationResponse(response) {
    console.log('🔍 开始解析优化响应...');
    console.log('📝 原始响应内容:', response);
    console.log('📏 响应长度:', response.length);
    
    let lastError;

    // 策略1: 直接JSON解析
    try {
      const result = JSON.parse(response);
      console.log('✅ 解析器 1 成功: 直接JSON解析');
      return result;
    } catch (error) {
      console.log('❌ 解析器 1 失败:', error.message);
      lastError = error;
    }

    // 策略2: 提取JSON代码块
    try {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[1]);
        console.log('✅ 解析器 2 成功: JSON代码块提取');
        return result;
      }
    } catch (error) {
      console.log('❌ 解析器 2 失败:', error.message);
      lastError = error;
    }

    // 策略3: 提取大括号内容
    try {
      const braceMatch = response.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        const result = JSON.parse(braceMatch[0]);
        console.log('✅ 解析器 3 成功: 大括号内容提取');
        return result;
      }
    } catch (error) {
      console.log('❌ 解析器 3 失败:', error.message);
      lastError = error;
    }

    // 策略4: jsonrepair修复
    try {
      const repairedJson = jsonrepair(response);
      const result = JSON.parse(repairedJson);
      console.log('✅ 解析器 4 成功: jsonrepair修复');
      return result;
    } catch (error) {
      console.log('❌ 解析器 4 失败:', error.message);
      lastError = error;
    }
    
    // 策略5: JSON5直接解析
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      console.log('🧹 清理后的响应:', cleanedResponse);
      const result = JSON5.parse(cleanedResponse);
      console.log('✅ 解析器 5 成功: JSON5直接解析');
      return result;
    } catch (error) {
      console.log('❌ 解析器 5 失败:', error.message);
      lastError = error;
    }
    
    console.log('🚨 所有解析策略都失败了');
    console.log('💥 最后一个错误:', lastError.message);
    console.error('解析优化响应失败:', lastError);
    throw new Error('无法解析优化响应');
  }

  /**
   * 调用Silicon Flow API
   */
  async callSiliconFlowAPI(messages) {
    const requestData = {
      model: 'deepseek-ai/DeepSeek-V3',
      messages: messages,
      temperature: 0.7,
      max_tokens: 46384
    };
    
    const requestConfig = {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 3000000
    };

    // 打印请求参数
    console.log('🚀 [Silicon Flow API] 发送请求:');
    console.log('📍 URL:', `${this.baseURL}/v1/chat/completions`);
    console.log('📋 请求数据:', JSON.stringify({
      model: requestData.model,
      temperature: requestData.temperature,
      max_tokens: requestData.max_tokens,
      messages: requestData.messages.map((msg, index) => ({
        index,
        role: msg.role,
        content: msg.content ? `${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...(截断)' : ''}` : msg.content
      }))
    }, null, 2));
    console.log('⚙️ 请求配置:', JSON.stringify({
      timeout: requestConfig.timeout,
      headers: {
        'Content-Type': requestConfig.headers['Content-Type'],
        'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`
      }
    }, null, 2));

    const response = await axios.post(`${this.baseURL}/v1/chat/completions`, requestData, requestConfig);

    // 打印响应数据
    console.log('📥 [Silicon Flow API] 收到响应:');
    console.log('📊 响应状态:', response.status, response.statusText);
    console.log('📋 响应头:', JSON.stringify({
      'content-type': response.headers['content-type'],
      'content-length': response.headers['content-length']
    }, null, 2));
    console.log('📄 响应数据结构:', JSON.stringify({
      id: response.data.id,
      object: response.data.object,
      created: response.data.created,
      model: response.data.model,
      usage: response.data.usage,
      choices: response.data.choices?.map((choice, index) => ({
        index,
        finish_reason: choice.finish_reason,
        message: {
          role: choice.message?.role,
          content: choice.message?.content ? `${choice.message.content.substring(0, 300)}${choice.message.content.length > 300 ? '...(截断)' : ''}` : choice.message?.content
        }
      }))
    }, null, 2));

    return response.data.choices[0].message.content;
  }

  /**
   * 清理JSON响应
   */
  cleanJsonResponse(response) {
    // 移除markdown代码块标记
    let cleaned = response.replace(/```json\s*|\s*```/g, '');
    
    // 移除可能的前后空白和换行
    cleaned = cleaned.trim();
    
    // 尝试找到JSON对象的开始和结束
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    return cleaned;
  }

  /**
   * 完整的物料选择和schema生成流程
   */
  async generateSchemaWithMaterialSelection(userPrompt) {
    try {
      console.log('🚀 [Material Selection] 开始智能物料选择和schema生成流程');
      console.log('📝 用户需求:', userPrompt);
      
      // 记录初始请求参数
      await this.writeDetailedLog('material_selection_request', {
        userPrompt,
        timestamp: new Date().toISOString(),
        step: 'initial_request'
      });
      
      // 1. 获取可用物料
      const availableMaterials = this.getAvailableMaterials();
      console.log('📦 可用物料总数:', availableMaterials.length);
      
      // 记录可用物料信息
      await this.writeDetailedLog('available_materials', {
        totalCount: availableMaterials.length,
        materials: availableMaterials,
        materialsByLibrary: {
          'fusion-ui': availableMaterials.filter(m => m.library === 'fusion-ui').length,
          'fusion-lowcode-materials': availableMaterials.filter(m => m.library === 'fusion-lowcode-materials').length
        }
      });
      
      // 2. 智能选择物料
      console.log('🎯 开始智能物料选择...');
      const selectionResult = await this.selectMaterials(userPrompt, availableMaterials);
      console.log('✅ 物料选择完成:', JSON.stringify({
        selectedCount: selectionResult.selectedMaterials?.length || 0,
        materials: selectionResult.selectedMaterials?.map(m => ({
          name: m.name || m,
          library: m.library,
          needSourceCode: m.needSourceCode
        })),
        completed: selectionResult.completed,
        hasInitialSchema: !!selectionResult.initialSchema
      }, null, 2));
      
      // 记录物料选择结果
      await this.writeDetailedLog('material_selection_result', {
        userPrompt,
        availableMaterialsCount: availableMaterials.length,
        selectionResult: {
          selectedMaterials: selectionResult.selectedMaterials,
          completed: selectionResult.completed,
          initialSchema: selectionResult.initialSchema,
          reasoning: selectionResult.reasoning
        },
        selectedCount: selectionResult.selectedMaterials?.length || 0
      });
      
      // 3. 如果可以直接完成，返回结果
      if (selectionResult.completed && selectionResult.initialSchema) {
        console.log('🎉 直接完成，无需迭代优化');
        
        const finalResult = {
          completed: true,
          schema: selectionResult.initialSchema,
          selectedMaterials: selectionResult.selectedMaterials,
          iterations: 0,
          iterationHistory: [] // 直接完成时没有迭代历史
        };
        
        // 记录最终结果
        await this.writeDetailedLog('final_result_direct', {
          userPrompt,
          result: finalResult,
          schemaSize: JSON.stringify(selectionResult.initialSchema).length
        });
        
        return finalResult;
      }
      
      // 4. 获取需要的物料源代码
      console.log('📚 开始获取物料源代码...');
      const materialSources = {};
      // 修改逻辑：只要是选中的物料就获取源代码，不依赖needSourceCode判断
      const materialsNeedingSource = selectionResult.selectedMaterials || [];
      console.log('🔍 需要源代码的物料:', materialsNeedingSource.map(m => m.name || m));
      
      // 记录源代码获取开始
      await this.writeDetailedLog('source_code_acquisition_start', {
        userPrompt,
        materialsNeedingSource: materialsNeedingSource.map(m => ({
          name: m.name || m,
          library: m.library
        })),
        totalMaterialsNeedingSource: materialsNeedingSource.length
      });
      
      for (const material of materialsNeedingSource) {
        // 确保material是有效的对象或字符串
        if (!material) {
          console.warn('⚠️ 跳过无效的物料对象:', material);
          continue;
        }
        
        const materialName = typeof material === 'string' ? material : (material.name || material);
        const libraryName = typeof material === 'object' ? (material.library || 'fusion-ui') : 'fusion-ui';
        
        // 验证物料名称是否有效
        if (!materialName || typeof materialName !== 'string' || materialName === '[object Object]') {
          console.warn('⚠️ 跳过无效的物料名称:', materialName, '原始物料对象:', material);
          continue;
        }
        
        console.log(`📖 正在获取 ${materialName} (${libraryName}) 的源代码...`);
        
        try {
          // 检查是否已经有源代码缓存，避免重复获取
          const cacheKey = `${libraryName}:${materialName}`;
          if (!materialSources[materialName] && !this.sourceCodeCache.has(cacheKey)) {
            materialSources[materialName] = await this.getMaterialSourceCode(materialName, libraryName);
            console.log(`✅ ${materialName} 源代码获取成功，长度: ${materialSources[materialName]?.source?.length || 0} 字符`);
          } else if (this.sourceCodeCache.has(cacheKey)) {
            materialSources[materialName] = this.sourceCodeCache.get(cacheKey);
            console.log(`📋 ${materialName} 源代码从缓存获取，跳过重复获取`);
          } else {
            console.log(`📋 ${materialName} 源代码已存在，跳过获取`);
          }
        } catch (error) {
          console.warn(`⚠️ ${materialName} 源代码获取失败:`, error.message);
          materialSources[materialName] = null;
        }
      }
      
      console.log('📊 物料源代码获取汇总:', Object.keys(materialSources).map(name => ({
        name,
        hasSource: !!materialSources[name],
        sourceLength: materialSources[name]?.length || 0
      })));
      
      // 记录源代码获取结果
      await this.writeDetailedLog('source_code_acquisition_result', {
        userPrompt,
        materialSources: Object.keys(materialSources).map(name => ({
          name,
          hasSource: !!materialSources[name],
          sourceLength: materialSources[name]?.length || 0,
          sourceCode: materialSources[name] // 完整源代码
        })),
        totalSourcesObtained: Object.keys(materialSources).filter(k => materialSources[k]).length
      });
      
      // 5. 迭代优化schema
      console.log('🔄 开始迭代优化schema...');
      let currentSchema = selectionResult.initialSchema || null;
      let iterationCount = 0;
      let optimizationResult;
      const maxIterations = 10;
      const iterationHistory = [];
      
      do {
        console.log(`🔄 第 ${iterationCount + 1} 次迭代优化...`);
        console.log('📋 当前schema状态:', currentSchema ? '存在' : '不存在');
        console.log('🛠️ 可用物料源代码:', Object.keys(materialSources).filter(k => materialSources[k]));
        
        // 记录迭代开始
        await this.writeDetailedLog(`iteration_${iterationCount + 1}_start`, {
          userPrompt,
          iterationCount: iterationCount + 1,
          currentSchemaExists: !!currentSchema,
          currentSchemaSize: currentSchema ? JSON.stringify(currentSchema).length : 0,
          availableSourceCodes: Object.keys(materialSources).filter(k => materialSources[k])
        });
        
        optimizationResult = await this.optimizeSchema(
          userPrompt, 
          currentSchema, 
          materialSources, 
          iterationCount
        );
        
        console.log(`✅ 第 ${iterationCount + 1} 次迭代完成:`, JSON.stringify({
          completed: optimizationResult.completed,
          hasSchema: !!optimizationResult.schema,
          schemaSize: optimizationResult.schema ? JSON.stringify(optimizationResult.schema).length : 0
        }, null, 2));
        
        // 记录迭代结果
        const iterationResult = {
          iterationNumber: iterationCount + 1,
          completed: optimizationResult.completed,
          hasSchema: !!optimizationResult.schema,
          schemaSize: optimizationResult.schema ? JSON.stringify(optimizationResult.schema).length : 0,
          schema: optimizationResult.schema,
          reasoning: optimizationResult.reasoning
        };
        
        iterationHistory.push(iterationResult);
        
        await this.writeDetailedLog(`iteration_${iterationCount + 1}_result`, {
          userPrompt,
          ...iterationResult
        });
        
        currentSchema = optimizationResult.schema;
        iterationCount++;
        
      } while (!optimizationResult.completed && iterationCount < maxIterations);
      
      console.log('🎯 迭代优化完成:', JSON.stringify({
        totalIterations: iterationCount,
        maxIterations,
        finalCompleted: optimizationResult.completed,
        finalSchemaExists: !!currentSchema
      }, null, 2));
      
      const finalResult = {
        completed: true,
        schema: currentSchema,
        selectedMaterials: selectionResult.selectedMaterials,
        iterations: iterationCount,
        iterationHistory: iterationHistory,
        optimizationHistory: optimizationResult
      };
      
      // 记录最终完整结果
      await this.writeDetailedLog('final_result_complete', {
        userPrompt,
        finalResult,
        iterationHistory,
        totalIterations: iterationCount,
        finalSchemaSize: currentSchema ? JSON.stringify(currentSchema).length : 0,
        selectedMaterialsCount: selectionResult.selectedMaterials?.length || 0
      });
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ 物料选择和schema生成失败:', error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const requestData = {
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      };

      const requestConfig = {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 1000000
      };

      // 打印请求参数
      console.log('🚀 [Silicon Flow API - healthCheck] 发送请求:');
      console.log('📍 URL:', `${this.baseURL}/v1/chat/completions`);
      console.log('📋 请求数据:', JSON.stringify({
        model: requestData.model,
        max_tokens: requestData.max_tokens,
        messages: requestData.messages.map((msg, index) => ({
          index,
          role: msg.role,
          content: msg.content
        }))
      }, null, 2));
      console.log('⚙️ 请求配置:', JSON.stringify({
        timeout: requestConfig.timeout,
        headers: {
          'Content-Type': requestConfig.headers['Content-Type'],
          'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`
        }
      }, null, 2));

      const response = await axios.post(`${this.baseURL}/v1/chat/completions`, requestData, requestConfig);

      // 打印响应数据
      console.log('📥 [Silicon Flow API - healthCheck] 收到响应:');
      console.log('📊 响应状态:', response.status, response.statusText);
      console.log('📋 响应头:', JSON.stringify({
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length']
      }, null, 2));
      console.log('📄 响应数据结构:', JSON.stringify({
        id: response.data.id,
        object: response.data.object,
        created: response.data.created,
        model: response.data.model,
        usage: response.data.usage,
        choices: response.data.choices?.map((choice, index) => ({
          index,
          finish_reason: choice.finish_reason,
          message: {
            role: choice.message?.role,
            content: choice.message?.content
          }
        }))
      }, null, 2));

      return response.status === 200;
    } catch (error) {
      console.error('Silicon Flow API健康检查失败:', error.message);
      return false;
    }
  }
}

module.exports = MaterialSelectionService;