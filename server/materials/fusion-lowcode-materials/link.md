# 链接

## 基本信息

- **组件名称**: Link
- **组件标题**: 链接
- **组件分组**: 原子组件
- **组件分类**: 通用
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Link

## 组件描述

链接组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| href | string | https://fusion.design | [object Object] |
| children | oneOfType: string | node | 这是一个超链接 | [object Object] |
| style | object | - |  |
| target | oneOf: _blank | _self | - | [object Object] |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| children | 链接文案 | StringSetter |  |
| !configType | 配置方式 | RadioGroupSetter |  |
| behavior | 交互设置 | BehaviorSetter |  |
| target | 页面目标 | RadioGroupSetter |  |
| href | 跳转链接 | StringSetter |  |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| onClick | onClick 事件 |


## 容器配置

- ✅ 可作为容器组件


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ondition | event | - | dition 事件处理函数 |


## 核心接口定义

### LinkProps

```typescript
interface LinkProps {
  target?: string;
  children?: string;
  href?: string;
  style?: object;
  __designMode?: string;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| target | string | 否 | - | - |
| children | string | 否 | - | - |
| href | string | 否 | - | - |
| style | object | 否 | - | - |
| __designMode | string | 否 | - | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onClick | event | - | Click 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

