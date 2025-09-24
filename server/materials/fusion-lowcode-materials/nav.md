# 导航

## 基本信息

- **组件名称**: Nav
- **组件标题**: 导航
- **组件分组**: 原子组件
- **组件分类**: 引导
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Nav

## 组件描述

导航组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| style | object | - |  |
| children | node | - | 导航项和子导航 |
| type | oneOf: normal | primary | secondary | line | normal | 导航类型 |
| direction | oneOf: hoz | ver | ver | 导航布局 |
| hozAlign | oneOf: left | right | left | 对齐方向 |
| activeDirection | oneOf:  | top | bottom | left | right | - | 选中条方向 |
| mode | oneOf: inline | popup | inline | 子导航打开的模式 |
| triggerType | oneOf: click | hover | click | 子导航打开的触发方式 |
| inlineIndent | number | 20 | 内联子导航缩进距离 |
| defaultOpenAll | bool | false | 初始展开所有的子导航 |
| openMode | oneOf: single | multiple | multiple | 内联子导航的展开模式 |
| selectedKeys | oneOfType: string | [object Object] | - | 当前选中导航key值 |
| defaultSelectedKeys | oneOfType: string | [object Object] | - | 初始选中导航项的key值 |
| onSelect | func | - | 选中或取消选中导航项触发的回调函数
@param {Array} selectedKeys 选中的所有导航项的 key
@param {Object} item 选中或取消选中的导航项
@param {Object} extra 额外参数
@param {Boolean} extra.select 是否是选中
@param {Array} extra.key 导航项的 key
@param {Object} extra.label 导航项的文本
@param {Array} extra.keyPath 导航项 key 的路径 |
| popupAlign | oneOf: follow | outside | follow | 弹出子导航的对齐方式（水平导航只支持 follow ）
@eumdesc Item 顶端对齐, Nav 顶端对齐 |
| popupClassName | string | - | 弹出子导航的自定义类名 |
| iconOnly | bool | - | 是否只显示图标 |
| hasArrow | bool | true | 是否显示右侧的箭头 |
| hasTooltip | bool | false | 是否有ToolTips |
| header | instanceOf | - | 自定义导航头部 |
| footer | instanceOf | - | 自定义导航尾部 |
| embeddable | bool | false | 开启嵌入式模式 |



## 容器配置

- ✅ 可作为容器组件
