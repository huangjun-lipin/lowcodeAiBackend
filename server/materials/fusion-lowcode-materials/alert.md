# 提示

## 基本信息

- **组件名称**: Message
- **组件标题**: 提示
- **组件分组**: 原子组件
- **组件分类**: 信息反馈
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Message

## 组件描述

提示组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| className | string | - |  |
| style | object | - |  |
| title | string | 标题 | 标题 |
| type | oneOf: success | warning | error | notice | help | loading | success | 反馈类型 |
| shape | oneOf: inline | addon | toast | inline | 外观 |
| size | oneOf: medium | large | medium | 尺寸 |
| children | oneOfType: string | node | - | 内容 |
| visible | bool | - | 当前是否显示 |
| iconType | string | - | 显示的图标类型，会覆盖内部设置的IconType |
| closeable | bool | false | 显示关闭按钮 |
| onClose | func | - | 关闭按钮的回调 |
| afterClose | func | - | 关闭之后调用的函数 |
| animation | bool | true | 收起动画 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| iconType | 图标 | IconSetter |  |



## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

