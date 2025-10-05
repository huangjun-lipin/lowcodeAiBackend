const axios = require('axios');
const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const Ajv = require('ajv');
const { jsonrepair } = require('jsonrepair');

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

    // 初始化日志目录
    this.logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // 添加物料源码缓存
    this.sourceCodeCache = new Map();
    
    // 初始化物料路径
    this.materialPaths = {
      fusionUI: path.join(__dirname, '..', 'materials', 'fusion-ui'),
      fusionLowcodeMaterials: path.join(__dirname, '..', 'materials', 'fusion-lowcode-materials')
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
  /**
   * 查找物料源码文件
   * @param {string} componentName 组件名称
   * @param {string} libraryName 物料库名称
   * @returns {string|null} 源码文件路径
   */
  findSourceCodeFile(componentName, libraryName) {
    try {
      const materialsDir = path.join(__dirname, '..', 'materials');
      const libraryDir = path.join(materialsDir, libraryName);
      
      // 可能的源码文件路径
      const possiblePaths = [
        path.join(libraryDir, 'src', `${componentName}.js`),
        path.join(libraryDir, 'src', `${componentName}.jsx`),
        path.join(libraryDir, 'src', `${componentName}.ts`),
        path.join(libraryDir, 'src', `${componentName}.tsx`),
        path.join(libraryDir, 'src', componentName, 'index.js'),
        path.join(libraryDir, 'src', componentName, 'index.jsx'),
        path.join(libraryDir, 'src', componentName, 'index.ts'),
        path.join(libraryDir, 'src', componentName, 'index.tsx'),
        path.join(libraryDir, 'src', componentName, `${componentName}.js`),
        path.join(libraryDir, 'src', componentName, `${componentName}.jsx`),
        path.join(libraryDir, 'src', componentName, `${componentName}.ts`),
        path.join(libraryDir, 'src', componentName, `${componentName}.tsx`),
        path.join(libraryDir, `${componentName}.js`),
        path.join(libraryDir, `${componentName}.jsx`),
        path.join(libraryDir, `${componentName}.ts`),
        path.join(libraryDir, `${componentName}.tsx`)
      ];
      
      // 查找第一个存在的文件
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`查找 ${componentName} 源码文件失败:`, error);
      return null;
    }
  }

  readAllDocsContent() {
    try {
      const materialsDir = path.join(__dirname, '..', 'materials');
      const fusionUIDir = path.join(materialsDir, 'fusion-ui');
      const fusionLowcodeDir = path.join(materialsDir, 'fusion-lowcode-materials');
      
      let allDocsContent = '';
      
      // 读取fusion-ui目录下的文档和源码
      if (fs.existsSync(fusionUIDir)) {
        const fusionUIFiles = fs.readdirSync(fusionUIDir).filter(file => file.endsWith('.md'));
        allDocsContent += '\n## Fusion UI 组件文档和源码\n\n';
        
        fusionUIFiles.forEach(file => {
          const filePath = path.join(fusionUIDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          allDocsContent += `### ${file}\n\n${content}\n\n`;
          
          // 尝试读取对应的源码文件
          const componentName = file.replace('.md', '');
          const sourceCodePath = this.findSourceCodeFile(componentName, 'fusion-ui');
          if (sourceCodePath) {
            try {
              const sourceCode = fs.readFileSync(sourceCodePath, 'utf-8');
              allDocsContent += `#### ${componentName} 源码实现\n\n\`\`\`javascript\n${sourceCode}\n\`\`\`\n\n`;
            } catch (sourceError) {
              console.warn(`读取 ${componentName} 源码失败:`, sourceError.message);
            }
          }
          
          allDocsContent += '---\n\n';
        });
      }
      
      // 读取fusion-lowcode-materials目录下的文档和源码
      if (fs.existsSync(fusionLowcodeDir)) {
        const fusionLowcodeFiles = fs.readdirSync(fusionLowcodeDir).filter(file => file.endsWith('.md'));
        allDocsContent += '\n## Fusion Lowcode Materials 组件文档和源码\n\n';
        
        fusionLowcodeFiles.forEach(file => {
          const filePath = path.join(fusionLowcodeDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          allDocsContent += `### ${file}\n\n${content}\n\n`;
          
          // 尝试读取对应的源码文件
          const componentName = file.replace('.md', '');
          const sourceCodePath = this.findSourceCodeFile(componentName, 'fusion-lowcode-materials');
          if (sourceCodePath) {
            try {
              const sourceCode = fs.readFileSync(sourceCodePath, 'utf-8');
              allDocsContent += `#### ${componentName} 源码实现\n\n\`\`\`javascript\n${sourceCode}\n\`\`\`\n\n`;
            } catch (sourceError) {
              console.warn(`读取 ${componentName} 源码失败:`, sourceError.message);
            }
          }
          
          allDocsContent += '---\n\n';
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

🚨🚨🚨 输出格式要求 🚨🚨🚨

你必须严格按照以下JSON格式输出，不能有任何遗漏：

\`\`\`json
{
  "componentName": "Page",
  "id": "page_unique_id",
  "props": {
    "ref": "outerView",
    "style": {}
  },
  "fileName": "页面文件名",
  "dataSource": {
    "list": [
      {
        "type": "fetch",
        "id": "urlParams",
        "isInit": true,
        "options": {
          "method": "GET",
          "uri": "/api/data",
          "params": {},
          "headers": {},
          "timeout": 5000,
          "isCors": true
        },
        "shouldFetch": {
          "type": "JSFunction",
          "value": "function() { return true; }"
        }
      }
    ]
  },
  "state": {
    "text": {
      "type": "JSExpression",
      "value": "'hello world'"
    }
  },
  "css": "body { margin: 0; }",
  "lifeCycles": {
    "componentDidMount": {
      "type": "JSFunction",
      "value": "function componentDidMount() { console.log('页面加载完成'); }"
    }
  },
  "methods": {
    "handleClick": {
      "type": "JSFunction",
      "value": "function handleClick() { console.log('点击事件'); }"
    }
  },
  "originCode": "import React, { Component } from 'react'; class Page extends Component { render() { return <div>页面内容</div>; } } export default Page;",
  "hidden": false,
  "title": "页面标题",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "children": [
    // 这里放置子组件数组
  ]
}
\`\`\`

🚨 重要提醒：
1. 你必须生成上述完整的JSON对象，不能只生成children数组
2. 每个字段都必须存在，不能遗漏任何一个
3. 如果你只返回children数组或部分字段，这将被视为错误
4. 你的整个响应必须是一个完整的、可解析的JSON对象

## 🚨 核心要求：生成完整可用的页面
**必须确保生成的页面具备以下特性：**
1. **完整的模拟数据**：在state中生成充足的模拟数据，确保页面有内容展示
2. **完整的交互逻辑**：所有按钮、输入框、选择器都必须有对应的事件处理方法
3. **完整的状态管理**：包含所有必要的状态变量和状态更新逻辑
4. **完整的方法实现**：每个交互操作都要有完整的方法实现，不能只是空函数
5. **事件绑定完整**：所有组件的事件属性都要正确绑定到对应的方法

## 🚨 重要：物料包使用规范
**必须严格遵守以下物料使用优先级：**
1. **优先使用fusion-ui物料包**：必须优先使用fusion-ui物料包中的组件，这些组件经过充分测试和优化
2. **严禁使用fusion-lowcode-materials**：严格禁止使用fusion-lowcode-materials包中的任何物料，必须仅使用fusion-ui组件包中的组件
3. **组件选择原则**：在生成schema时，务必从fusion-ui文档中选择合适的组件，确保组件名称和属性配置的准确性

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

🚨🚨🚨 必须返回完整的JSON对象，包含所有字段 🚨🚨🚨

{
  "componentName": "Page",
  "id": "node_" + 时间戳 + 随机字符,
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
          "uri": "mock/data.json"
        },
        "id": "dataSourceId",
        "shouldFetch": {
          "type": "JSFunction",
          "value": "function() { return true; }"
        }
      }
    ]
  },
  "state": {
    "loading": {
      "type": "JSExpression",
      "value": "false"
    },
    "data": {
      "type": "JSExpression", 
      "value": "[]"
    }
  },
  "css": "body { font-size: 12px; }",
  "lifeCycles": {
    "componentDidMount": {
      "type": "JSFunction",
      "value": "function componentDidMount() { console.log('页面已挂载'); }"
    },
    "componentWillUnmount": {
      "type": "JSFunction",
      "value": "function componentWillUnmount() { console.log('页面将卸载'); }"
    }
  },
  "methods": {
    "handleClick": {
      "type": "JSFunction",
      "value": "function handleClick() { console.log('按钮被点击'); }"
    }
  },
  "originCode": "class LowcodeComponent extends Component { state = { loading: false, data: [] }; componentDidMount() { console.log('页面已挂载'); } componentWillUnmount() { console.log('页面将卸载'); } handleClick() { console.log('按钮被点击'); } render() { return <div>页面内容</div>; } }",
  "hidden": false,
  "title": "",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "children": [
    // 这里放置子组件数组
  ]
}

🚨 重要提醒：你的响应必须是一个完整的JSON对象，包含上述所有字段！🚨

## 🚨 强制要求：必须生成完整的功能实现
**以下要求必须严格执行，不允许生成空的或不完整的实现：**

### 1. 状态管理强制要求
- **必须在state中定义所有必要的状态变量**，包括：
  - 数据列表（如productList、userList等）
  - 搜索关键词（如searchKeyword）
  - 筛选条件（如filterConditions）
  - 分页信息（如pagination）
  - 加载状态（如loading）
- **必须为每个状态变量提供合理的初始值**，特别是数据列表必须包含至少3-5条模拟数据

### 2. 方法实现强制要求
- **必须为每个交互操作提供完整的方法实现**，不允许空函数
- **搜索功能**：必须实现完整的搜索逻辑，包括关键词匹配和结果更新
- **筛选功能**：必须实现完整的筛选逻辑，包括条件判断和结果过滤
- **分页功能**：必须实现完整的分页逻辑，包括页码切换和数据更新
- **表单处理**：必须实现完整的表单提交、验证和重置逻辑

### 3. 事件绑定强制要求
- **所有按钮必须绑定onClick事件**
- **所有输入框必须绑定onChange事件**
- **所有选择器必须绑定onChange事件**
- **所有表格必须绑定相关的操作事件**

### 4. 生命周期强制要求
- **必须在componentDidMount中初始化数据**
- **必须包含数据加载逻辑**
- **必须处理异步操作的状态更新**

重要注意事项：
1. **完整性要求**：必须包含所有字段：componentName、id、props、fileName、dataSource、state、css、lifeCycles、methods、originCode、children等
   - **componentName必须固定为"Page"**，不能使用其他值如"LowcodeComponent"
2. **数据源定义**：dataSource.list数组中定义页面需要的接口调用，包含完整的请求配置
3. **状态管理**：state字段定义页面绑定的变量，格式为 {"变量名": {"type": "JSExpression", "value": "初始值"}}
4. **生命周期**：lifeCycles定义组件的生命周期函数，如componentDidMount、componentWillUnmount等
5. **方法定义**：methods定义页面绑定的函数，格式为 {"方法名": {"type": "JSFunction", "value": "function 方法名() {...}"}}
6. **代码一致性**：originCode中的JavaScript代码必须与state、lifeCycles、methods中定义的内容完全对应
7. **组件规范**：
   - **优先使用Fusion UI物料包**：必须优先使用fusion-ui物料包中的组件，这些组件经过充分测试和优化
   - **严禁使用fusion-lowcode-materials**：严格禁止使用fusion-lowcode-materials包中的任何物料，必须仅使用fusion-ui组件包中的组件
   - **组件名称准确性**：子组件必须使用文档中定义的准确组件名称和属性
8. **ID唯一性**：每个组件必须有唯一的id，格式如 "node_" + 时间戳 + 随机字符
9. **布局优先**：对于布局类需求，优先使用NextRow和NextCol进行栅格布局
10. **表单处理**：表单组件要合理设置label、placeholder、validation等属性

根据用户需求类型，生成对应的dataSource和methods：
- **登录页面**：包含登录接口调用、表单验证方法
- **列表页面**：包含数据查询接口、分页方法、搜索方法
- **详情页面**：包含详情查询接口、编辑保存方法
- **表单页面**：包含提交接口、表单验证方法

## 🎯 重要：完整功能实现要求

**必须确保生成的页面具备完整的功能性，用户只需添加真实接口即可直接使用：**

### 1. 动态数据生成要求
- **模拟数据完整性**：如果页面没有真实接口，必须在state中生成完整的模拟数据
- **数据结构合理性**：模拟数据的结构要符合实际业务场景，包含足够的字段和数据量
- **数据类型多样性**：包含字符串、数字、布尔值、数组、对象等多种数据类型
- **列表数据充实**：对于表格、列表组件，至少生成5-10条模拟数据记录
- **分页数据支持**：为分页组件提供总数、当前页、每页条数等完整的分页信息

### 2. 组件间交互逻辑处理
- **表单交互**：表单组件要能正确响应用户输入，包含验证、提交、重置等功能
- **列表操作**：列表组件要支持增删改查操作，每个操作都要有对应的方法实现
- **分页功能**：分页组件要能正确响应页码变化，更新列表数据显示
- **搜索筛选**：搜索组件要能根据输入条件筛选数据并更新显示
- **弹窗交互**：弹窗的打开、关闭、确认、取消等操作要有完整的状态管理
- **按钮响应**：所有按钮都要有对应的点击事件处理方法

### 3. 状态管理完整性
- **页面状态**：定义页面所需的所有状态变量，包含加载状态、错误状态、数据状态等
- **表单状态**：表单的验证状态、提交状态、字段值状态等
- **列表状态**：当前页码、每页条数、总条数、选中项等状态
- **交互状态**：弹窗显示状态、按钮禁用状态、加载状态等

### 4. 方法实现完整性
- **数据操作方法**：增删改查的完整实现，包含成功和失败的处理逻辑
- **表单处理方法**：表单提交、验证、重置等方法的完整实现
- **分页处理方法**：页码变化、每页条数变化的处理方法
- **搜索处理方法**：搜索条件变化、搜索执行的处理方法
- **筛选处理方法**：筛选条件变化、筛选执行的处理方法

### 5. 用户体验优化
- **加载状态**：为异步操作添加loading状态提示
- **错误处理**：为可能失败的操作添加错误提示和处理
- **成功反馈**：为成功操作添加成功提示信息
- **数据验证**：为表单输入添加合理的验证规则
- **确认提示**：为删除等危险操作添加确认提示

**最终目标：生成的页面应该是一个完整的、可交互的、功能齐全的原型，用户只需要将接口地址替换为真实接口即可投入使用。**

## 📋 具体实现要求

### 商品列表页面必须包含：
1. **完整的模拟数据**：在state中至少包含5-10条商品数据，每条数据包含id、name、price、category、stock等字段
2. **搜索功能**：包含搜索关键词状态、搜索方法、搜索结果筛选逻辑
3. **筛选功能**：包含分类筛选状态、筛选方法、筛选结果更新逻辑
4. **分页功能**：包含当前页码、每页条数、总条数状态和分页切换方法
5. **事件绑定**：所有输入框、按钮、选择器都要绑定对应的事件处理方法

### 表单页面必须包含：
1. **表单数据状态**：包含所有表单字段的初始值和当前值
2. **验证状态**：包含错误信息状态和验证方法
3. **提交状态**：包含提交中状态和提交成功/失败处理
4. **字段变更方法**：每个表单字段都要有对应的变更处理方法
5. **完整验证逻辑**：包含必填验证、格式验证等完整的验证规则

### 数据展示页面必须包含：
1. **数据加载状态**：包含loading状态和数据获取方法
2. **数据展示逻辑**：包含数据格式化、条件显示等逻辑
3. **交互操作**：包含编辑、删除、查看详情等操作方法
4. **状态更新**：操作后的状态更新和界面刷新逻辑

**重要提醒：每个生成的页面都必须具备完整的功能性和交互性，确保用户可以直接使用！**
- **表单处理方法**：表单验证、提交、重置等方法的完整实现
- **分页处理方法**：页码变化、每页条数变化的处理方法
- **搜索处理方法**：搜索条件变化、搜索执行的处理方法
- **状态更新方法**：各种状态变化的处理方法

### 5. 用户体验优化
- **加载状态**：为异步操作添加加载状态提示
- **错误处理**：为可能出错的操作添加错误处理和提示
- **成功反馈**：为用户操作添加成功反馈提示
- **数据验证**：为表单输入添加合理的验证规则
- **操作确认**：为删除等危险操作添加确认提示

**目标：生成的页面应该是一个功能完整、交互流畅的原型，用户只需要将模拟数据替换为真实接口调用即可投入使用。**

🚨 **重要格式要求：**
1. **JSFunction类型格式**：必须严格使用 "type": "JSFunction"，不能有任何多余空格
2. **JSExpression类型格式**：必须严格使用 "type": "JSExpression"，不能有任何多余空格
3. **参考正确格式**：请严格按照以下示例格式生成：
   - 正确：{"type": "JSFunction", "value": "function() {}"}
   - 错误：{"type": " JSFunction", "value": "function() {}"}
   - 错误：{"type": "JSFunction ", "value": "function() {}"}

🚨 **输出格式要求：必须严格按照以下JSON格式输出完整的schema，不允许省略任何字段：**

{
  "componentName": "Page",
  "id": "node_xxx",
  "props": {},
  "fileName": "页面文件名",
  "dataSource": {"list": []},
  "state": {"变量名": {"type": "JSExpression", "value": "初始值"}},
  "css": "页面样式",
  "lifeCycles": {"componentDidMount": {"type": "JSFunction", "value": "function componentDidMount() {}"}},
  "methods": {"方法名": {"type": "JSFunction", "value": "function 方法名() {}"}},
  "originCode": "完整的React组件代码",
  "hidden": false,
  "title": "",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "children": []
}

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

现在请根据用户需求生成对应的完整页面schema。`;
  }

  /**
   * 调用DeepSeek API生成schema (流式版本)
   * @param {string} userPrompt 用户输入的需求描述
   * @param {object} context 上下文信息（可选）
   * @param {function} onProgress 进度回调函数（可选）
   * @returns {Promise<object>} 生成的schema
   */
  async generateSchemaStream(userPrompt, context = {}, onProgress = null) {
    try {
      // 记录API调用开始时间
      const apiStartTime = Date.now();
      console.log('🚀 开始调用大模型API (流式)...');
      
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

      const requestData = {
        model: 'deepseek-ai/DeepSeek-V3',
        messages: messages,
        temperature: 0.3,
        max_tokens: 32000,
        stream: true // 启用流式输出
      };

      // 发送进度回调
      if (onProgress) {
        onProgress({
          type: 'progress',
          message: '正在连接AI服务...',
          timestamp: Date.now()
        });
      }

      console.log('🚀 [Silicon Flow API - generateSchemaStream] 发送流式请求');

      const response = await this.client.post('/v1/chat/completions', requestData, {
        ...this.defaultConfig,
        responseType: 'stream'
      });

      let fullContent = '';
      let buffer = '';

      // 发送进度回调
      if (onProgress) {
        onProgress({
          type: 'progress',
          message: '开始接收AI回答...',
          timestamp: Date.now()
        });
      }

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
                // 流式传输结束
                console.log('📥 [Silicon Flow API] 流式传输完成');
                
                try {
                  // 解析完整内容
                  const parsedResult = this.parseComplexSchema(fullContent);
                  let schema;
                  
                  if (parsedResult.componentsTree && Array.isArray(parsedResult.componentsTree) && parsedResult.componentsTree.length > 0) {
                    schema = parsedResult.componentsTree[0];
                  } else if (parsedResult.componentName) {
                    schema = parsedResult;
                  } else {
                    schema = parsedResult;
                  }

                  // 确保有ID
                  if (schema && typeof schema === 'object' && !schema.id) {
                    schema.id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  }

                  console.log('✅ Schema生成完成');
                  resolve(schema);
                } catch (parseError) {
                  console.error('🚨 Schema解析失败:', parseError);
                  reject(parseError);
                }
                return;
              }
              
              try {
                const jsonData = JSON.parse(data);
                if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                  const content = jsonData.choices[0].delta.content;
                  fullContent += content;
                  
                  // 发送逐字符进度回调 - 发送累积的完整内容以实现逐字符显示
                  if (onProgress) {
                    onProgress({
                      type: 'progress',
                      message: fullContent, // 发送累积内容，前端会直接替换显示
                      timestamp: Date.now()
                    });
                  }
                }
              } catch (parseError) {
                // 忽略JSON解析错误，继续处理下一行
              }
            }
          }
        });

        response.data.on('end', () => {
          if (fullContent) {
            try {
              const parsedResult = this.parseComplexSchema(fullContent);
              let schema;
              
              if (parsedResult.componentsTree && Array.isArray(parsedResult.componentsTree) && parsedResult.componentsTree.length > 0) {
                schema = parsedResult.componentsTree[0];
              } else if (parsedResult.componentName) {
                schema = parsedResult;
              } else {
                schema = parsedResult;
              }

              if (schema && typeof schema === 'object' && !schema.id) {
                schema.id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              }

              resolve(schema);
            } catch (parseError) {
              reject(parseError);
            }
          } else {
            reject(new Error('没有接收到有效的响应内容'));
          }
        });

        response.data.on('error', (error) => {
          console.error('🚨 流式响应错误:', error);
          reject(error);
        });
      });

    } catch (error) {
      console.error('🚨 Silicon Flow API调用失败:', error);
      throw error;
    }
  }

  /**
   * 调用DeepSeek API生成schema (非流式版本，保持向后兼容)
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

      const requestData = {
        model: 'deepseek-ai/DeepSeek-V3',
        messages: messages,
        temperature: 0.3,
        max_tokens: 32000, // 设置为合理的tokens数量，避免超出限制
        stream: false
      };

      // 打印请求参数
      console.log('🚀 [Silicon Flow API - generateSchema] 发送请求:');
      console.log('📍 URL:', `${this.baseURL}/v1/chat/completions`);
      console.log('📋 请求数据:', JSON.stringify({
        model: requestData.model,
        temperature: requestData.temperature,
        max_tokens: requestData.max_tokens,
        stream: requestData.stream,
        messages: requestData.messages.map((msg, index) => ({
          index,
          role: msg.role,
          content: msg.content ? `${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...(截断)' : ''}` : msg.content
        }))
      }, null, 2));
      console.log('⚙️ 请求配置:', JSON.stringify({
        baseURL: this.defaultConfig.baseURL,
        timeout: this.defaultConfig.timeout,
        headers: {
          'Content-Type': this.defaultConfig.headers['Content-Type'],
          'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`
        }
      }, null, 2));

      // 记录完整提示语到专门的日志文件
      await this.writeCompletePromptLog(userPrompt, messages, 'generateSchema');

      const response = await this.client.post('/v1/chat/completions', requestData, this.defaultConfig);

      // 打印响应数据
      console.log('📥 [Silicon Flow API - generateSchema] 收到响应:');
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

      // 记录API调用结束时间
      const apiEndTime = Date.now();
      const apiCallDuration = apiEndTime - apiStartTime;
      console.log(`🕒 大模型API调用耗时: ${apiCallDuration}ms`);

      const content = response.data.choices[0].message.content;
      
      // 打印AI模型的原始响应内容
      console.log('🔍 AI模型原始响应内容 (前1000字符):');
      console.log(content.substring(0, 1000));
      console.log('🔍 AI模型原始响应内容 (后1000字符):');
      console.log(content.substring(Math.max(0, content.length - 1000)));
      
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
      
      const components = [];
      
      // 优先读取fusion-ui目录下的组件
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
      
      // 注释掉fusion-lowcode-materials的读取，确保只使用fusion-ui组件
      // const fusionLowcodeDir = path.join(materialsDir, 'fusion-lowcode-materials');
      // if (fs.existsSync(fusionLowcodeDir)) {
      //   const fusionLowcodeFiles = fs.readdirSync(fusionLowcodeDir).filter(file => file.endsWith('.md'));
      //   fusionLowcodeFiles.forEach(file => {
      //     const componentName = file.replace('.md', '');
      //     components.push({
      //       name: componentName,
      //       category: 'fusion-lowcode-materials',
      //       file: file
      //     });
      //   });
      // }
      
      return components;
    } catch (error) {
      console.error('获取组件列表失败:', error);
      // 返回fusion-ui默认组件列表作为备用
      return [
        'button',
        'input',
        'pro-form',
        'form-item',
        'pro-table',
        'dialog',
        'select',
        'date-picker',
        'checkbox',
        'radio',
        'switch',
        'upload',
        'card',
        'tab',
        'collapse',
        'breadcrumb',
        'pagination',
        'row',
        'col',
        'box'
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
      
      // 3. 使用jsonrepair修复后再解析
      () => {
        const repairedJson = jsonrepair(cleanContent);
        return JSON.parse(repairedJson);
      },
      
      // 4. jsonrepair + JSON5组合解析
      () => {
        const repairedJson = jsonrepair(cleanContent);
        return JSON5.parse(repairedJson);
      },
      
      // 5. 移除注释后的JSON解析
      () => {
        const withoutComments = cleanContent
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
          .replace(/\/\/.*$/gm, '') // 移除行注释
          .replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
        return JSON.parse(withoutComments);
      },
      
      // 6. 处理JavaScript表达式的解析
      () => {
        let jsFixedContent = cleanContent
          // 处理对象和数组的字符串化问题
          .replace(/:\s*\[object Object\]/g, ': {}')
          .replace(/"\[object Object\]"/g, '{}')
          .replace(/,\s*\[object Object\]/g, ', {}')
          // 处理数组中的[object Object]
          .replace(/\[\s*\[object Object\](?:\s*,\s*\[object Object\])*\s*\]/g, '[{}]')
          // 修复JSFunction类型前面的空格问题 - 增强版本
          .replace(/"type":\s*"\s*JSFunction\s*"/g, '"type": "JSFunction"')
          .replace(/"type":\s*'\s*JSFunction\s*'/g, '"type": "JSFunction"')
          // 修复JSExpression类型的空格问题
          .replace(/"type":\s*"\s*JSExpression\s*"/g, '"type": "JSExpression"')
          .replace(/"type":\s*'\s*JSExpression\s*'/g, '"type": "JSExpression"')
          // 额外修复：处理type值开头有空格的情况
          .replace(/"type":\s*"\s+JSFunction"/g, '"type": "JSFunction"')
          .replace(/"type":\s*"\s+JSExpression"/g, '"type": "JSExpression"')
          // 处理originCode字段中的[object Object]问题
          .replace(/"originCode":\s*"[^"]*\[object Object\][^"]*"/g, (match) => {
            // 提取originCode的值并修复其中的[object Object]
            const codeMatch = match.match(/"originCode":\s*"([^"]*)"/);
            if (codeMatch) {
              let code = codeMatch[1];
              // 修复state中的[object Object]
              code = code.replace(/state\s*=\s*\{[^}]*\[object Object\][^}]*\}/g, 
                'state = { "loading": false, "data": [] }');
              return `"originCode": "${code}"`;
            }
            return match;
          })
          // 确保originCode与schema的state、methods保持一致
          .replace(/"originCode":\s*"([^"]*)"/g, (match, code) => {
            // 检查是否包含[object Object]并进行修复
            if (code.includes('[object Object]')) {
              // 替换state中的[object Object]为合理的默认值
              code = code.replace(/state\s*=\s*\{[^}]*\[object Object\][^}]*\}/g, 
                'state = {\\n    "loading": false,\\n    "data": [],\\n    "filterParams": {}\\n  }');
              // 替换其他位置的[object Object]
              code = code.replace(/\[object Object\]/g, '{}');
            }
            return `"originCode": "${code}"`;
          })
          // 处理JavaScript表达式，保持为字符串而不执行
          .replace(/:\s*([^",}\]]+\([^)]*\)[^",}\]]*)/g, ': "$1"')
          // 修复可能的语法错误
          .replace(/,(\s*[}\]])/g, '$1') // 移除尾随逗号
          .replace(/,\s*,/g, ','); // 移除重复逗号
        return JSON.parse(jsFixedContent);
      },
      
      // 7. 宽松的JSON5解析（处理更多边缘情况）
      () => {
        let relaxedContent = cleanContent
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // 为属性名添加引号
          .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2') // 为字符串值添加引号
          .replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
        return JSON5.parse(relaxedContent);
      },
      
      // 8. jsonrepair + 移除注释的组合解析
      () => {
        const withoutComments = cleanContent
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
          .replace(/\/\/.*$/gm, ''); // 移除行注释
        const repairedJson = jsonrepair(withoutComments);
        return JSON.parse(repairedJson);
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
     
     // 尝试使用jsonrepair修复并显示修复结果
     try {
       const repairedJson = jsonrepair(cleanContent);
       console.error('🔧 jsonrepair修复后内容 (前200字符):', repairedJson.substring(0, 200));
     } catch (repairError) {
       console.error('🔧 jsonrepair修复失败:', repairError.message);
     }
     
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
      const response = await this.client.get('/v1/models', this.defaultConfig);
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

  /**
   * 记录完整提示语到专门的日志文件
   */
  async writeCompletePromptLog(userPrompt, messages, method) {
    try {
      const timestamp = new Date().toISOString();
      const promptLogEntry = {
        timestamp,
        userPrompt,
        method,
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
      const promptLogFileName = `complete_prompts_silicon_flow.log`;
      const promptLogFilePath = path.join(this.logsDir, promptLogFileName);
      
      // 使用分隔符便于查看
      const logLine = JSON.stringify(promptLogEntry, null, 2) + '\n' + '---PROMPT_SEPARATOR---\n';
      await fs.promises.appendFile(promptLogFilePath, logLine, 'utf8');
      
      console.log(`📋 完整提示语已记录(SiliconFlow): 用户需求="${userPrompt.substring(0, 50)}..." 方法=${method} 消息数=${messages.length} 总长度=${promptLogEntry.totalPromptLength}`);
    } catch (error) {
      console.error('❌ 写入完整提示语日志文件失败:', error.message);
    }
  }

  /**
   * 获取物料源代码
   */
  async getMaterialSourceCode(materialName, libraryName) {
    const materialKey = `${libraryName}:${materialName}`;
    
    // 检查源码缓存
    if (this.sourceCodeCache.has(materialKey)) {
      console.log(`📋 从缓存获取 ${materialName} 源代码`);
      return this.sourceCodeCache.get(materialKey);
    }

    const sourceCode = {
      meta: null,
      snippets: null,
      source: null
    };

    // 读取物料源代码文件
    const basePath = libraryName === 'fusion-ui' 
      ? this.materialPaths.fusionUI 
      : this.materialPaths.fusionLowcodeMaterials;
    
    sourceCode.source = await this.readSourceFiles(basePath, materialName);

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
}

module.exports = SiliconFlowService;