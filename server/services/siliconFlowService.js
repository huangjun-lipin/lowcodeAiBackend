const axios = require('axios');
const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const Ajv = require('ajv');

class SiliconFlowService {
  constructor() {
    this.apiKey = process.env.SILICON_FLOW_API_KEY;
    this.baseURL = process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn';
    
    if (!this.apiKey) {
      console.warn('Silicon Flow API key not found. Please set SILICON_FLOW_API_KEY environment variable.');
    }

    // 直接使用axios而不是创建实例，避免配置问题
    this.client = axios;
    this.defaultConfig = {
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 900000, // 900秒超时（15分钟）
    };

    // 初始化JSON Schema验证器
    this.ajv = new Ajv({ allErrors: true });
    this.schemaValidator = this.ajv.compile({
      type: 'object',
      required: ['componentName', 'id', 'props', 'fileName', 'dataSource', 'state', 'lifeCycles', 'methods', 'children'],
      properties: {
        componentName: { 
          type: 'string',
          enum: ['Page'] // 页面schema必须是Page组件
        },
        id: { type: 'string' },
        props: { 
          type: 'object',
          required: ['ref'],
          properties: {
            ref: { type: 'string' },
            style: { type: 'object' }
          }
        },
        fileName: { type: 'string' },
        dataSource: {
          type: 'object',
          required: ['list'],
          properties: {
            list: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'id', 'options'],
                properties: {
                  type: { type: 'string' },
                  id: { type: 'string' },
                  isInit: { type: 'boolean' },
                  options: {
                    type: 'object',
                    required: ['method', 'uri'],
                    properties: {
                      method: { type: 'string' },
                      uri: { type: 'string' },
                      params: { type: 'object' },
                      headers: { type: 'object' },
                      timeout: { type: 'number' },
                      isCors: { type: 'boolean' }
                    }
                  },
                  shouldFetch: {
                    type: 'object',
                    required: ['type', 'value'],
                    properties: {
                      type: { enum: ['JSFunction'] },
                      value: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        state: {
          type: 'object',
          patternProperties: {
            ".*": {
              type: 'object',
              required: ['type', 'value'],
              properties: {
                type: { enum: ['JSExpression'] },
                value: { type: 'string' }
              }
            }
          }
        },
        css: { type: 'string' },
        lifeCycles: {
          type: 'object',
          patternProperties: {
            ".*": {
              type: 'object',
              required: ['type', 'value'],
              properties: {
                type: { enum: ['JSFunction'] },
                value: { type: 'string' }
              }
            }
          }
        },
        methods: {
          type: 'object',
          patternProperties: {
            ".*": {
              type: 'object',
              required: ['type', 'value'],
              properties: {
                type: { enum: ['JSFunction'] },
                value: { type: 'string' }
              }
            }
          }
        },
        // originCode 不是必需的，因为它在完整schema的根级别
        hidden: { type: 'boolean' },
        title: { type: 'string' },
        isLocked: { type: 'boolean' },
        condition: { type: 'boolean' },
        conditionGroup: { type: 'string' },
        children: { 
          type: 'array',
          items: {
            type: 'object',
            required: ['componentName', 'id'],
            properties: {
              componentName: { type: 'string' },
              id: { type: 'string' },
              props: { type: 'object' },
              children: { 
                oneOf: [
                  { type: 'string' },
                  { type: 'array' },
                  { type: 'object' }
                ]
              }
            },
            additionalProperties: true
          }
        }
      },
      additionalProperties: true
    });
  }

  /**
   * 读取所有组件文档内容
   */
  readAllDocsContent() {
    try {
      const materialsDir = path.join(__dirname, '..', 'materials');
      const fusionUIDir = path.join(materialsDir, 'fusion-ui');
      const fusionLowcodeDir = path.join(materialsDir, 'fusion-lowcode-materials');
      
      let allDocsContent = '';
      
      // 读取fusion-ui目录下的文档
      if (fs.existsSync(fusionUIDir)) {
        const fusionUIFiles = fs.readdirSync(fusionUIDir).filter(file => file.endsWith('.md'));
        allDocsContent += '\n## Fusion UI 组件文档\n\n';
        
        fusionUIFiles.forEach(file => {
          const filePath = path.join(fusionUIDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          allDocsContent += `### ${file}\n\n${content}\n\n---\n\n`;
        });
      }
      
      // 读取fusion-lowcode-materials目录下的文档
      if (fs.existsSync(fusionLowcodeDir)) {
        const fusionLowcodeFiles = fs.readdirSync(fusionLowcodeDir).filter(file => file.endsWith('.md'));
        allDocsContent += '\n## Fusion Lowcode Materials 组件文档\n\n';
        
        fusionLowcodeFiles.forEach(file => {
          const filePath = path.join(fusionLowcodeDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          allDocsContent += `### ${file}\n\n${content}\n\n---\n\n`;
        });
      }
      
      return allDocsContent;
    } catch (error) {
      console.error('读取组件文档失败:', error);
      return '';
    }
  }

  /**
   * 生成低代码schema的系统提示词
   */
  getSystemPrompt() {
    const docsContent = this.readAllDocsContent();
    
    return `你是一个专业的低代码平台AI助手，专门帮助用户生成符合阿里低代码引擎规范的完整页面schema。

你的任务是根据用户的自然语言描述，生成对应的低代码页面schema，包含完整的页面结构、数据源、状态管理、生命周期和方法定义。

## 🚨 重要：物料包使用规范
**必须严格遵守以下物料使用优先级：**
1. **优先使用fusion-ui物料包**：必须优先使用fusion-ui物料包中的组件，这些组件经过充分测试和优化
2. **严禁使用fusion-lowcode-materials**：严格禁止使用fusion-lowcode-materials包中的物料，除非fusion-ui组件包中确实没有对应功能的组件才可考虑
3. **组件选择原则**：在生成schema时，务必从fusion-ui文档中选择合适的组件，确保组件名称和属性配置的准确性

以下是完整的组件文档，包含每个组件的详细属性配置、使用方法和示例：

${docsContent}

## 重要：参考Demo示例

以下是两个完整的demo示例，展示了正确的schema结构和各字段之间的对应关系：

### Demo 1: 基础页面示例
\`\`\`json
{
  "componentName": "Page",
  "id": "node_dockcviv8fo1",
  "props": {
    "ref": "outerView",
    "style": {
      "height": "100%"
    }
  },
  "fileName": "/",
  "dataSource": {
    "list": [
      {
        "type": "fetch",
        "isInit": true,
        "options": {
          "params": {},
          "method": "GET",
          "isCors": true,
          "timeout": 5000,
          "headers": {},
          "uri": "mock/info.json"
        },
        "id": "info",
        "shouldFetch": {
           "type": "JSFunction",
           "value": "function() { \\\\n  console.log('should fetch.....');\\\\n  return true; \\\\n}"
         }
      }
    ]
  },
  "state": {
    "text": {
      "type": "JSExpression",
      "value": "\\"outer\\""
    },
    "isShowDialog": {
      "type": "JSExpression",
      "value": "false"
    }
  },
  "css": "body {\\n  font-size: 12px;\\n}\\n\\n.button {\\n  width: 100px;\\n  color: #ff00ff\\n}",
  "lifeCycles": {
    "componentDidMount": {
      "type": "JSFunction",
      "value": "function componentDidMount() {\\n  console.log('did mount');\\n}"
    },
    "componentWillUnmount": {
      "type": "JSFunction",
      "value": "function componentWillUnmount() {\\n  console.log('will unmount');\\n}"
    }
  },
  "methods": {
    "testFunc": {
      "type": "JSFunction",
      "value": "function testFunc() {\\n  console.log('test func');\\n}"
    },
    "onClick": {
      "type": "JSFunction",
      "value": "function onClick() {\\n  this.setState({\\n    isShowDialog: true\\n  });\\n}"
    },
    "closeDialog": {
      "type": "JSFunction",
      "value": "function closeDialog() {\\n  this.setState({\\n    isShowDialog: false\\n  });\\n}"
    }
  },
  "originCode": "class LowcodeComponent extends Component {\\\\n  state = {\\\\n    \\\\"text\\\\": \\\\"outer\\\\",\\\\n    \\\\"isShowDialog\\\\": false\\\\n  }\\\\n  componentDidMount() {\\\\n    console.log('did mount');\\\\n  }\\\\n  componentWillUnmount() {\\\\n    console.log('will unmount');\\\\n  }\\\\n  testFunc() {\\\\n    console.log('test func');\\\\n  }\\\\n  onClick() {\\\\n    this.setState({\\\\n      isShowDialog: true\\\\n    });\\\\n  }\\\\n  closeDialog() {\\\\n    this.setState({\\\\n      isShowDialog: false\\\\n    });\\\\n  }\\\\n}",
  "hidden": false,
  "title": "",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "children": []
}
\`\`\`

### Demo 2: 扩展功能示例
\`\`\`json
{
  "componentName": "Page",
  "id": "node_dockcviv8fo1",
  "props": {
    "ref": "outerView",
    "style": {
      "height": "100%"
    }
  },
  "fileName": "/",
  "dataSource": {
    "list": [
      {
        "type": "fetch",
        "isInit": true,
        "options": {
          "params": {},
          "method": "GET",
          "isCors": true,
          "timeout": 5000,
          "headers": {},
          "uri": "mock/info.json"
        },
        "id": "info",
        "shouldFetch": {
           "type": "JSFunction",
           "value": "function() { \\\\n  console.log('should fetch.....');\\\\n  return true; \\\\n}"
         }
      }
    ]
  },
  "state": {
    "text": {
      "type": "JSExpression",
      "value": "\\"outer\\""
    },
    "isShowDialog": {
      "type": "JSExpression",
      "value": "false"
    }
  },
  "css": "body {\\n  font-size: 12px;\\n}\\n\\n.button {\\n  width: 100px;\\n  color: #ff00ff\\n}",
  "lifeCycles": {
    "componentDidMount": {
      "type": "JSFunction",
      "value": "function componentDidMount() {\\n  console.log('did mount');\\n}"
    },
    "componentWillUnmount": {
      "type": "JSFunction",
      "value": "function componentWillUnmount() {\\n  console.log('will unmount');\\n}"
    }
  },
  "methods": {
    "testFunc": {
      "type": "JSFunction",
      "value": "function testFunc() {\\n  console.log('test func');\\n}"
    },
    "onClick": {
      "type": "JSFunction",
      "value": "function onClick() {\\n  this.setState({\\n  isShowDialog: true\\n  });\\n}"
    },
    "closeDialog": {
      "type": "JSFunction",
      "value": "function closeDialog() {\\n  this.setState({\\n  isShowDialog: false\\n  });\\n}"
    },
    "getHelloWorldText": {
      "type": "JSFunction",
      "value": "function getHelloWorldText() {\\n  return this.i18n('i18n-jwg27yo4');\\n}"
    },
    "getHelloWorldText2": {
      "type": "JSFunction",
      "value": "function getHelloWorldText2() {\\n  return this.i18n('i18n-jwg27yo3', {\\n  name: '絮黎'\\n  });\\n}"
    },
    "onTestConstantsButtonClicked": {
      "type": "JSFunction",
      "value": "function onTestConstantsButtonClicked() {\\n  console.log('constants.ConstantA:', this.constants.ConstantA);\\n  console.log('constants.ConstantB:', this.constants.ConstantB);\\n}"
    },
    "onTestUtilsButtonClicked": {
      "type": "JSFunction",
      "value": "function onTestUtilsButtonClicked() {\\n  this.utils.demoUtil('param1', 'param2');\\n}"
    }
  },
  "originCode": "class LowcodeComponent extends Component {\\\\n  state = {\\\\n    \\\\"text\\\\": \\\\"outer\\\\",\\\\n    \\\\"isShowDialog\\\\": false\\\\n  }\\\\n  componentDidMount() {\\\\n    console.log('did mount');\\\\n  }\\\\n  componentWillUnmount() {\\\\n    console.log('will unmount');\\\\n  }\\\\n  testFunc() {\\\\n    console.log('test func');\\\\n  }\\\\n  onClick() {\\\\n    this.setState({\\\\n      isShowDialog: true\\\\n    });\\\\n  }\\\\n  closeDialog() {\\\\n    this.setState({\\\\n      isShowDialog: false\\\\n    });\\\\n  }\\\\n  getHelloWorldText() {\\\\n    return this.i18n('i18n-jwg27yo4');\\\\n  }\\\\n  getHelloWorldText2() {\\\\n    return this.i18n('i18n-jwg27yo3', {\\\\n      name: '絮黎',\\\\n    });\\\\n  }\\\\n  onTestConstantsButtonClicked() {\\\\n    console.log('constants.ConstantA:', this.constants.ConstantA);\\\\n    console.log('constants.ConstantB:', this.constants.ConstantB);\\\\n\\\\t}\\\\n\\\\tonTestUtilsButtonClicked(){\\\\n    this.utils.demoUtil('param1', 'param2');\\\\n\\\\t}\\\\n}",
  "hidden": false,
  "title": "",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "children": []
}
\`\`\`

## 核心字段说明和对应关系

### 1. dataSource（数据源定义）
- **作用**：定义页面需要的接口调用和数据获取逻辑
- **结构**：包含list数组，每个数据源有type、id、options、shouldFetch等属性
- **示例**：用于获取用户信息、列表数据、表单提交等接口调用

### 2. state（页面状态变量）
- **作用**：定义页面绑定的响应式变量
- **格式**：每个变量都是 {"type": "JSExpression", "value": "初始值"} 格式
- **对应关系**：必须与originCode中的state完全一致

### 3. lifeCycles（生命周期函数）
- **作用**：定义组件的生命周期钩子函数
- **格式**：每个生命周期都是 {"type": "JSFunction", "value": "function名() {...}"} 格式
- **对应关系**：必须与originCode中的生命周期方法完全一致

### 4. methods（页面方法）
- **作用**：定义页面绑定的函数方法
- **格式**：每个方法都是 {"type": "JSFunction", "value": "function名() {...}"} 格式
- **对应关系**：必须与originCode中的方法完全一致

### 5. originCode（JS面板代码）
- **作用**：包含完整的React组件类定义
- **结构**：class LowcodeComponent extends Component，包含state、生命周期、方法
- **关键要求**：必须与上述state、lifeCycles、methods字段完全对应

## 严格的对应关系要求

 **state字段与originCode的state对应：**
 - schema中：\`"text": {"type": "JSExpression", "value": "\\\\"outer\\\\""}\`
 - originCode中：\`state = { "text": "outer" }\`

 **lifeCycles字段与originCode的生命周期对应：**
 - schema中：\`"componentDidMount": {"type": "JSFunction", "value": "function componentDidMount() {...}"}\`
 - originCode中：\`componentDidMount() {...}\`

 **methods字段与originCode的方法对应：**
 - schema中：\`"onClick": {"type": "JSFunction", "value": "function onClick() {...}"}\`
 - originCode中：\`onClick() {...}\`

请严格按照以下完整的JSON格式返回schema，不要包含任何其他文字说明：

{
  "componentName": "Page",
  "id": "唯一页面ID",
  "props": {
    "ref": "页面引用名",
    "style": {
      "height": "100%"
    }
  },
  "fileName": "/",
  "dataSource": {
    "list": [
      {
        "type": "fetch",
        "isInit": true,
        "options": {
          "params": {},
          "method": "GET",
          "isCors": true,
          "timeout": 5000,
          "headers": {},
          "uri": "接口地址"
        },
        "id": "数据源ID",
        "shouldFetch": {
          "type": "JSFunction",
          "value": "function() { return true; }"
        }
      }
    ]
  },
  "state": {
    "变量名": {
      "type": "JSExpression",
      "value": "初始值"
    }
  },
  "css": "页面样式定义",
  "lifeCycles": {
    "componentDidMount": {
      "type": "JSFunction",
      "value": "function componentDidMount() { // 组件挂载后执行 }"
    },
    "componentWillUnmount": {
      "type": "JSFunction",
      "value": "function componentWillUnmount() { // 组件卸载前执行 }"
    }
  },
  "methods": {
    "方法名": {
      "type": "JSFunction",
      "value": "function 方法名() { // 方法实现 }"
    }
  },
  "originCode": "class LowcodeComponent extends Component {\\n  state = {\\n    // 这里的state要与上面state字段完全对应\\n  }\\n  componentDidMount() {\\n    // 这里的生命周期要与上面lifeCycles字段完全对应\\n  }\\n  componentWillUnmount() {\\n    // 这里的生命周期要与上面lifeCycles字段完全对应\\n  }\\n  // 这里的方法要与上面methods字段完全对应\\n}",
  "hidden": false,
  "title": "",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "children": [
    // 页面子组件数组
  ]
}

重要注意事项：
1. **完整性要求**：必须包含所有字段：componentName、id、props、fileName、dataSource、state、css、lifeCycles、methods、originCode、children等
2. **数据源定义**：dataSource.list数组中定义页面需要的接口调用，包含完整的请求配置
3. **状态管理**：state字段定义页面绑定的变量，格式为 {"变量名": {"type": "JSExpression", "value": "初始值"}}
4. **生命周期**：lifeCycles定义组件的生命周期函数，如componentDidMount、componentWillUnmount等
5. **方法定义**：methods定义页面绑定的函数，格式为 {"方法名": {"type": "JSFunction", "value": "function 方法名() {...}"}}
6. **代码一致性**：originCode中的JavaScript代码必须与state、lifeCycles、methods中定义的内容完全对应
7. **组件规范**：
   - **优先使用Fusion UI物料包**：必须优先使用fusion-ui物料包中的组件，这些组件经过充分测试和优化
   - **严禁使用fusion-lowcode-materials**：严格禁止使用fusion-lowcode-materials包中的物料，除非fusion-ui组件包中确实没有对应功能的组件才可考虑
   - **组件名称准确性**：子组件必须使用文档中定义的准确组件名称和属性
8. **ID唯一性**：每个组件必须有唯一的id，格式如 "node_" + 时间戳 + 随机字符
9. **布局优先**：对于布局类需求，优先使用NextRow和NextCol进行栅格布局
10. **表单处理**：表单组件要合理设置label、placeholder、validation等属性

根据用户需求类型，生成对应的dataSource和methods：
- **登录页面**：包含登录接口调用、表单验证方法
- **列表页面**：包含数据查询接口、分页方法、搜索方法
- **详情页面**：包含详情查询接口、编辑保存方法
- **表单页面**：包含提交接口、表单验证方法

现在请根据用户需求生成对应的完整页面schema。`;
  }

  /**
   * 调用DeepSeek API生成schema
   * @param {string} userPrompt 用户输入的需求描述
   * @param {object} context 上下文信息（可选）
   * @returns {Promise<object>} 生成的schema
   */
  async generateSchema(userPrompt, context = {}) {
    try {
      // 记录API调用开始时间
      const apiStartTime = Date.now();
      console.log('🚀 开始调用大模型API...');
      
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      // 如果有上下文信息，添加到消息中
      if (context.currentSchema) {
        messages.splice(1, 0, {
          role: 'user',
          content: `当前页面已有的schema结构：${JSON.stringify(context.currentSchema, null, 2)}`
        });
      }

      const response = await this.client.post('/v1/chat/completions', {
        model: 'deepseek-ai/DeepSeek-V3',
        messages: messages,
        temperature: 0.3,
        max_tokens: 32000, // 设置为合理的tokens数量，避免超出限制
        stream: false
      }, this.defaultConfig);

      // 记录API调用结束时间
      const apiEndTime = Date.now();
      const apiCallDuration = apiEndTime - apiStartTime;
      console.log(`🕒 大模型API调用耗时: ${apiCallDuration}ms`);

      const content = response.data.choices[0].message.content;
      
      // 使用增强的JSON解析逻辑
      const parsedResult = this.parseComplexSchema(content);
      console.log('解析结果:', JSON.stringify(parsedResult, null, 2));
      
      // 检查是否是完整的低代码引擎schema格式
      let schema;
      let originCodeFromFullSchema = null;
      
      if (parsedResult.componentsTree && Array.isArray(parsedResult.componentsTree) && parsedResult.componentsTree.length > 0) {
        // 这是完整的低代码引擎schema，提取第一个组件作为页面schema
        schema = parsedResult.componentsTree[0];
        originCodeFromFullSchema = parsedResult.originCode; // 保存完整schema中的originCode
        console.log('检测到完整低代码引擎schema，提取页面组件');
      } else if (parsedResult.componentName) {
        // 这是单个组件schema
        schema = parsedResult;
        console.log('检测到单个组件schema');
      } else {
        // 直接返回解析结果，不进行格式验证
        schema = parsedResult;
        console.log('返回原始解析结果，跳过格式验证');
      }

      // 跳过schema验证，直接返回结果
      console.log('⚠️ 已跳过schema结构验证');

      // 跳过originCode一致性验证
      console.log('⚠️ 已跳过originCode一致性验证');

      // 确保有ID（如果schema是对象且没有ID）
      if (schema && typeof schema === 'object' && !schema.id) {
        schema.id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      console.log('✅ Schema生成完成，已跳过所有验证');
      return schema;

    } catch (error) {
      console.error('🚨 Silicon Flow API调用失败:');
      console.error('📄 请求配置:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        headers: error.config?.headers ? {
          ...error.config.headers,
          Authorization: error.config.headers.Authorization ? '[HIDDEN]' : undefined
        } : undefined
      });
      
      if (error.response) {
        // API返回了错误响应
        console.error('📊 响应信息:');
        console.error('- 状态码:', error.response.status);
        console.error('- 状态文本:', error.response.statusText);
        console.error('- 响应头:', error.response.headers);
        console.error('- 响应数据:', error.response.data);
        
        const errorMessage = error.response.data?.error?.message || 
                           error.response.data?.message || 
                           JSON.stringify(error.response.data) || 
                           '未知错误';
        throw new Error(`Silicon Flow API错误: ${error.response.status} - ${errorMessage}`);
      } else if (error.request) {
        // 请求发送失败
        console.error('🌐 网络请求信息:');
        console.error('- 错误类型:', error.code || 'UNKNOWN');
        console.error('- 错误消息:', error.message);
        console.error('- 请求超时:', error.config?.timeout);
        console.error('- 目标地址:', error.config?.baseURL + error.config?.url);
        
        throw new Error(`无法连接到Silicon Flow API服务: ${error.message}`);
      } else {
        // 其他错误
        console.error('❓ 其他错误:', error.message);
        throw error;
      }
    }
  }

  /**
   * 获取可用的物料组件列表
   * @returns {Array} 组件列表
   */
  getAvailableMaterials() {
    try {
      const materialsDir = path.join(__dirname, '..', 'materials');
      const fusionUIDir = path.join(materialsDir, 'fusion-ui');
      const fusionLowcodeDir = path.join(materialsDir, 'fusion-lowcode-materials');
      
      const components = [];
      
      // 读取fusion-ui目录下的组件
      if (fs.existsSync(fusionUIDir)) {
        const fusionUIFiles = fs.readdirSync(fusionUIDir).filter(file => file.endsWith('.md'));
        fusionUIFiles.forEach(file => {
          const componentName = file.replace('.md', '');
          components.push({
            name: componentName,
            category: 'fusion-ui',
            file: file
          });
        });
      }
      
      // 读取fusion-lowcode-materials目录下的组件
      if (fs.existsSync(fusionLowcodeDir)) {
        const fusionLowcodeFiles = fs.readdirSync(fusionLowcodeDir).filter(file => file.endsWith('.md'));
        fusionLowcodeFiles.forEach(file => {
          const componentName = file.replace('.md', '');
          components.push({
            name: componentName,
            category: 'fusion-lowcode-materials',
            file: file
          });
        });
      }
      
      return components;
    } catch (error) {
      console.error('获取组件列表失败:', error);
      // 返回默认组件列表作为备用
      return [
        'NextButton',
        'NextInput',
        'NextForm',
        'NextFormItem',
        'NextTable',
        'NextDialog',
        'NextSelect',
        'NextDatePicker',
        'NextCheckbox',
        'NextRadio',
        'NextSwitch',
        'NextUpload',
        'NextCard',
        'NextTabs',
        'NextCollapse',
        'NextBreadcrumb',
        'NextPagination',
        'NextRow',
        'NextCol',
        'NextBox'
      ];
    }
  }

  /**
   * 解析复杂的Schema格式，支持JSON5、带注释的JSON等
   * @param {string} content - AI返回的原始内容
   * @returns {Object} 解析后的schema对象
   */
  parseComplexSchema(content) {
    // 清理内容，移除可能的markdown格式
    let cleanContent = content.trim();
    
    // 提取代码块中的内容
    const codeBlockMatch = cleanContent.match(/```(?:json5?|javascript)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleanContent = codeBlockMatch[1].trim();
    }
    
    // 如果没有代码块，尝试提取JSON对象
    if (!codeBlockMatch) {
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
    }

    // 尝试多种解析方式
    const parsers = [
      // 1. 标准JSON解析
      () => JSON.parse(cleanContent),
      
      // 2. JSON5解析（支持注释、尾随逗号等）
      () => JSON5.parse(cleanContent),
      
      // 3. 移除注释后的JSON解析
      () => {
        const withoutComments = cleanContent
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
          .replace(/\/\/.*$/gm, '') // 移除行注释
          .replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
        return JSON.parse(withoutComments);
      },
      
      // 4. 宽松的JSON5解析（处理更多边缘情况）
      () => {
        let relaxedContent = cleanContent
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // 为属性名添加引号
          .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2') // 为字符串值添加引号
          .replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
        return JSON5.parse(relaxedContent);
      }
    ];

    let lastError;
     for (const parser of parsers) {
       try {
         const result = parser();
         if (result && typeof result === 'object') {
           console.log(`✅ Schema解析成功，使用解析器 ${parsers.indexOf(parser) + 1}/${parsers.length}`);
           return result;
         }
       } catch (error) {
         console.log(`❌ 解析器 ${parsers.indexOf(parser) + 1} 失败:`, error.message);
         lastError = error;
         continue;
       }
     }

     // 所有解析方式都失败，提供详细的错误信息
     console.error('🚨 Schema解析完全失败');
     console.error('📄 原始内容 (前200字符):', content.substring(0, 200));
     console.error('🧹 清理后内容 (前200字符):', cleanContent.substring(0, 200));
     console.error('💥 最后一个错误:', lastError?.message);
     
     // 提供更有用的错误信息
     let errorHint = '';
     if (cleanContent.includes('```')) {
       errorHint = '检测到代码块标记，但可能格式不正确';
     } else if (cleanContent.includes('//') || cleanContent.includes('/*')) {
       errorHint = '检测到注释，但JSON5解析失败';
     } else if (cleanContent.includes('{') && cleanContent.includes('}')) {
       errorHint = '检测到JSON结构，但语法可能有误';
     } else {
       errorHint = '未检测到有效的JSON结构';
     }
     
     throw new Error(`无法解析AI返回的schema格式 (${errorHint}): ${lastError?.message || '未知错误'}`);
  }

  /**
   * 健康检查
   * @returns {Promise<boolean>} API是否可用
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/v1/models');
      return response.status === 200;
    } catch (error) {
      console.error('DeepSeek API健康检查失败:', error.message);
      return false;
    }
  }

  /**
   * 验证originCode与schema其他部分的一致性
   * @param {Object} schema - 生成的schema对象
   * @param {string} originCode - 完整schema中的originCode
   * @returns {Object} 验证结果
   */
  validateOriginCodeConsistency(schema, originCode = null) {
    const errors = [];
    
    // 如果没有传入originCode，尝试从schema中获取
    const codeToCheck = originCode || schema.originCode;
    
    if (!codeToCheck) {
      errors.push('originCode不能为空');
      return { valid: false, errors };
    }

    // 验证state定义是否在originCode中存在
    if (schema.state) {
      Object.keys(schema.state).forEach(stateKey => {
        if (!codeToCheck.includes(stateKey)) {
          errors.push(`state中定义的变量 "${stateKey}" 在originCode中未找到`);
        }
      });
    }

    // 验证methods定义是否在originCode中存在
    if (schema.methods) {
      Object.keys(schema.methods).forEach(methodKey => {
        if (!codeToCheck.includes(methodKey)) {
          errors.push(`methods中定义的方法 "${methodKey}" 在originCode中未找到`);
        }
      });
    }

    // 验证lifeCycles定义是否在originCode中存在
    if (schema.lifeCycles) {
      Object.keys(schema.lifeCycles).forEach(lifecycleKey => {
        if (!codeToCheck.includes(lifecycleKey)) {
          errors.push(`lifeCycles中定义的生命周期 "${lifecycleKey}" 在originCode中未找到`);
        }
      });
    }

    // 验证originCode是否包含必要的类结构
    if (!codeToCheck.includes('class LowcodeComponent')) {
      errors.push('originCode必须包含LowcodeComponent类定义');
    }

    if (!codeToCheck.includes('constructor(props)')) {
      errors.push('originCode必须包含constructor方法');
    }

    if (!codeToCheck.includes('this.state')) {
      errors.push('originCode必须包含state初始化');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = SiliconFlowService;