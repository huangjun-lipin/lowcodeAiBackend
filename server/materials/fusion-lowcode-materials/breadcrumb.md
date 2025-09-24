# 面包屑

## 基本信息

- **组件名称**: Breadcrumb
- **组件标题**: 面包屑
- **组件分组**: 原子组件
- **组件分类**: 引导
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Breadcrumb

## 组件描述

面包屑组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- | 样式类名的品牌前缀 |
| rtl | bool | - |  |
| children | instanceOf | - | 面包屑子节点，需传入 Breadcrumb.Item |
| maxNode | oneOfType: number | [object Object] | 100 | 面包屑最多显示个数，超出部分会被隐藏, 设置为 auto 会自动根据父元素的宽度适配。 |
| separator | instanceOf | - | 分隔符，可以是文本或 Icon |
| component | oneOfType: string | func | nav | 设置标签类型 |
| className | any | - |  |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| maxNode | 最大节点数 | NumberSetter |  |
| separator | 分隔符 | StringSetter |  |
| Breadcrumb.Item | 面包屑项 | ArraySetter |  |


## 支持的功能

- ✅ 样式配置

## 容器配置

- ✅ 可作为容器组件
- 嵌套规则: {"childWhitelist":["Breadcrumb.Item"]}


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onChange | event | - | Change 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

