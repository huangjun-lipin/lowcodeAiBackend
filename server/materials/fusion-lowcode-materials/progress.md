# 进度指示器

## 基本信息

- **组件名称**: Progress
- **组件标题**: 进度指示器
- **组件分组**: 原子组件
- **组件分类**: 信息反馈
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Progress

## 组件描述

进度指示器组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| shape | oneOf: circle | line | line | 形态 |
| size | oneOf: small | medium | large | medium | 尺寸 |
| percent | number | 0 | 所占百分比 |
| state | oneOf: normal | success | error | normal | 进度状态, 显示优先级: color > progressive > state |
| progressive | bool | false | 是否为色彩阶段变化模式, 显示优先级: color > progressive > state |
| hasBorder | bool | false | 是否添加 Border（只适用于 Line Progress) |
| textRender | func | - | 文本渲染函数
@param {Number} percent 当前的进度信息
@param {Object} option 额外的参数
@property {Boolean} option.rtl 是否在rtl 模式下渲染
@return {ReactNode} 返回文本节点 |
| color | string | - | 进度条颜色, 显示优先级: color > progressive > state |
| backgroundColor | string | - | 背景色 |
| rtl | bool | - |  |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| rtl |  | - |  |
| prefix |  | - |  |
| percent | 百分比 | NumberSetter |  |
| color | 进度条颜色 | ColorSetter |  |
| backgroundColor | 背景色 | ColorSetter |  |




## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ondition | event | - | dition 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

