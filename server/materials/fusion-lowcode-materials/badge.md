# 徽标数

## 基本信息

- **组件名称**: Badge
- **组件标题**: 徽标数
- **组件分组**: 原子组件
- **组件分类**: 信息展示
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Badge

## 组件描述

徽标数组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| className | string | - |  |
| style | object | - |  |
| count | string | 0 | 展示的数字，大于 overflowCount 时显示为 ${overflowCount}+，为 0 时默认隐藏 |
| content | node | - | 自定义节点内容 |
| overflowCount | oneOfType: number | string | 99 | 展示的封顶的数字 |
| showZero | bool | true | 当count为 0 时，是否显示 count |
| dot | bool | false | 不展示数字，只展示一个小红点 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| count | 展示的数字 | MixedSetter |  |



## 容器配置

- ✅ 可作为容器组件

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

