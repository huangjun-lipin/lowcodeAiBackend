# 对话框

## 基本信息

- **组件名称**: Dialog
- **组件标题**: 对话框
- **组件分组**: 原子组件
- **组件分类**: 布局容器类
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Dialog

## 组件描述

对话框组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| id | string | - |  |
| visible | oneOfType: JSExpression | bool | false | 是否显示 |
| title | oneOfType: string | node | - | 标题 |
| children | oneOfType: bool | [object Object] | - | 内容 |
| footer | oneOfType: bool | - | 底部按钮 |
| footerAlign | oneOf: left | center | right | right | 操作对齐方式 |
| closeable | oneOf: close | mask | esc,close | close,esc,mask | esc | esc,close | 关闭方式 |
| onClose | func | - | 对话框关闭时触发的回调函数
@param {String} trigger 关闭触发行为的描述字符串
@param {Object} event 关闭时事件对象 |
| hasMask | bool | true | 是否显示遮罩 |
| animation | oneOfType: object | bool | - | 显示隐藏时动画的播放方式
@property {String} in 进场动画
@property {String} out 出场动画 |
| autoFocus | bool | false | 是否获得焦点 |
| isFullScreen | bool | false | 是否全屏 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| title | 标题 | StringSetter |  |
| visible | 是否显示 | BoolSetter |  |
| hasMask | 显示遮罩 | BoolSetter |  |
| closeMode | 关闭方式 | SelectSetter |  |
| autoFocus | 自动聚焦 | BoolSetter |  |
| **底部按钮配置** | 分组 | - | 属性分组 |
| footer | 是否显示 | BoolSetter |  |
| footerAlign | 对齐方式 | RadioGroupSetter |  |
| footerActions | 排列方式 | SelectSetter |  |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| onOk | onOk 事件 |
| onCancel | onCancel 事件 |
| onClose | onClose 事件 |


## 容器配置

- ✅ 可作为容器组件
- ✅ 模态框组件
- 嵌套规则: {"parentWhitelist":["Page"]}


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| layoutBlockNode | function | 为目标元素包裹一层 Block |
| targetId | function | 找到要拖入进去的节点 ID |
| wrapWithBlock | function | - |
| wrapWithP | function | - |
| layoutBlockNode | function | 为目标元素包裹一层 Block |
| targetId | function | 找到要拖入进去的节点 ID |
| wrapWithBlock | function | - |
| wrapWithP | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ondition | event | - | dition 事件处理函数 |
| onNodeAdd | event | - | NodeAdd 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

