# 文档生成脚本使用说明

本目录包含用于生成和增强组件文档的脚本工具。

## 脚本列表

### 1. analyze-component-source.js
**核心源码分析工具**

- 提供 `ComponentAnalyzer` 类用于分析组件源码
- 提供 `DocumentationGenerator` 类用于生成 Markdown 文档
- 支持分析接口、属性、方法、事件、Hooks 等
- 被其他脚本作为基础工具使用

### 2. generate-docs-with-analysis.js ⭐
**集成文档生成脚本（推荐使用）**

这是最新的集成脚本，结合了文档生成和源码分析功能。

#### 功能特性
- 自动创建基础文档模板
- 集成源码分析功能
- 支持批量处理组件
- 提供统计报告
- 支持更新现有文档

#### 使用方法
```bash
# 生成所有组件文档（包含源码分析）
node generate-docs-with-analysis.js generate

# 更新现有组件文档的源码分析
node generate-docs-with-analysis.js update

# 查看帮助信息
node generate-docs-with-analysis.js help
```

#### 支持的组件包
- **fusion-ui**: pro-table, pro-form, pro-dialog, anchor, page-header
- **fusion-lowcode-materials**: balloon, div, link, next-table, next-text, note-wrapper, rich-text, video

### 3. enhance-docs.js
**Fusion UI 文档增强脚本**

专门用于增强 fusion-ui 组件的文档，添加源码分析内容。

```bash
node enhance-docs.js
```

### 4. enhance-lowcode-docs.js
**Fusion Lowcode Materials 文档增强脚本**

专门用于增强 fusion-lowcode-materials 组件的文档，添加源码分析内容。

```bash
node enhance-lowcode-docs.js
```

## 推荐工作流程

### 新项目或完整重新生成
```bash
# 使用集成脚本生成所有文档
node generate-docs-with-analysis.js generate
```

### 更新现有文档
```bash
# 只更新源码分析部分
node generate-docs-with-analysis.js update
```

### 针对特定组件包
```bash
# 只处理 fusion-ui 组件
node enhance-docs.js

# 只处理 fusion-lowcode-materials 组件
node enhance-lowcode-docs.js
```

## 配置说明

所有脚本的配置都可以在脚本文件顶部的 `CONFIG` 对象中修改：

- `sourceRoot`: 源码根目录
- `docsRoot`: 文档输出目录
- `componentConfigs`: 组件配置，包括源码路径、文档路径和组件列表

## 注意事项

1. **权限**: 确保脚本有执行权限 (`chmod +x script-name.js`)
2. **路径**: 所有路径都使用绝对路径，确保在任何目录下都能正确运行
3. **备份**: 建议在批量处理前备份现有文档
4. **依赖**: 确保 Node.js 环境和相关依赖已安装

## 故障排除

### 常见问题

1. **源码分析失败**
   - 检查组件源码路径是否正确
   - 确认组件文件存在且可读

2. **文档生成失败**
   - 检查文档目录权限
   - 确认目标目录存在

3. **脚本执行权限问题**
   ```bash
   chmod +x script-name.js
   ```

### 调试模式

在脚本中添加更多日志输出来调试问题：
```javascript
console.log('调试信息:', variable);
```