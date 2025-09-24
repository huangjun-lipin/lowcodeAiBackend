# 需求占位

## 基本信息

- **组件名称**: RichText
- **组件标题**: 需求占位
- **组件分组**: 精选组件
- **组件分类**: 基础元素
- **NPM包**: @alilc/lowcode-materials
- **导出名**: RichText

## 组件描述

需求占位组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| style |  | - |  |
| maxHeight | 最大高度 | NumberSetter | 最大高度 |
| content | 需求内容 | EditSetter |  |




## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onResizeStart | event | - | ResizeStart 事件处理函数 |
| onResize | event | - | Resize 事件处理函数 |
| onResizeEnd | event | - | ResizeEnd 事件处理函数 |


## 核心接口定义

### IContent

```typescript
interface IContent {
  aone?: {;
  url: string;
  priorityId: string;
  project: { id: string;
}
```

### IRichTextProps

```typescript
interface IRichTextProps {
  content?: IContent | string;
  className?: string;
  maxHeight?: string;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| content | IContent \| string | 否 | - | - |
| className | string | 否 | - | - |
| maxHeight | string | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| title | function | - |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

