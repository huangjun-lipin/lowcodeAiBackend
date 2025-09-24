# Lowcode Materials Server

创建一个简单的用户信息表单，包含姓名和邮箱字段，搜索后下方是一个列表，列表里面包含几列最后一列是操作列支持增删改，下方是分页，表中填充模拟的数据

lowcode-demo/demo-workspace/src/services/defaultPageSchema.json。 lowcode-demo/demo-basic-fusion/src/services/schema.json参考这两个demo 的schema继续完善大模型生成schema的上下文：dataSource是数据源定义接口；state里面定义页面绑定变量，lifeCycles里面是生命周期函数；methods里面是定义的页面绑定函数；特别注意originCode里面是对应的js面板里的代码，其与state、methods、lifeCycles里的代码一一对应上

基于 Express.js 的低代码物料后端服务，集成硅基流动的 DeepSeek 大模型，为低代码引擎提供 AI 驱动的 schema 生成能力。

## 功能特性

- 🤖 **AI Schema 生成**: 基于自然语言描述生成低代码引擎 schema
- 🔌 **DeepSeek 集成**: 使用硅基流动的 DeepSeek 大模型
- 📦 **物料管理**: 提供可用物料组件列表
- 🛡️ **错误处理**: 完善的错误处理和日志记录
- 🔍 **健康检查**: API 服务状态监控

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API 接口

### 生成 Schema

**POST** `/api/ai/generate-schema`

根据用户的自然语言描述生成低代码引擎 schema。

**请求体：**
```json
{
  "prompt": "创建一个登录表单，包含用户名和密码输入框",
  "currentSchema": {}, // 可选：当前页面的 schema
  "materials": [] // 可选：指定可用的物料组件
}
```

**响应：**
```json
{
  "success": true,
  "message": "已根据您的需求生成页面结构",
  "schema": {
    "componentName": "NextForm",
    "id": "node_1234567890",
    "props": {},
    "children": []
  },
  "timestamp": 1234567890
}
```

### 获取物料列表

**GET** `/api/ai/materials`

获取所有可用的物料组件列表。

**响应：**
```json
{
  "success": true,
  "materials": [
    "NextButton",
    "NextInput",
    "NextForm",
    // ...
  ],
  "count": 20,
  "timestamp": 1234567890
}
```

### 健康检查

**GET** `/api/ai/health`

检查 DeepSeek API 服务是否可用。

**响应：**
```json
{
  "success": true,
  "healthy": true,
  "service": "DeepSeek API",
  "timestamp": 1234567890
}
```

### 服务状态

**GET** `/api/ai/status`

获取 AI 服务的配置状态。

**响应：**
```json
{
  "success": true,
  "status": {
    "configured": true,
    "baseURL": "https://api.deepseek.com",
    "availableMaterials": 20,
    "version": "1.0.0"
  },
  "timestamp": 1234567890
}
```

## 支持的物料组件

当前支持的 Fusion Design 组件：

### 基础组件
- `NextButton` - 按钮
- `NextInput` - 输入框
- `NextSelect` - 选择器
- `NextCheckbox` - 复选框
- `NextRadio` - 单选框
- `NextSwitch` - 开关

### 表单组件
- `NextForm` - 表单容器
- `NextFormItem` - 表单项
- `NextDatePicker` - 日期选择器
- `NextUpload` - 文件上传

### 数据展示
- `NextTable` - 表格
- `NextCard` - 卡片
- `NextTabs` - 标签页
- `NextCollapse` - 折叠面板

### 反馈组件
- `NextDialog` - 对话框

### 导航组件
- `NextBreadcrumb` - 面包屑
- `NextPagination` - 分页

### 布局组件
- `NextRow` - 行容器
- `NextCol` - 列容器
- `NextBox` - 盒子容器

## 开发说明

### 项目结构

```
server/
├── index.js              # 服务器入口文件
├── package.json           # 项目配置
├── .env.example          # 环境变量示例
├── routes/
│   └── ai.js             # AI 相关路由
├── services/
│   └── siliconFlowService.js # Silicon Flow API 集成服务
└── README.md             # 项目说明
```

### 添加新的物料组件

1. 在 `services/siliconFlowService.js` 的 `getAvailableMaterials()` 方法中添加新组件
2. 在 `getSystemPrompt()` 方法中更新组件说明
3. 确保组件名称遵循 `Next` 前缀规范

### 自定义 Prompt

可以通过修改 `services/siliconFlowService.js` 中的 `getSystemPrompt()` 方法来优化 AI 生成的效果：

- 调整组件描述和使用场景
- 添加更多的示例和约束条件
- 优化 JSON 格式要求

## 部署

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

构建和运行：

```bash
docker build -t lowcode-materials-server .
docker run -p 3001:3001 --env-file .env lowcode-materials-server
```

### 环境变量

生产环境需要配置的环境变量：

- `DEEPSEEK_API_KEY`: DeepSeek API 密钥（必需）
- `DEEPSEEK_BASE_URL`: DeepSeek API 基础 URL
- `PORT`: 服务端口（默认 3001）
- `NODE_ENV`: 运行环境（production）
- `ALLOWED_ORIGINS`: 允许的跨域来源

## 故障排除

### 常见问题

1. **DeepSeek API 调用失败**
   - 检查 API 密钥是否正确配置
   - 确认网络连接正常
   - 查看 API 配额是否充足

2. **CORS 错误**
   - 检查 `ALLOWED_ORIGINS` 环境变量配置
   - 确认前端请求地址在允许列表中

3. **生成的 Schema 格式错误**
   - 检查 DeepSeek 返回的内容
   - 调整 system prompt 中的格式要求
   - 增加 JSON 解析的容错处理

### 日志查看

服务器会输出详细的请求和错误日志，包括：

- API 请求记录
- DeepSeek 调用状态
- Schema 生成结果
- 错误堆栈信息

## 许可证

MIT License