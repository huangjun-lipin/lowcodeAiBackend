# 时间轴

## 基本信息

- **组件名称**: Timeline
- **组件标题**: 时间轴
- **组件分组**: 原子组件
- **组件分类**: 信息展示
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Timeline

## 组件描述

时间轴组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| fold | arrayOf |  | 自定义折叠选项 示例`[{foldArea: [startIndex, endIndex], foldShow: boolean}]` |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| items | 时间轴数据 | ArraySetter |  |



## 容器配置

- ✅ 可作为容器组件
- 嵌套规则: {"childWhitelist":["Timeline.Item"]}


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| updateChildren | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ondition | event | - | dition 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

