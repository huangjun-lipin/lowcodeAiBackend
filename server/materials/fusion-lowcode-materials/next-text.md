# 文本

## 基本信息

- **组件名称**: NextText
- **组件标题**: 文本
- **组件分组**: 精选组件
- **组件分类**: 基础元素
- **NPM包**: @alilc/lowcode-materials
- **导出名**: NextText

## 组件描述

文本组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| style | object | - |  |
| prefix | string | next- |  |
| classname | bool | true |  |
| type | any | body2 | 字体大小 |
| children | string | - |  |
| mark | bool | false | 添加标记样式 |
| code | bool | false | 添加代码样式 |
| delete | bool | false | 添加删除线样式 |
| underline | bool | false | 添加下划线样式 |
| strong | bool | false | 是否加粗 |
| onClick | func | - | 鼠标点击 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| prefix |  | - |  |
| classname |  | - |  |
| children | 文本内容 | TextAreaSetter |  |




## 核心接口定义

### TextProps

```typescript
interface TextProps {
  prefix?: string;
  className?: string;
  children?: React.ReactNode;
  delete?: boolean;
  mark?: boolean;
  underline?: boolean;
  strong?: boolean;
  code?: boolean;
  component?: React.ElementType;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| prefix | string | 否 | - | - |
| className | string | 否 | - | - |
| children | React.ReactNode | 否 | - | - |
| delete | boolean | 否 | - | - |
| mark | boolean | 否 | - | - |
| underline | boolean | 否 | - | - |
| strong | boolean | 否 | - | - |
| code | boolean | 否 | - | - |
| component | React.ElementType | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| createTitle | function | - |
| isProduction | function | - |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

