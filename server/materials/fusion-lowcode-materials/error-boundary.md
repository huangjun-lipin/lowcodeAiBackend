# ErrorBoundary

## 基本信息

- **组件名称**: ErrorBoundary
- **组件标题**: ErrorBoundary
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: ConfigProvider

## 组件描述

ErrorBoundary组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| children | instanceOf | - |  |
| afterCatch | func | - | 捕获错误后的自定义处理, 比如埋点上传
@param {Object} error 错误
@param {Object} errorInfo 错误详细信息 |
| fallbackUI | func | - | 捕获错误后的展现 自定义组件
@param {Object} error 错误
@param {Object} errorInfo 错误详细信息
@returns {Element} 捕获错误后的处理 |
| style | object | - |  |


