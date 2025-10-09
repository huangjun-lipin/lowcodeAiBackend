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
   * 调用Silicon Flow API (流式版本)
   */
  async callSiliconFlowAPIStream(messages, onProgress) {
    const requestData = {
      model: 'deepseek-ai/DeepSeek-V3',
      messages: messages,
      temperature: 0.7,
      max_tokens: 46384,
      stream: true // 启用流式输出
    };
    
    const requestConfig = {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 3000000,
      responseType: 'stream'
    };

    console.log('🚀 [Silicon Flow API Stream] 发送流式请求');

    const response = await axios.post(`${this.baseURL}/v1/chat/completions`, requestData, requestConfig);

    let fullContent = '';
    let buffer = '';

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // 处理SSE数据格式
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const jsonData = JSON.parse(data);
              if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta) {
                const content = jsonData.choices[0].delta.content;
                if (content) {
                  fullContent += content;
                  
                  // 发送逐字符进度回调
                  if (onProgress) {
                    onProgress({
                      type: 'stream',
                      content: fullContent,
                      timestamp: Date.now()
                    });
                  }
                }
              }
            } catch (parseError) {
              // 忽略JSON解析错误，继续处理下一行
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve(fullContent);
      });

      response.data.on('error', (error) => {
        console.error('🚨 流式响应错误:', error);
        reject(error);
      });
    });
  }

  /**
   * 标准化物料名称：将PascalCase转换为kebab-case
   */
  normalizeMaterialName(materialName) {
    if (!materialName) return materialName;
    
    // 将PascalCase转换为kebab-case
    // 例如: ProTable -> pro-table, DatePicker -> date-picker
    return materialName
      .replace(/([A-Z])/g, '-$1')  // 在大写字母前添加连字符
      .toLowerCase()               // 转换为小写
      .replace(/^-/, '');          // 移除开头的连字符
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
   * 记录完整提示语到专门的日志文件
   */
  async writeCompletePromptLog(userPrompt, messages, iterationCount) {
    try {
      const timestamp = new Date().toISOString();
      const promptLogEntry = {
        timestamp,
        userPrompt,
        iterationCount,
        messages: messages.map((msg, index) => ({
          index,
          role: msg.role,
          contentLength: msg.content.length,
          contentPreview: msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''),
          fullContent: msg.content // 完整内容
        })),
        totalMessages: messages.length,
        totalPromptLength: messages.reduce((sum, msg) => sum + msg.content.length, 0)
      };
      
      // 专门的完整提示语日志文件
      const promptLogFileName = `complete_prompts.log`;
      const promptLogFilePath = path.join(this.logsDir, promptLogFileName);
      
      // 使用分隔符便于查看
      const logLine = JSON.stringify(promptLogEntry, null, 2) + '\n' + '---PROMPT_SEPARATOR---\n';
      await fs.promises.appendFile(promptLogFilePath, logLine, 'utf8');
      
      console.log(`📋 完整提示语已记录: 用户需求="${userPrompt.substring(0, 50)}..." 迭代=${iterationCount} 消息数=${messages.length} 总长度=${promptLogEntry.totalPromptLength}`);
    } catch (error) {
      console.error('❌ 写入完整提示语日志文件失败:', error.message);
    }
  }

  /**
   * 初始化物料缓存
   */
  async initializeMaterialCache() {
    try {
      // 先加载fusion-ui，再加载fusion-lowcode-materials
      // 这样fusion-ui的物料会优先被缓存
      await this.loadMaterialsFromPath('fusion-ui', this.materialPaths.fusionUI);
      await this.loadMaterialsFromPath('fusion-lowcode-materials', this.materialPaths.fusionLowcodeMaterials);
      console.log(`物料缓存初始化完成，共加载 ${this.materialCache.size} 个物料`);
      
      // 输出物料库统计信息
      const fusionUICount = Array.from(this.materialCache.values()).filter(m => m.library === 'fusion-ui').length;
      const fusionLowcodeCount = Array.from(this.materialCache.values()).filter(m => m.library === 'fusion-lowcode-materials').length;
      console.log(`📊 物料统计: fusion-ui(${fusionUICount}个), fusion-lowcode-materials(${fusionLowcodeCount}个)`);
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
    
    // 先添加fusion-ui的物料，确保优先级
    for (const [key, material] of this.materialCache) {
      if (material.library === 'fusion-ui') {
        materials.push({
          name: material.name,
          library: material.library,
          path: material.path,
          hasSource: material.hasSource,
          key: key
        });
      }
    }
    
    // 再添加其他库的物料
    for (const [key, material] of this.materialCache) {
      if (material.library !== 'fusion-ui') {
        materials.push({
          name: material.name,
          library: material.library,
          path: material.path,
          hasSource: material.hasSource,
          key: key
        });
      }
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
    // 构建增强的物料列表，包含snippets信息
    const materialList = availableMaterials.map(m => {
      let materialInfo = `- ${m.name} (${m.library}): ${m.hasSource ? '有源码' : '仅配置'}`;
      
      // 如果有snippets信息，添加到物料描述中
      const materialData = this.materialCache.get(`${m.library}:${m.name}`);
      if (materialData && materialData.snippetsContent) {
        try {
          // 尝试解析snippets内容，提取关键信息
          const snippetsMatch = materialData.snippetsContent.match(/title:\s*['"`]([^'"`]+)['"`]/g);
          if (snippetsMatch && snippetsMatch.length > 0) {
            const titles = snippetsMatch.map(match => 
              match.replace(/title:\s*['"`]([^'"`]+)['"`]/, '$1')
            ).join(', ');
            materialInfo += ` [示例: ${titles}]`;
          }
          
          // 提取props信息作为参考
          const propsMatch = materialData.snippetsContent.match(/props:\s*{([^}]+)}/);
          if (propsMatch) {
            const propsInfo = propsMatch[1].replace(/\s+/g, ' ').substring(0, 100);
            materialInfo += ` [配置: ${propsInfo}...]`;
          }
        } catch (error) {
          // 如果解析失败，忽略错误继续
        }
      }
      
      return materialInfo;
    }).join('\n');

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

**🚨 重要选择原则（严格执行）：**
1. **严禁使用fusion-lowcode-materials中的任何组件** - 这些组件已过时且不稳定
2. **必须优先且仅使用fusion-ui中的组件** - 它们更加现代化、功能完整且经过充分测试
3. **严格使用正确的组件名称，禁止使用不存在的组件**

**🔥 fusion-ui中可用的组件列表（严格限制，不得使用其他组件）：**
- **表格类**: ProTable, ProTableSlot
- **表单类**: ProForm, StepForm, ChildForm, AnchorForm  
- **表单控件**: FormSelect, FormDatePicker, FormRangePicker, FormNumberPicker, FormCheckboxGroup, FormRadioGroup, FormCascaderSelect, FormTreeSelect, FormUpload, FormRating
- **日期选择**: MonthPicker, WeekPicker, YearPicker
- **图表类**: AreaChart, BarChart, ColumnChart, DonutChart, LineChart, PieChart
- **布局类**: PageHeader, TabContainer, Drawer
- **设置器**: ExpressionSetter, NumberSetter, ObjectSetter, RadioGroupSetter
- **其他**: Anchor, FilterItem, ProDialog, StoryPlaceholder

**❌ 严禁使用以下不存在的组件名称：**
- Column（不存在，应使用ProTable的columns配置）
- Input（不存在，应使用FormSelect或其他Form控件）
- Select（不存在，应使用FormSelect）
- DatePicker（不存在，应使用FormDatePicker）
- DateRangePicker（不存在，应使用FormRangePicker）
- Button（不存在，应使用ProForm内置按钮或操作配置）
- Table（不存在，应使用ProTable）

4. **常用组件映射关系**：
   - 表单相关：使用 ProForm（完整表单解决方案）
   - 输入框：使用 FormSelect 或其他 Form 控件
   - 按钮：使用 ProForm 内置的按钮功能
   - 表格：使用 ProTable（功能强大的表格组件）
   - 对话框：使用 ProDialog
   - 抽屉：使用 Drawer
   - 日期选择：使用 FormDatePicker、MonthPicker、YearPicker等
   - 下拉选择：使用 FormSelect、FormCascaderSelect、FormTreeSelect等

5. **强烈建议获取源代码**：为了实现更好的定制化效果，应该积极获取物料源代码
6. 以下情况**必须**获取源代码：
   - 需要自定义样式或交互逻辑
   - 需要复杂的数据处理或状态管理
   - 需要特殊的事件处理或生命周期管理
   - 用户明确提到"定制化"、"自定义"、"复杂"等关键词
5. 只有在极其简单的静态展示需求时，才可以不获取源代码

**重要：充分利用物料的snippets示例**
6. **参考snippets中的示例配置**：每个物料都提供了最佳实践的配置示例，包括：
   - 组件的基础属性配置
   - 常用的数据结构格式
   - 推荐的样式和交互设置
7. **基于snippets生成初始化效果**：
   - 使用snippets中的props配置作为组件初始化的基础
   - 参考snippets中的dataSource结构来设计数据格式
   - 借鉴snippets中的示例数据来生成真实的假数据
   - 根据snippets的title了解组件的典型使用场景

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

🚨 **JSFunction使用规范 - 防止this上下文丢失错误**

**重要：为了避免 "TypeError: __self.fetchData is not a function" 等this上下文丢失错误，必须严格遵守以下规范：**

### 1. JSFunction定义规范
- **方法定义**：在methods中定义的JSFunction必须使用正确的this绑定
- **生命周期**：在lifeCycles中定义的JSFunction必须正确处理this上下文
- **事件处理**：在组件属性中引用方法时，必须使用JSExpression + 方法引用模式

### 2. 正确的this绑定模式

**✅ 正确示例 - 方法定义：**
"methods": {
  "fetchData": {
    "type": "JSFunction",
    "value": "function fetchData() { console.log('获取数据', this.state); }"
  },
  "handleSearch": {
    "type": "JSFunction", 
    "value": "function handleSearch(values) { this.setState({ filterParams: values }); this.fetchData(); }"
  }
}

**✅ 正确示例 - 事件绑定（推荐使用JSExpression）：**
"onChange": {
  "type": "JSExpression",
  "value": "this.handleSearch"
}

**✅ 正确示例 - Column render函数：**
"render": {
  "type": "JSFunction", 
  "value": "function(text, record) { return this.renderActionColumn(text, record); }.bind(this)"
}

**✅ 正确示例 - 内联render函数（如必须使用）：**
"render": {
  "type": "JSFunction",
  "value": "function(text, record) { return this.formatPrice ? this.formatPrice(text) : text; }.bind(this)"
}

### 3. 避免的错误模式

**❌ 错误示例 - 直接JSFunction引用：**
"onChange": {
  "type": "JSFunction",
  "value": "function() { this.handleSearch(); }"  // this上下文可能丢失
}

**❌ 错误示例 - 未绑定this的render：**
"render": {
  "type": "JSFunction", 
  "value": "function(text) { return this.formatPrice(text); }"  // this上下文丢失
}

### 4. setState回调规范

**✅ 正确的setState使用：**
"handleSubmit": {
  "type": "JSFunction",
  "value": "function handleSubmit(values) { this.setState({ formData: values }, () => { this.fetchData(); }); }"
}

### 5. 组件事件绑定检查清单

在生成schema时，请检查以下项目：
- [ ] 所有methods中的JSFunction都正确使用了this
- [ ] 组件的onChange、onClick等事件使用JSExpression引用方法
- [ ] render函数必须使用JSFunction类型，不能使用JSExpression
- [ ] 如使用内联JSFunction，确保正确绑定this
- [ ] setState回调中的方法调用正确使用this
- [ ] 生命周期方法中的this调用正确

### 6. 常见错误预防

**防止 "TypeError: __self.fetchData is not a function"：**
1. 确保fetchData在methods中正确定义
2. 调用fetchData时使用 this.fetchData()
3. 在事件绑定中使用JSExpression而非JSFunction
4. 检查所有方法调用都有正确的this前缀

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
    
    // 检查MD内容缓存
    if (this.sourceCodeCache.has(materialKey)) {
      console.log(`📋 从缓存获取 ${materialName} MD文件内容`);
      return this.sourceCodeCache.get(materialKey);
    }
    
    // 使用siliconFlowService的getMaterialInfoFromMd方法获取MD文件内容
    try {
      const siliconFlowService = require('./siliconFlowService');
      const materialInfo = await siliconFlowService.getMaterialInfoFromMd(libraryName, materialName);
      
      if (!materialInfo) {
        throw new Error(`物料 ${materialName} 的MD文件不存在`);
      }

      const mdContent = {
        mdContent: materialInfo.mdContent,
        componentName: materialInfo.componentName,
        title: materialInfo.title,
        category: materialInfo.category,
        npmPackage: materialInfo.npmPackage
      };

      // 将结果缓存
      this.sourceCodeCache.set(materialKey, mdContent);
      console.log(`💾 已缓存 ${materialName} MD文件内容`);

      return mdContent;
    } catch (error) {
      console.error(`❌ 获取 ${materialName} MD文件内容失败:`, error);
      throw new Error(`获取物料 ${materialName} 的MD文件内容失败: ${error.message}`);
    }
  }

  /**
   * 解析import路径为实际文件路径
   * @param {string} importPath - import路径
   * @param {string} baseDir - 基础目录
   * @returns {string|null} 解析后的文件路径
   */
  resolveImportPath(importPath, baseDir) {
    // 处理相对路径
    let resolvedPath = path.resolve(baseDir, importPath);
    
    // 尝试不同的文件扩展名
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    // 如果路径已经有扩展名，直接检查
    if (path.extname(resolvedPath)) {
      return fs.existsSync(resolvedPath) ? resolvedPath : null;
    }
    
    // 尝试添加扩展名
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext;
      if (fs.existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }
    
    // 尝试index文件
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
    
    return null;
  }

  /**
   * 解析文件中的依赖关系
   * @param {string} fileContent - 文件内容
   * @param {string} filePath - 文件路径
   * @returns {Array} 依赖文件路径数组
   */
  parseDependencies(fileContent, filePath) {
    const dependencies = [];
    const fileDir = path.dirname(filePath);
    
    // 匹配各种import、export和require语句的正则表达式
    const importPatterns = [
      // ES6 import语句
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g,
      // ES6 export from语句
      /export\s+(?:\{[^}]*\}|\*(?:\s+as\s+\w+)?)\s+from\s+['"`]([^'"`]+)['"`]/g,
      // CommonJS require语句
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // 动态import
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];
    
    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(fileContent)) !== null) {
        const importPath = match[1];
        
        // 跳过node_modules和绝对路径的依赖
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          continue;
        }
        
        // 解析相对路径
        const resolvedPath = this.resolveImportPath(importPath, fileDir);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          dependencies.push(resolvedPath);
        }
      }
    });
    
    return dependencies;
  }

  /**
   * 递归加载文件及其所有依赖
   * @param {string} filePath - 入口文件路径
   * @param {Set} loadedFiles - 已加载文件集合（防止循环依赖）
   * @param {string} libraryDir - 物料库目录
   * @returns {Object} 文件内容映射
   */
  loadFileWithDependencies(filePath, loadedFiles = new Set(), libraryDir = '') {
    const fileMap = {};
    
    // 防止循环依赖
    if (loadedFiles.has(filePath)) {
      return fileMap;
    }
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.warn(`文件不存在: ${filePath}`);
        return fileMap;
      }
      
      // 标记文件为已加载
      loadedFiles.add(filePath);
      
      // 读取文件内容
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const relativePath = libraryDir ? path.relative(libraryDir, filePath) : path.basename(filePath);
      fileMap[relativePath] = fileContent;
      
      console.log(`📄 加载文件: ${relativePath}`);
      
      // 解析依赖
      const dependencies = this.parseDependencies(fileContent, filePath);
      
      // 递归加载依赖文件
      for (const depPath of dependencies) {
        // 只加载物料库内的文件
        if (libraryDir && !depPath.startsWith(libraryDir)) {
          continue;
        }
        
        const depFiles = this.loadFileWithDependencies(depPath, loadedFiles, libraryDir);
        Object.assign(fileMap, depFiles);
      }
      
    } catch (error) {
      console.error(`加载文件失败 ${filePath}:`, error.message);
    }
    
    return fileMap;
  }

  /**
   * 查找组件的入口文件
   * @param {string} basePath - 基础路径
   * @param {string} materialName - 物料名称
   * @returns {string|null} 入口文件路径
   */
  findComponentEntryFile(basePath, materialName) {
    const srcPath = path.join(basePath, 'src');
    
    // 将组件名转换为kebab-case
    const kebabCaseName = materialName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    
    // 可能的入口文件路径
    const possibleEntryPaths = [
      // 直接在src目录下
      path.join(srcPath, `${materialName}.tsx`),
      path.join(srcPath, `${materialName}.ts`),
      path.join(srcPath, `${kebabCaseName}.tsx`),
      path.join(srcPath, `${kebabCaseName}.ts`),
      
      // 在components目录下
      path.join(srcPath, 'components', `${materialName}.tsx`),
      path.join(srcPath, 'components', `${materialName}.ts`),
      path.join(srcPath, 'components', `${kebabCaseName}.tsx`),
      path.join(srcPath, 'components', `${kebabCaseName}.ts`),
      
      // 在组件名目录下的index文件
      path.join(srcPath, 'components', materialName, 'index.tsx'),
      path.join(srcPath, 'components', materialName, 'index.ts'),
      path.join(srcPath, 'components', kebabCaseName, 'index.tsx'),
      path.join(srcPath, 'components', kebabCaseName, 'index.ts'),
      
      // 在嵌套的components目录下
      path.join(srcPath, 'components', materialName, 'components', 'index.tsx'),
      path.join(srcPath, 'components', materialName, 'components', 'index.ts'),
      path.join(srcPath, 'components', kebabCaseName, 'components', 'index.tsx'),
      path.join(srcPath, 'components', kebabCaseName, 'components', 'index.ts'),
      
      // 直接在materialName目录下
      path.join(srcPath, materialName, 'index.tsx'),
      path.join(srcPath, materialName, 'index.ts'),
      path.join(srcPath, kebabCaseName, 'index.tsx'),
      path.join(srcPath, kebabCaseName, 'index.ts')
    ];
    
    for (const entryPath of possibleEntryPaths) {
      if (fs.existsSync(entryPath)) {
        console.log(`✅ 找到入口文件: ${entryPath}`);
        return entryPath;
      }
    }
    
    console.warn(`⚠️ 未找到入口文件: ${materialName}`);
    return null;
  }

  /**
   * 读取物料源代码文件（增强版，支持递归加载依赖）
   */
  async readSourceFiles(basePath, materialName) {
    console.log(`🔍 开始读取物料源代码: ${materialName} (basePath: ${basePath})`);
    
    // 查找入口文件
    const entryFilePath = this.findComponentEntryFile(basePath, materialName);
    
    if (!entryFilePath) {
      console.warn(`⚠️ 未找到物料 ${materialName} 的入口文件`);
      return {};
    }
    
    // 使用递归加载方法加载所有相关文件
    const libraryDir = basePath; // 使用basePath作为库目录限制
    const allFiles = this.loadFileWithDependencies(entryFilePath, new Set(), libraryDir);
    
    console.log(`✅ 成功加载物料 ${materialName} 的 ${Object.keys(allFiles).length} 个文件`);
    console.log(`📋 加载的文件列表:`, Object.keys(allFiles));
    
    return allFiles;
  }

  /**
   * 迭代优化schema
   */
  async optimizeSchema(userPrompt, currentSchema, materialSources, iterationCount = 0, progressCallback = null) {
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

    // 记录完整提示语到专门的日志文件
    await this.writeCompletePromptLog(userPrompt, messages, iterationCount);

    try {
      let response;
      
      // 如果有进度回调，使用流式API
      if (progressCallback) {
        console.log('🌊 使用流式API进行优化...');
        
        // 发送流式进度回调
        const streamProgressCallback = (streamData) => {
          if (streamData.type === 'stream' && streamData.content) {
            progressCallback({
              iterationNumber: iterationCount + 1,
              message: streamData.content,
              completed: false,
              streaming: true
            });
          }
        };
        
        response = await this.callSiliconFlowAPIStream(messages, streamProgressCallback);
      } else {
        console.log('📞 使用标准API进行优化...');
        response = await this.callSiliconFlowAPI(messages);
      }
      
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
      sourcesInfo = '可用物料MD文档信息：\n';
      for (const [materialName, mdData] of Object.entries(materialSources)) {
        // 跳过无效的物料名称和空的MD数据
        if (!materialName || materialName === '[object Object]' || !mdData) {
          console.warn(`⚠️ 跳过无效物料: ${materialName}, mdData:`, mdData);
          continue;
        }
        
        sourcesInfo += `\n=== ${materialName} ===\n`;
        if (mdData.title) {
          sourcesInfo += `组件标题: ${mdData.title}\n`;
        }
        if (mdData.componentName) {
          sourcesInfo += `组件名称: ${mdData.componentName}\n`;
        }
        if (mdData.category) {
          sourcesInfo += `组件分类: ${mdData.category}\n`;
        }
        if (mdData.npmPackage) {
          sourcesInfo += `NPM包: ${mdData.npmPackage}\n`;
        }
        if (mdData.mdContent) {
          sourcesInfo += `MD文档内容:\n${mdData.mdContent.substring(0, 2000)}...\n`;
          sourcesInfo += `💡 请特别关注MD文档中的使用示例和API说明，这些是该物料的最佳实践配置\n`;
        }
      }
    }

    return `你是一个专业的低代码schema优化助手。当前是第${iterationCount + 1}次迭代优化。

${sourcesInfo}

优化原则：
1. 渐进式优化：在现有schema基础上进行小幅改进，不要轻易推翻整体结构
2. 保持一致性：确保schema中的dataSource、state、lifeCycles、methods与originCode保持一致
3. 必须仅使用fusion-ui组件，严禁使用fusion-lowcode-materials中的任何组件
4. 根据物料的实际能力和配置进行合理的属性设置
5. 确保生成的代码可以正常运行

**重要：充分利用MD文档示例进行优化**
6. **参考MD文档最佳实践**：
   - 使用MD文档中展示的组件配置作为优化的参考标准
   - 借鉴MD文档中的props设置来完善组件属性
   - 参考MD文档中的数据结构来优化dataSource和state
   - 根据MD文档的使用场景来调整组件的交互逻辑
7. **基于MD文档生成真实效果**：
   - 将MD文档中的示例数据扩展为更丰富的假数据
   - 根据MD文档的配置模式来设计更完整的功能
   - 参考MD文档的组件组合方式来优化页面布局

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
8. **componentName必须固定为"Page"**：
   - 所有生成的schema中componentName字段必须设置为"Page"
   - 不能使用"LowcodeComponent"或其他值
   - 示例：\`"componentName": "Page"\`

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

🚨 **JSFunction使用规范 - 防止this上下文丢失错误**

**重要：为了避免 "TypeError: __self.fetchData is not a function" 等this上下文丢失错误，必须严格遵守以下规范：**

### 1. JSFunction定义规范
- **方法定义**：在methods中定义的JSFunction必须使用正确的this绑定
- **生命周期**：在lifeCycles中定义的JSFunction必须正确处理this上下文
- **事件处理**：在组件属性中引用方法时，必须使用JSExpression + 方法引用模式

### 2. 正确的this绑定模式

**✅ 正确示例 - 方法定义：**
"methods": {
  "fetchData": {
    "type": "JSFunction",
    "value": "function fetchData() { console.log('获取数据', this.state); }"
  },
  "handleSearch": {
    "type": "JSFunction", 
    "value": "function handleSearch(values) { this.setState({ filterParams: values }); this.fetchData(); }"
  }
}

**✅ 正确示例 - 事件绑定（推荐使用JSExpression）：**
"onChange": {
  "type": "JSExpression",
  "value": "this.handleSearch"
}

**✅ 正确示例 -  Column render函数：**
"render": {
  "type": "JSFunction", 
  "value": "function(text, record) { return this.renderActionColumn(text, record); }.bind(this)"
}

**✅ 正确示例 - 内联render函数（如必须使用）：**
"render": {
  "type": "JSFunction",
  "value": "function(text, record) { return this.formatPrice ? this.formatPrice(text) : text; }.bind(this)"
}

### 3. 避免的错误模式

**❌ 错误示例 - 直接JSFunction引用：**
"onChange": {
  "type": "JSFunction",
  "value": "function() { this.handleSearch(); }"  // this上下文可能丢失
}

**❌ 错误示例 - 未绑定this的render：**
"render": {
  "type": "JSFunction", 
  "value": "function(text) { return this.formatPrice(text); }"  // this上下文丢失
}

### 4. setState回调规范

**✅ 正确的setState使用：**
"handleSubmit": {
  "type": "JSFunction",
  "value": "function handleSubmit(values) { this.setState({ formData: values }, () => { this.fetchData(); }); }"
}

### 5. 组件事件绑定检查清单

在生成schema时，请检查以下项目：
- [ ] 所有methods中的JSFunction都正确使用了this
- [ ] 组件的onChange、onClick等事件使用JSExpression引用方法
- [ ] render函数必须使用JSFunction类型，不能使用JSExpression
- [ ] 如使用内联JSFunction，确保正确绑定this
- [ ] setState回调中的方法调用正确使用this
- [ ] 生命周期方法中的this调用正确

### 6. 常见错误预防

**防止 "TypeError: __self.fetchData is not a function"：**
1. 确保fetchData在methods中正确定义
2. 调用fetchData时使用 this.fetchData()
3. 在事件绑定中使用JSExpression而非JSFunction
4. 检查所有方法调用都有正确的this前缀

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
      
      // 验证和保护originCode字段
      const validatedResult = this.validateAndProtectOriginCode(result);
      return validatedResult;
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
        
        // 验证和保护originCode字段
        const validatedResult = this.validateAndProtectOriginCode(result);
        return validatedResult;
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
        
        // 验证和保护originCode字段
        const validatedResult = this.validateAndProtectOriginCode(result);
        return validatedResult;
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
      
      // 验证和保护originCode字段
      const validatedResult = this.validateAndProtectOriginCode(result);
      return validatedResult;
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
      
      // 验证和保护originCode字段
      const validatedResult = this.validateAndProtectOriginCode(result);
      return validatedResult;
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
   * 验证和保护originCode字段
   * 确保schema中包含完整的originCode
   */
  validateAndProtectOriginCode(result) {
    console.log('🔍 开始验证和保护originCode字段...');
    
    if (!result || typeof result !== 'object') {
      console.warn('⚠️ 结果不是有效对象，跳过originCode验证');
      return result;
    }

    // 检查是否有schema字段
    if (!result.schema) {
      console.warn('⚠️ 结果中没有schema字段，跳过originCode验证');
      return result;
    }

    const schema = result.schema;
    
    // 检查originCode是否存在且有效
    if (!schema.originCode || typeof schema.originCode !== 'string' || schema.originCode.trim() === '') {
      console.warn('⚠️ originCode缺失或无效，开始生成...');
      
      // 生成originCode
      const generatedOriginCode = this.generateOriginCodeFromSchema(schema);
      if (generatedOriginCode) {
        schema.originCode = generatedOriginCode;
        console.log('✅ 成功生成originCode，长度:', generatedOriginCode.length);
      } else {
        console.error('❌ 无法生成originCode');
      }
    } else {
      console.log('✅ originCode字段验证通过，长度:', schema.originCode.length);
    }

    return result;
  }

  /**
   * 从schema生成originCode
   */
  generateOriginCodeFromSchema(schema) {
    console.log('🔧 开始从schema生成originCode...');
    
    try {
      const state = schema.state || {};
      const methods = schema.methods || {};
      const lifeCycles = schema.lifeCycles || {};
      
      // 构建state字符串
      const stateStr = JSON.stringify(state, null, 2)
        .replace(/"type":\s*"JSExpression",\s*"value":\s*"([^"]+)"/g, '$1')
        .replace(/"/g, '\\"');
      
      // 构建方法字符串
      let methodsStr = '';
      for (const [methodName, methodConfig] of Object.entries(methods)) {
        if (methodConfig && methodConfig.type === 'JSFunction' && methodConfig.value) {
          // 提取函数体
          const functionBody = methodConfig.value.replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '');
          methodsStr += `  ${methodName}() {\n    ${functionBody.trim()}\n  }\n`;
        }
      }
      
      // 构建生命周期字符串
      let lifeCyclesStr = '';
      for (const [lifeCycleName, lifeCycleConfig] of Object.entries(lifeCycles)) {
        if (lifeCycleConfig && lifeCycleConfig.type === 'JSFunction' && lifeCycleConfig.value) {
          // 提取函数体
          const functionBody = lifeCycleConfig.value.replace(/^function\s*\w*\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '');
          lifeCyclesStr += `  ${lifeCycleName}() {\n    ${functionBody.trim()}\n  }\n`;
        }
      }
      
      // 组装完整的originCode
      const originCode = `class LowcodeComponent extends Component {\\n  state = ${stateStr}\\n${lifeCyclesStr}${methodsStr}}`;
      
      console.log('✅ originCode生成完成');
      return originCode;
    } catch (error) {
      console.error('❌ 生成originCode失败:', error);
      return null;
    }
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
   * 完整的物料选择和schema生成流程 (流式版本)
   */
  async generateSchemaWithMaterialSelectionStream(userPrompt, progressCallback) {
    try {
      console.log('🚀 [Material Selection Stream] 开始智能物料选择和schema生成流程');
      console.log('📝 用户需求:', userPrompt);
      
      // 发送开始进度
      progressCallback({
        iterationNumber: 0,
        message: '开始分析需求...',
        completed: false
      });
      
      // 记录初始请求参数
      await this.writeDetailedLog('material_selection_request_stream', {
        userPrompt,
        timestamp: new Date().toISOString(),
        step: 'initial_request'
      });
      
      // 1. 获取可用物料
      const availableMaterials = this.getAvailableMaterials();
      console.log('📦 可用物料总数:', availableMaterials.length);
      
      progressCallback({
        iterationNumber: 0,
        message: `发现 ${availableMaterials.length} 个可用物料`,
        completed: false
      });
      
      // 2. 智能选择物料
      console.log('🎯 开始智能物料选择...');
      progressCallback({
        iterationNumber: 0,
        message: '正在智能选择物料...',
        completed: false
      });
      
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
      
      progressCallback({
        iterationNumber: 0,
        message: `已选择 ${selectionResult.selectedMaterials?.length || 0} 个物料`,
        completed: false,
        selectedMaterials: selectionResult.selectedMaterials
      });
      
      // 3. 如果可以直接完成，返回结果
      if (selectionResult.completed && selectionResult.initialSchema) {
        console.log('🎉 直接完成，无需迭代优化');
        
        progressCallback({
          iterationNumber: 1,
          message: '页面生成完成',
          completed: true,
          hasSchema: true,
          schemaSize: JSON.stringify(selectionResult.initialSchema).length
        });
        
        const finalResult = {
          completed: true,
          schema: selectionResult.initialSchema,
          selectedMaterials: selectionResult.selectedMaterials,
          iterations: 0,
          iterationHistory: []
        };
        
        return finalResult;
      }
      
      // 4. 获取需要的物料源代码
      console.log('📚 开始获取物料源代码...');
      progressCallback({
        iterationNumber: 0,
        message: '正在获取物料源代码...',
        completed: false
      });
      
      const materialSources = {};
      const materialsNeedingSource = selectionResult.selectedMaterials || [];
      
      for (const material of materialsNeedingSource) {
        const materialName = material.name || material;
        const materialLibrary = material.library;
        
        // 物料名称转换：将PascalCase转换为kebab-case
        const normalizedMaterialName = this.normalizeMaterialName(materialName);
        
        try {
          const sourceCode = await this.getMaterialSourceCode(normalizedMaterialName, materialLibrary);
          if (sourceCode) {
            materialSources[materialName] = sourceCode; // 使用原始名称作为key
            console.log(`✅ 获取物料源代码成功: ${materialName} -> ${normalizedMaterialName}`);
          } else {
            console.warn(`⚠️ 未找到物料源代码: ${materialName} -> ${normalizedMaterialName}`);
          }
        } catch (error) {
          console.error(`❌ 获取物料源代码失败: ${materialName}`, error);
        }
      }
      
      progressCallback({
        iterationNumber: 0,
        message: `已获取 ${Object.keys(materialSources).length} 个物料的源代码`,
        completed: false
      });
      
      // 5. 迭代优化schema
      console.log('🔄 开始迭代优化schema...');
      let currentSchema = selectionResult.initialSchema || null;
      let iterationCount = 0;
      const maxIterations = 3;
      const iterationHistory = [];
      
      while (iterationCount < maxIterations) {
        iterationCount++;
        console.log(`🔄 开始第 ${iterationCount} 次迭代优化...`);
        
        progressCallback({
          iterationNumber: iterationCount,
          message: `第 ${iterationCount} 次迭代优化中...`,
          completed: false
        });
        
        const optimizationResult = await this.optimizeSchema(
          userPrompt,
          currentSchema,
          materialSources,
          iterationCount - 1, // 传递从0开始的迭代计数
          progressCallback // 传递progressCallback以支持流式输出
        );
        
        const iterationData = {
          iterationNumber: iterationCount,
          completed: optimizationResult.completed,
          hasSchema: !!optimizationResult.schema,
          schemaSize: optimizationResult.schema ? JSON.stringify(optimizationResult.schema).length : 0,
          reasoning: optimizationResult.reason
        };
        
        iterationHistory.push(iterationData);
        
        progressCallback({
          ...iterationData,
          message: `第 ${iterationCount} 次迭代${optimizationResult.completed ? '完成' : '进行中'}`
        });
        
        if (optimizationResult.completed) {
          currentSchema = optimizationResult.schema;
          console.log(`✅ 第 ${iterationCount} 次迭代完成，停止优化`);
          break;
        }
        
        if (optimizationResult.schema) {
          currentSchema = optimizationResult.schema;
          console.log(`🔄 第 ${iterationCount} 次迭代完成，继续优化...`);
        }
      }
      
      // 6. 返回最终结果
      const finalResult = {
        completed: true,
        schema: currentSchema,
        selectedMaterials: selectionResult.selectedMaterials,
        iterations: iterationCount,
        iterationHistory: iterationHistory
      };
      
      progressCallback({
        iterationNumber: iterationCount,
        message: '所有迭代完成，页面生成成功',
        completed: true,
        hasSchema: !!currentSchema,
        schemaSize: currentSchema ? JSON.stringify(currentSchema).length : 0
      });
      
      console.log('🎉 [Material Selection Stream] 流程完成');
      return finalResult;
      
    } catch (error) {
      console.error('❌ [Material Selection Stream] 流程失败:', error);
      
      progressCallback({
        iterationNumber: 0,
        message: `生成失败: ${error.message}`,
        completed: false,
        error: true
      });
      
      throw error;
    }
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