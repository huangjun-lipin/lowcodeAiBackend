# 抽屉

## 基本信息

- **组件名称**: Drawer
- **组件标题**: 抽屉
- **组件分组**: 原子组件
- **组件分类**: 布局容器类
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Drawer

## 组件描述

抽屉组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| id | string | - |  |
| prefix | string | next- | [object Object] |
| style | object | - |  |
| rtl | bool | - |  |
| width | oneOfType: number | string | - | 宽度，仅在 placement是 left right 的时候生效 |
| height | oneOfType: number | string | - | 高度，仅在 placement是 top bottom 的时候生效 |
| placement | oneOf: top | right | bottom | left | right | 位于页面的位置 |
| title | oneOfType: string | node | - | 标题 |
| headerStyle | object | - | header上的样式 |
| bodyStyle | object | - | body上的样式 |
| visible | bool | - | 是否显示 |
| hasMask | bool | true | 是否显示遮罩 |
| onVisibleChange | func | - |  |
| animation | bool | - | 显示隐藏时动画的播放方式
@property {String} in 进场动画
@property {String} out 出场动画 |
| closeable | oneOfType: string | bool | true | 控制对话框关闭的方式，值可以为字符串或者布尔值，其中字符串是由以下值组成：
**close** 表示点击关闭按钮可以关闭对话框
**mask** 表示点击遮罩区域可以关闭对话框
**esc** 表示按下 esc 键可以关闭对话框
如 'close' 或 'close,esc,mask'
如果设置为 true，则以上关闭方式全部生效
如果设置为 false，则以上关闭方式全部失效 |
| onClose | func | - | 对话框关闭时触发的回调函数
@param {String} trigger 关闭触发行为的描述字符串
@param {Object} event 关闭时事件对象 |
| popupContainer | any | - | 弹层容器
@param {Element} target 目标元素
@return {Element} 弹层的容器元素 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| title | 标题 | StringSetter | 标题 |
| width | 宽度 | NumberSetter | 宽度，仅在 placement是 left right 的时候生效 |
| height | 高度 | NumberSetter | 高度，仅在 placement是 top bottom 的时候生效 |
| placement | 弹出位置 | RadioGroupSetter | 位于页面的位置 |
| visible | 是否显示 | BoolSetter | 是否显示 |
| hasMask | 显示遮罩 | BoolSetter | 是否显示遮罩 |
| closeable | 显示遮罩 | BoolSetter | 控制对话框关闭的方式，值可以为字符串或者布尔值，其中字符串是由以下值组成：
**close** 表示点击关闭按钮可以关闭对话框
**mask** 表示点击遮罩区域可以关闭对话框
**esc** 表示按下 esc 键可以关闭对话框
如 'close' 或 'close,esc,mask'
如果设置为 true，则以上关闭方式全部生效
如果设置为 false，则以上关闭方式全部失效 |



## 容器配置

- ✅ 可作为容器组件
- ✅ 模态框组件
- 嵌套规则: {}


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
| onNodeAdd | event | - | NodeAdd 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

