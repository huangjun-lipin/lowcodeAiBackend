# 步骤项

## 基本信息

- **组件名称**: Step.Item
- **组件标题**: 步骤项
- **组件分组**: 原子组件
- **组件分类**: null
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Step

## 组件描述

步骤项组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| icon | string | - | 图标 |
| title | instanceOf | - | 标题 |
| content | instanceOf | - | 内容填充, shape为 arrow 时无效 |
| status | oneOf: wait | process | finish | - | 步骤的状态，如不传，会根据外层的 Step 的 current 属性生成，可选值为 `wait`, `process`, `finish` |
| percent | number | - | 百分比 |
| disabled | bool | - | 是否禁用 |
| onClick | func | - | 点击步骤时的回调
@param {Number} index 节点索引 |
| className | string | - | 自定义样式 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| title | 标题 | StringSetter |  |
| icon | 图标 | IconSetter |  |
| content | 内容 | TextAreaSetter |  |
| status | 状态 | RadioGroupSetter |  |


